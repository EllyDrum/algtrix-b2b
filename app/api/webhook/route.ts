import { NextResponse } from 'next/server'
import { getPaymentAdapter } from '@/lib/payments/mock-adapter'

/**
 * Endpoint de webhook do provedor de pagamento. Enquanto nenhum
 * provedor real estiver configurado, verifyWebhookSignature() sempre
 * retorna false e nenhum evento é processado — evitando confiar em
 * chamadas não autenticadas.
 *
 * TODO(Elli): quando o provedor for definido, validar a assinatura real
 * (ex.: cabeçalho x-signature do Mercado Pago, Stripe-Signature) e
 * processar o evento de pagamento aprovado aqui.
 */
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature')

  const adapter = getPaymentAdapter()
  const isValid = adapter.verifyWebhookSignature(rawBody, signature)

  if (!isValid) {
    return NextResponse.json({ error: 'Assinatura inválida ou provedor não configurado' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
