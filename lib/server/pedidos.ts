import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import type { Cotacao, ItemCotado } from '../pricing-engine'

/**
 * Pedidos guardados no Netlify Blobs (um JSON por pedido).
 * Um pedido só é escrito pelo checkout (criação) e depois pelo webhook e pela
 * função de geração — fluxo sequencial, sem concorrência de escrita.
 */

export type StatusPedido = 'aguardando_pagamento' | 'pago' | 'gerando' | 'concluido' | 'erro' | 'cancelado'

export interface ArquivoEntregue {
  indiceItem: number
  chave: string
  nomeArquivo: string
  bytes: number
  linhas: number
  formatos: string[]
  /** Arquivos individuais para download direto (Excel, PDF e CSV compactado). */
  downloads?: { formato: 'XLSX' | 'PDF' | 'CSV'; chave: string; nomeArquivo: string; bytes: number }[]
}

export interface Pedido {
  id: string
  criadoEm: string
  atualizadoEm: string
  status: StatusPedido
  email: string
  nome?: string
  documento?: string
  itens: ItemCotado[]
  subtotalCentavos: number
  descontoPercentual: number
  descontoCentavos: number
  totalCentavos: number
  competencia: string
  metodo?: 'pix' | 'cartao'
  pagamento?: { provedor: string; id?: string; status?: string; aprovadoEm?: string }
  /** Cobrança Pix gerada na hora (QR Code exibido na página do pedido). */
  pix?: { pagamentoId: string; qrCode: string; qrCodeBase64: string; expiraEm: string }
  arquivos: ArquivoEntregue[]
  erro?: string
  emailEnviado?: boolean
}

function store() {
  return getStore({ name: 'pedidos', consistency: 'strong' })
}

function segredo(): string {
  const s = process.env.ORDER_TOKEN_SECRET
  if (!s || s.length < 24) throw new Error('ORDER_TOKEN_SECRET ausente ou curto (mínimo 24 caracteres)')
  return s
}

export function novoIdPedido(): string {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `ALG-${data}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export function tokenPedido(id: string): string {
  return createHmac('sha256', segredo()).update(`pedido:${id}`).digest('base64url').slice(0, 32)
}

export function tokenValido(id: string, token: string | null | undefined): boolean {
  if (!token) return false
  const esperado = Buffer.from(tokenPedido(id))
  const recebido = Buffer.from(token)
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido)
}

export async function criarPedido(dados: {
  email: string
  nome?: string
  documento?: string
  cotacao: Cotacao
  competencia: string
}): Promise<Pedido> {
  const agora = new Date().toISOString()
  const pedido: Pedido = {
    id: novoIdPedido(),
    criadoEm: agora,
    atualizadoEm: agora,
    status: 'aguardando_pagamento',
    email: dados.email,
    nome: dados.nome,
    documento: dados.documento,
    itens: dados.cotacao.itens,
    subtotalCentavos: dados.cotacao.subtotalCentavos,
    descontoPercentual: dados.cotacao.descontoPercentual,
    descontoCentavos: dados.cotacao.descontoCentavos,
    totalCentavos: dados.cotacao.totalCentavos,
    competencia: dados.competencia,
    arquivos: [],
  }
  await store().setJSON(pedido.id, pedido, { onlyIfNew: true })
  return pedido
}

export async function lerPedido(id: string): Promise<Pedido | null> {
  if (!/^ALG-\d{8}-[0-9A-F]{8}$/.test(id)) return null
  return (await store().get(id, { type: 'json' })) as Pedido | null
}

export async function salvarPedido(pedido: Pedido): Promise<void> {
  pedido.atualizadoEm = new Date().toISOString()
  await store().setJSON(pedido.id, pedido)
}
