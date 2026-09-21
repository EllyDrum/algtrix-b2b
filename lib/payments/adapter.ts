/**
 * Interface de adapter de pagamento. Cada provedor real (Mercado Pago,
 * Stripe, Hotmart/Kiwify) implementa esta interface em seu próprio
 * arquivo (ex.: mercadopago-adapter.ts) sem alterar as rotas de API que
 * o consomem. Hoje apenas o MockPaymentAdapter está implementado.
 */
export interface CheckoutSessionInput {
  productName: string
  priceCents: number
  currency: string
  customerEmail?: string
}

export interface CheckoutSessionResult {
  checkoutUrl: string
  sessionId: string
}

export interface PaymentAdapter {
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean
}
