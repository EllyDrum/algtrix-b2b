import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Integração com o Mercado Pago (Checkout Pro: Pix, cartão e boleto).
 * Variáveis de ambiente (servidor): MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET.
 */

const API = 'https://api.mercadopago.com'

function token(): string {
  const t = process.env.MP_ACCESS_TOKEN
  if (!t) throw new Error('MP_ACCESS_TOKEN não configurado')
  return t
}

export interface PreferenciaInput {
  pedidoId: string
  email: string
  nome?: string
  itens: { id: string; titulo: string; precoCentavos: number }[]
  descontoCentavos: number
  urlRetorno: string
  urlNotificacao: string
}

/** Cria a preferência de pagamento e devolve o link do checkout. */
export async function criarPreferencia(input: PreferenciaInput): Promise<{ id: string; initPoint: string }> {
  // O desconto do carrinho é distribuído proporcionalmente entre os itens,
  // para que a soma cobrada seja exatamente o total do pedido.
  const subtotal = input.itens.reduce((s, i) => s + i.precoCentavos, 0)
  let restante = input.descontoCentavos
  const itens = input.itens.map((item, idx) => {
    const ultimo = idx === input.itens.length - 1
    const desconto = ultimo ? restante : Math.floor((input.descontoCentavos * item.precoCentavos) / subtotal)
    restante -= desconto
    return {
      id: item.id,
      title: item.titulo.slice(0, 250),
      quantity: 1,
      currency_id: 'BRL',
      unit_price: (item.precoCentavos - desconto) / 100,
    }
  })

  const res = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.pedidoId,
    },
    body: JSON.stringify({
      items: itens,
      payer: { email: input.email, name: input.nome },
      external_reference: input.pedidoId,
      notification_url: input.urlNotificacao,
      back_urls: { success: input.urlRetorno, pending: input.urlRetorno, failure: input.urlRetorno },
      auto_return: 'approved',
      statement_descriptor: 'ALGTRIX B2B',
      // Checkout Pro usado somente para cartão de crédito (o Pix é gerado na própria página do pedido).
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }, { id: 'debit_card' }],
        installments: 12,
      },
    }),
  })
  if (!res.ok) throw new Error(`Mercado Pago: falha ao criar preferência (HTTP ${res.status}) ${await res.text()}`)
  const data = (await res.json()) as { id: string; init_point: string }
  return { id: data.id, initPoint: data.init_point }
}

export interface PixInput {
  pedidoId: string
  valorCentavos: number
  email: string
  nome?: string
  documento?: string
  descricao: string
  urlNotificacao: string
  minutosValidade?: number
  /** Diferencia novas tentativas do mesmo pedido (chave de idempotência). */
  tentativa?: number
}

/** Cria uma cobrança Pix (Checkout Transparente) e devolve o QR Code para exibir no site. */
export async function criarPagamentoPix(input: PixInput): Promise<{
  id: string
  qrCode: string
  qrCodeBase64: string
  expiraEm: string
}> {
  const expira = new Date(Date.now() + (input.minutosValidade ?? 30) * 60_000)
  const payer: Record<string, unknown> = { email: input.email }
  if (input.nome) payer.first_name = input.nome.split(' ')[0]
  if (input.documento) {
    payer.identification = { type: input.documento.length === 14 ? 'CNPJ' : 'CPF', number: input.documento }
  }
  const res = await fetch(`${API}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `${input.pedidoId}-pix-${input.tentativa ?? 1}`,
    },
    body: JSON.stringify({
      transaction_amount: input.valorCentavos / 100,
      description: input.descricao.slice(0, 250),
      payment_method_id: 'pix',
      payer,
      external_reference: input.pedidoId,
      notification_url: input.urlNotificacao,
      date_of_expiration: expira.toISOString().replace('Z', '-00:00'),
    }),
  })
  if (!res.ok) throw new Error(`Mercado Pago: falha ao criar Pix (HTTP ${res.status}) ${await res.text()}`)
  const data = (await res.json()) as {
    id: number
    point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } }
  }
  const td = data.point_of_interaction?.transaction_data
  if (!td?.qr_code || !td.qr_code_base64) throw new Error('Mercado Pago: QR Code do Pix não retornado')
  return { id: String(data.id), qrCode: td.qr_code, qrCodeBase64: td.qr_code_base64, expiraEm: expira.toISOString() }
}

export interface PagamentoMP {
  id: number
  status: string
  external_reference: string | null
  transaction_amount: number
  date_approved: string | null
}

/** Consulta o pagamento diretamente na API (fonte da verdade, nunca o corpo do webhook). */
export async function consultarPagamento(id: string): Promise<PagamentoMP> {
  if (!/^\d+$/.test(id)) throw new Error('ID de pagamento inválido')
  const res = await fetch(`${API}/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token()}` } })
  if (!res.ok) throw new Error(`Mercado Pago: falha ao consultar pagamento ${id} (HTTP ${res.status})`)
  return (await res.json()) as PagamentoMP
}

/**
 * Valida o cabeçalho x-signature conforme a documentação do Mercado Pago:
 * manifesto `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` com HMAC-SHA256.
 */
export function assinaturaValida(params: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): boolean {
  const segredo = process.env.MP_WEBHOOK_SECRET
  if (!segredo || !params.xSignature) return false
  let ts = ''
  let v1 = ''
  for (const parte of params.xSignature.split(',')) {
    const [k, v] = parte.split('=', 2).map((s) => s?.trim())
    if (k === 'ts') ts = v ?? ''
    if (k === 'v1') v1 = v ?? ''
  }
  if (!ts || !v1) return false
  let manifesto = ''
  if (params.dataId) manifesto += `id:${params.dataId.toLowerCase()};`
  if (params.xRequestId) manifesto += `request-id:${params.xRequestId};`
  manifesto += `ts:${ts};`
  const calculado = createHmac('sha256', segredo).update(manifesto).digest('hex')
  const a = Buffer.from(calculado)
  const b = Buffer.from(v1)
  return a.length === b.length && timingSafeEqual(a, b)
}
