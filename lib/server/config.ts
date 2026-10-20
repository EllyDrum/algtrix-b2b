import { pagamentoSimuladoPermitido } from './site'
import { pixEstaticoConfigurado } from '../payments/pix-brcode'
import { stripeConfigurado } from '../payments/stripe'

/** Entrega dos arquivos: armazenamento (R2 ou pasta local em testes) e segredos internos. */
const ENTREGA = ['ORDER_TOKEN_SECRET', 'INTERNAL_SECRET', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']

export function mercadoPagoConfigurado(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET)
}

/** Lista o que falta para a entrega funcionar (só nomes de variáveis, nunca valores). */
export function pendenciasDeEntrega(): string[] {
  let exigidas = ENTREGA
  if (process.env.R2_LOCAL_DIR) exigidas = exigidas.filter((v) => !v.startsWith('R2_'))
  return exigidas.filter((nome) => !process.env[nome])
}

export interface StatusLoja {
  vendasAtivas: boolean
  /** Cartão de crédito disponível (Stripe ou Mercado Pago). */
  cartao: boolean
  /** Quem processa o cartão. A Stripe tem prioridade quando as duas estão configuradas. */
  cartaoProvedor: 'stripe' | 'mercadopago' | null
  /** Como o Pix é cobrado: pelo Mercado Pago (confirmação automática) ou direto na chave da empresa. */
  pix: 'mercadopago' | 'estatico' | null
  /** Dados exibidos ao cliente no pagamento Pix. */
  beneficiario: { nome: string; chave: string } | null
}

export function statusLoja(): StatusLoja {
  const entregaOk = pendenciasDeEntrega().length === 0
  const mp = mercadoPagoConfigurado()
  const estatico = pixEstaticoConfigurado()
  const simulado = pagamentoSimuladoPermitido()
  const stripe = stripeConfigurado()
  // MP_SOMENTE_CARTAO=1: o Mercado Pago cobra só o cartão; o Pix continua na chave estática da empresa.
  const mpSomenteCartao = process.env.MP_SOMENTE_CARTAO === '1'
  const pix = mp && !(mpSomenteCartao && estatico) ? 'mercadopago' : estatico ? 'estatico' : null
  const cartaoProvedor = stripe ? 'stripe' : mp ? 'mercadopago' : null
  return {
    vendasAtivas: entregaOk && (simulado || pix !== null || cartaoProvedor !== null),
    cartao: cartaoProvedor !== null || simulado,
    cartaoProvedor,
    pix: pix ?? (simulado ? 'estatico' : null),
    beneficiario:
      process.env.PIX_NOME && process.env.PIX_CHAVE ? { nome: process.env.PIX_NOME, chave: process.env.PIX_CHAVE } : null,
  }
}

export function vendasAtivas(): boolean {
  return statusLoja().vendasAtivas
}
