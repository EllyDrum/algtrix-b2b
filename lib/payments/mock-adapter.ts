import type { CheckoutSessionInput, CheckoutSessionResult, PaymentAdapter } from './adapter'

/**
 * Adapter de desenvolvimento. NÃO processa pagamento real — apenas
 * simula uma sessão de checkout e redireciona para a página de
 * confirmação. Trocar por um adapter real (Mercado Pago, Stripe, etc.)
 * quando o provedor for definido, respeitando a mesma interface.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const sessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return {
      sessionId,
      checkoutUrl: `/obrigado?session=${sessionId}&mock=1&amount=${input.priceCents}`,
    }
  }

  verifyWebhookSignature(): boolean {
    // Sem provedor real configurado — nenhum webhook deve ser confiado.
    return false
  }
}

export function getPaymentAdapter(): PaymentAdapter {
  // TODO(Elli): quando o provedor for escolhido, retornar o adapter real
  // com base em process.env.PAYMENT_PROVIDER.
  return new MockPaymentAdapter()
}
