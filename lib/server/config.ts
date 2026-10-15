import { pagamentoSimuladoPermitido } from './site'

/** Variáveis obrigatórias para vender online (pagamento real, links de pedido e entrega dos arquivos). */
const OBRIGATORIAS = [
  'MP_ACCESS_TOKEN',
  'MP_WEBHOOK_SECRET',
  'ORDER_TOKEN_SECRET',
  'INTERNAL_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
]

/** Lista o que falta configurar (só nomes de variáveis, nunca valores). */
export function pendenciasDeConfiguracao(): string[] {
  let exigidas = OBRIGATORIAS
  if (pagamentoSimuladoPermitido()) exigidas = exigidas.filter((v) => !v.startsWith('MP_'))
  if (process.env.R2_LOCAL_DIR) exigidas = exigidas.filter((v) => !v.startsWith('R2_'))
  return exigidas.filter((nome) => !process.env[nome])
}

export function vendasAtivas(): boolean {
  return pendenciasDeConfiguracao().length === 0
}
