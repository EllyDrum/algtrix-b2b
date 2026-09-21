import { NextResponse } from 'next/server'
import { pricing, PRICING_IS_PLACEHOLDER } from '@/config/pricing'
import { product } from '@/config/product'
import { getPaymentAdapter } from '@/lib/payments/mock-adapter'

/**
 * Cria uma sessão de checkout. O preço é sempre lido do servidor a
 * partir de config/pricing.ts — nunca aceito do corpo da requisição —
 * para impedir manipulação de preço pelo cliente.
 */
export async function POST() {
  if (PRICING_IS_PLACEHOLDER || pricing.priceCents === null) {
    return NextResponse.json(
      { error: 'Preço ainda não configurado. Defina config/pricing.ts antes de habilitar o checkout.' },
      { status: 409 },
    )
  }

  const adapter = getPaymentAdapter()
  const session = await adapter.createCheckoutSession({
    productName: product.name,
    priceCents: pricing.priceCents,
    currency: pricing.currency,
  })

  return NextResponse.json({ checkoutUrl: session.checkoutUrl, sessionId: session.sessionId })
}
