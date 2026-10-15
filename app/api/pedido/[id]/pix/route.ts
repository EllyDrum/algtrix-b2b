import { NextResponse } from 'next/server'
import { lerPedido, salvarPedido, tokenValido } from '@/lib/server/pedidos'
import { criarPagamentoPix } from '@/lib/payments/mercadopago'
import { urlDoSite } from '@/lib/server/site'

export const dynamic = 'force-dynamic'

/** Gera um novo QR Code Pix quando o anterior expirou ou o cliente trocou do cartão para o Pix. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = new URL(request.url).searchParams.get('t')
  if (!tokenValido(params.id, token)) return NextResponse.json({ error: 'Link inválido' }, { status: 404 })
  const pedido = await lerPedido(params.id)
  if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (!['aguardando_pagamento', 'cancelado'].includes(pedido.status)) {
    return NextResponse.json({ error: 'Este pedido não aceita novo pagamento.' }, { status: 409 })
  }
  if (pedido.pix && pedido.metodo === 'pix' && new Date(pedido.pix.expiraEm).getTime() > Date.now() + 60_000) {
    return NextResponse.json({ ok: true, reaproveitado: true })
  }
  try {
    const pix = await criarPagamentoPix({
      pedidoId: pedido.id,
      valorCentavos: pedido.totalCentavos,
      email: pedido.email,
      nome: pedido.nome,
      documento: pedido.documento,
      descricao: `Algtrix B2B - pedido ${pedido.id}`,
      urlNotificacao: `${urlDoSite()}/api/webhook?source_news=webhooks`,
      tentativa: Math.floor(Date.now() / 60_000),
    })
    pedido.metodo = 'pix'
    pedido.status = 'aguardando_pagamento'
    pedido.pagamento = { provedor: 'mercadopago', id: pix.id, status: 'pending' }
    pedido.pix = { pagamentoId: pix.id, qrCode: pix.qrCode, qrCodeBase64: pix.qrCodeBase64, expiraEm: pix.expiraEm }
    await salvarPedido(pedido)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('novo pix: erro', pedido.id, e)
    return NextResponse.json({ error: 'Não foi possível gerar o Pix agora. Tente novamente.' }, { status: 502 })
  }
}
