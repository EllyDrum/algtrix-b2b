import { NextResponse } from 'next/server'
import { assinaturaStripeValida, consultarSessao } from '@/lib/payments/stripe'
import { lerPedido } from '@/lib/server/pedidos'
import { aplicarSessaoStripe } from '@/lib/server/stripe-sync'

export const dynamic = 'force-dynamic'

/**
 * Webhook da Stripe. Fluxo:
 * 1. valida a assinatura Stripe-Signature sobre o corpo bruto;
 * 2. para eventos de Checkout, consulta a sessão na API (nunca confia no corpo);
 * 3. se paga e o valor confere, marca o pedido como pago e aciona a geração.
 * Idempotente: eventos repetidos não geram o pedido duas vezes.
 */
export async function POST(request: Request) {
  const corpo = await request.text()
  if (!assinaturaStripeValida(corpo, request.headers.get('stripe-signature'))) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let evento: { type?: string; data?: { object?: { id?: string; object?: string; client_reference_id?: string | null; metadata?: Record<string, string> } } }
  try {
    evento = JSON.parse(corpo)
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const tipo = evento.type ?? ''
  const objeto = evento.data?.object
  if (!tipo.startsWith('checkout.session.') || objeto?.object !== 'checkout.session' || !objeto.id) {
    return NextResponse.json({ ignorado: true })
  }

  try {
    const sessao = await consultarSessao(objeto.id)
    const pedidoId = sessao.client_reference_id ?? sessao.metadata?.pedidoId
    if (!pedidoId) return NextResponse.json({ ignorado: true })
    const pedido = await lerPedido(pedidoId)
    if (!pedido) return NextResponse.json({ ignorado: true })
    await aplicarSessaoStripe(pedido, sessao)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('webhook stripe: erro', e)
    // 500 faz a Stripe reenviar o evento mais tarde.
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
