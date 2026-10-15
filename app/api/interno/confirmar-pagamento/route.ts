import { NextResponse } from 'next/server'
import { chaveAdminValida } from '@/lib/server/admin'
import { lerPedido, salvarPedido } from '@/lib/server/pedidos'
import { acionarGeracao } from '@/lib/server/site'

export const dynamic = 'force-dynamic'

/**
 * Confirma manualmente o recebimento de um Pix feito direto na chave da empresa
 * (conferido no extrato) e dispara a geração dos arquivos. Exige INTERNAL_SECRET.
 */
export async function POST(request: Request) {
  if (!chaveAdminValida(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { pedidoId } = (await request.json().catch(() => ({}))) as { pedidoId?: string }
  const pedido = pedidoId ? await lerPedido(pedidoId) : null
  if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (!['aguardando_pagamento', 'cancelado', 'erro'].includes(pedido.status)) {
    return NextResponse.json({ ok: true, status: pedido.status })
  }
  if (pedido.status !== 'erro') {
    pedido.status = 'pago'
    pedido.pagamento = {
      provedor: pedido.pagamento?.provedor ?? 'pix-estatico',
      id: pedido.pagamento?.id,
      status: 'approved',
      aprovadoEm: new Date().toISOString(),
    }
  }
  await salvarPedido(pedido)
  await acionarGeracao(pedido.id)
  return NextResponse.json({ ok: true, status: pedido.status })
}
