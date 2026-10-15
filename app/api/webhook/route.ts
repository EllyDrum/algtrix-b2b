import { NextResponse } from 'next/server'
import { assinaturaValida, consultarPagamento } from '@/lib/payments/mercadopago'
import { lerPedido, salvarPedido } from '@/lib/server/pedidos'
import { acionarGeracao } from '@/lib/server/site'

export const dynamic = 'force-dynamic'

/**
 * Webhook do Mercado Pago. Fluxo:
 * 1. valida a assinatura x-signature;
 * 2. consulta o pagamento na API do Mercado Pago (nunca confia no corpo);
 * 3. se aprovado e o valor confere, marca o pedido como pago e aciona a geração.
 * Idempotente: notificações repetidas não geram o pedido duas vezes.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const corpo = (await request.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } }
  const tipo = url.searchParams.get('type') ?? corpo.type
  const dataId = url.searchParams.get('data.id') ?? (corpo.data?.id != null ? String(corpo.data.id) : null)

  if (tipo !== 'payment' || !dataId) return NextResponse.json({ ignorado: true })

  const valida = assinaturaValida({
    xSignature: request.headers.get('x-signature'),
    xRequestId: request.headers.get('x-request-id'),
    dataId,
  })
  if (!valida) return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })

  try {
    const pagamento = await consultarPagamento(dataId)
    const pedidoId = pagamento.external_reference
    if (!pedidoId) return NextResponse.json({ ignorado: true })
    const pedido = await lerPedido(pedidoId)
    if (!pedido) return NextResponse.json({ ignorado: true })

    if (pagamento.status !== 'approved') {
      if (pedido.pix && pedido.pix.pagamentoId !== String(pagamento.id) && pedido.metodo === 'pix') {
        return NextResponse.json({ ignorado: true }) // notificação de um Pix antigo já substituído
      }
      pedido.pagamento = { ...pedido.pagamento, provedor: 'mercadopago', id: String(pagamento.id), status: pagamento.status }
      const ehPagamentoAtual = !pedido.pix || pedido.pix.pagamentoId === String(pagamento.id)
      if (
        ehPagamentoAtual &&
        ['cancelled', 'rejected', 'refunded', 'charged_back'].includes(pagamento.status) &&
        pedido.status === 'aguardando_pagamento'
      ) {
        pedido.status = 'cancelado'
      }
      await salvarPedido(pedido)
      return NextResponse.json({ ok: true })
    }

    const pagoCentavos = Math.round(pagamento.transaction_amount * 100)
    if (pagoCentavos + 1 < pedido.totalCentavos) {
      console.error('webhook: valor pago menor que o pedido', pedidoId, pagoCentavos, pedido.totalCentavos)
      pedido.status = 'erro'
      pedido.erro = 'Valor pago diferente do valor do pedido'
      await salvarPedido(pedido)
      return NextResponse.json({ ok: true })
    }

    if (pedido.status === 'aguardando_pagamento' || pedido.status === 'cancelado') {
      pedido.status = 'pago'
      pedido.pagamento = {
        provedor: 'mercadopago',
        id: String(pagamento.id),
        status: pagamento.status,
        aprovadoEm: pagamento.date_approved ?? new Date().toISOString(),
      }
      await salvarPedido(pedido)
      await acionarGeracao(pedido.id)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('webhook: erro', e)
    // 500 faz o Mercado Pago reenviar a notificação mais tarde.
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
