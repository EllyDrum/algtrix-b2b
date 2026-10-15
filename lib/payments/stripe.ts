import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Integração com a Stripe (Checkout hospedado, somente cartão de crédito, com parcelamento).
 * Variáveis de ambiente (servidor): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
 * Sem dependência de SDK: a API da Stripe é REST com corpo form-urlencoded.
 */

const API = process.env.STRIPE_API_URL ?? 'https://api.stripe.com/v1'

function chave(): string {
  const k = process.env.STRIPE_SECRET_KEY
  if (!k) throw new Error('STRIPE_SECRET_KEY não configurada')
  return k
}

export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
}

/** Serializa um objeto aninhado no formato aceito pela Stripe: a[b][0][c]=valor. */
function formEncode(obj: Record<string, unknown>, prefixo = '', out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const nome = prefixo ? `${prefixo}[${k}]` : k
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === 'object') formEncode(item as Record<string, unknown>, `${nome}[${i}]`, out)
        else out.append(`${nome}[${i}]`, String(item))
      })
    } else if (typeof v === 'object') {
      formEncode(v as Record<string, unknown>, nome, out)
    } else {
      out.append(nome, String(v))
    }
  }
  return out
}

async function stripe<T>(caminho: string, opts: { method?: 'GET' | 'POST'; body?: Record<string, unknown>; idempotencia?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${chave()}` }
  if (opts.idempotencia) headers['Idempotency-Key'] = opts.idempotencia
  let body: string | undefined
  if (opts.body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = formEncode(opts.body).toString()
  }
  const res = await fetch(`${API}${caminho}`, { method: opts.method ?? (opts.body ? 'POST' : 'GET'), headers, body })
  if (!res.ok) throw new Error(`Stripe: HTTP ${res.status} em ${caminho}: ${(await res.text()).slice(0, 400)}`)
  return (await res.json()) as T
}

export interface SessaoInput {
  pedidoId: string
  email: string
  itens: { id: string; titulo: string; precoCentavos: number }[]
  descontoCentavos: number
  urlRetorno: string
}

export interface SessaoStripe {
  id: string
  url: string | null
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  status: 'open' | 'complete' | 'expired'
  amount_total: number | null
  currency: string | null
  client_reference_id: string | null
  payment_intent: string | null
  metadata?: Record<string, string>
}

/** Cria a sessão do Checkout (cartão, BRL, parcelado) e devolve o link de pagamento. */
export async function criarSessaoCheckout(input: SessaoInput): Promise<{ id: string; url: string }> {
  // O desconto do carrinho é distribuído entre os itens para que a soma seja exatamente o total do pedido.
  const subtotal = input.itens.reduce((s, i) => s + i.precoCentavos, 0)
  let restante = input.descontoCentavos
  const lineItems = input.itens.map((item, idx) => {
    const ultimo = idx === input.itens.length - 1
    const desconto = ultimo ? restante : Math.floor((input.descontoCentavos * item.precoCentavos) / subtotal)
    restante -= desconto
    return {
      quantity: 1,
      price_data: {
        currency: 'brl',
        unit_amount: item.precoCentavos - desconto,
        product_data: { name: item.titulo.slice(0, 250) },
      },
    }
  })

  const sessao = await stripe<SessaoStripe>('/checkout/sessions', {
    idempotencia: `${input.pedidoId}-checkout`,
    body: {
      mode: 'payment',
      locale: 'pt-BR',
      customer_email: input.email,
      client_reference_id: input.pedidoId,
      // As formas de pagamento são definidas no painel da Stripe (Configurações > Formas de pagamento):
      // deixar ativo somente Cartões. A API atual não aceita mais payment_method_types.
      payment_method_options: { card: { installments: { enabled: true } } },
      line_items: lineItems,
      success_url: input.urlRetorno,
      cancel_url: input.urlRetorno,
      metadata: { pedidoId: input.pedidoId },
      payment_intent_data: {
        description: `Algtrix B2B - pedido ${input.pedidoId}`,
        metadata: { pedidoId: input.pedidoId },
      },
      // Mínimo permitido pela Stripe: 30 minutos.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  })
  if (!sessao.url) throw new Error('Stripe: sessão criada sem URL de checkout')
  return { id: sessao.id, url: sessao.url }
}

/** Consulta a sessão diretamente na API (fonte da verdade, nunca o corpo do webhook). */
export async function consultarSessao(id: string): Promise<SessaoStripe> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) throw new Error('ID de sessão inválido')
  return stripe<SessaoStripe>(`/checkout/sessions/${id}`)
}

/**
 * Valida o cabeçalho Stripe-Signature (t=<ts>,v1=<hmac>): HMAC-SHA256 de `${ts}.${corpo}`
 * com o segredo do endpoint, tolerando 5 minutos de diferença de relógio.
 */
export function assinaturaStripeValida(corpoBruto: string, cabecalho: string | null, toleranciaSeg = 300): boolean {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET
  if (!segredo || !cabecalho) return false
  let ts = ''
  const v1s: string[] = []
  for (const parte of cabecalho.split(',')) {
    const [k, v] = parte.split('=', 2).map((s) => s?.trim())
    if (k === 't') ts = v ?? ''
    if (k === 'v1' && v) v1s.push(v)
  }
  if (!ts || !v1s.length) return false
  if (Math.abs(Date.now() / 1000 - Number(ts)) > toleranciaSeg) return false
  const esperado = Buffer.from(createHmac('sha256', segredo).update(`${ts}.${corpoBruto}`).digest('hex'))
  return v1s.some((v1) => {
    const recebido = Buffer.from(v1)
    return recebido.length === esperado.length && timingSafeEqual(recebido, esperado)
  })
}
