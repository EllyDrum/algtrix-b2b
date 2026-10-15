import { consultarSessao, type SessaoStripe } from '../payments/stripe'
import { salvarPedido, type Pedido } from './pedidos'
import { acionarGeracao } from './site'

/**
 * Aplica ao pedido o estado de uma sessão do Checkout da Stripe. Idempotente:
 * um pedido já pago/gerado não é alterado nem gerado de novo.
 * Devolve true quando o pedido mudou.
 */
export async function aplicarSessaoStripe(pedido: Pedido, sessao: SessaoStripe): Promise<boolean> {
  if (pedido.pagamento?.provedor !== 'stripe' || pedido.pagamento.id !== sessao.id) return false

  if (sessao.payment_status === 'paid') {
    if ((sessao.currency ?? 'brl').toLowerCase() !== 'brl' || (sessao.amount_total ?? 0) + 1 < pedido.totalCentavos) {
      console.error('stripe: valor pago diferente do pedido', pedido.id, sessao.amount_total, pedido.totalCentavos)
      pedido.status = 'erro'
      pedido.erro = 'Valor pago diferente do valor do pedido'
      await salvarPedido(pedido)
      return true
    }
    if (pedido.status === 'aguardando_pagamento' || pedido.status === 'cancelado') {
      pedido.status = 'pago'
      pedido.pagamento = {
        provedor: 'stripe',
        id: sessao.id,
        status: 'approved',
        aprovadoEm: new Date().toISOString(),
      }
      await salvarPedido(pedido)
      await acionarGeracao(pedido.id)
      return true
    }
    return false
  }

  if (sessao.status === 'expired' && pedido.status === 'aguardando_pagamento') {
    pedido.status = 'cancelado'
    pedido.pagamento = { ...pedido.pagamento, status: 'expired' }
    await salvarPedido(pedido)
    return true
  }
  return false
}

/**
 * Usado pela página do pedido: quando o cliente volta da Stripe antes de o webhook
 * chegar, consulta a sessão e libera o pedido na hora.
 */
export async function sincronizarStripe(pedido: Pedido): Promise<Pedido> {
  if (pedido.status !== 'aguardando_pagamento' || pedido.pagamento?.provedor !== 'stripe' || !pedido.pagamento.id) return pedido
  try {
    const sessao = await consultarSessao(pedido.pagamento.id)
    await aplicarSessaoStripe(pedido, sessao)
  } catch (e) {
    console.warn('stripe: falha ao sincronizar sessão', pedido.id, e)
  }
  return pedido
}
