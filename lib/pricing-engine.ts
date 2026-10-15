import { PORTES, SECOES, STATS_UF, UF_NOME, SECAO_NOME, type PorteCodigo } from './catalog'
import type { Contagem } from './catalog/stats-uf'

/**
 * Motor de preço do Algtrix B2B: recortes por UF ou por município.
 * Usado no navegador (prévia) e no servidor (valor cobrado). O servidor
 * sempre recalcula — nenhum valor vindo do cliente é aceito.
 */

export interface ItemRecorte {
  uf: string
  /** Código do município na Receita (ex.: '6477' = Guarulhos). Ausente = todo o estado. */
  municipio?: string
  /** Nome do município, só para exibição (o servidor confere pelo código). */
  municipioNome?: string
  /** Letras das seções CNAE. Vazio = todos os segmentos. */
  secoes: string[]
  /** Portes incluídos. Vazio = todos (ME, EPP e Demais). */
  portes: PorteCodigo[]
  /** Inclui MEI no recorte. Padrão: false. */
  incluirMei: boolean
}

/** Valor de entrada (centavos) e faixas regressivas por empresa adicional. */
export const PRECO_ENTRADA_CENTAVOS = 1990
export const EMPRESAS_INCLUIDAS_NA_ENTRADA = 2000
export const FAIXAS: { ate: number; centavosPorEmpresa: number }[] = [
  { ate: 10_000, centavosPorEmpresa: 0.4 },
  { ate: 100_000, centavosPorEmpresa: 0.1 },
  { ate: 1_000_000, centavosPorEmpresa: 0.02 },
  { ate: Number.POSITIVE_INFINITY, centavosPorEmpresa: 0.002 },
]

/** Desconto progressivo por quantidade de itens no carrinho. */
export const DESCONTOS_CARRINHO: { minItens: number; percentual: number }[] = [{ minItens: 2, percentual: 5 }]

export const MAX_ITENS_CARRINHO = 20

export function normalizarItem(item: ItemRecorte): ItemRecorte {
  const secoesValidas = new Set(SECOES.map((s) => s.codigo))
  const portesValidos = new Set<string>(PORTES.map((p) => p.codigo))
  const secoes = Array.from(new Set(item.secoes.filter((s) => secoesValidas.has(s)))).sort()
  const portes = Array.from(new Set(item.portes.filter((p) => portesValidos.has(p)))).sort() as PorteCodigo[]
  const municipio = item.municipio && /^\d{1,7}$/.test(item.municipio) ? item.municipio : undefined
  return {
    uf: item.uf,
    ...(municipio ? { municipio, municipioNome: item.municipioNome?.slice(0, 80) } : {}),
    secoes: secoes.length === SECOES.length ? [] : secoes,
    portes: portes.length === PORTES.length ? [] : portes,
    incluirMei: Boolean(item.incluirMei),
  }
}

export function validarItem(item: unknown): ItemRecorte | null {
  if (!item || typeof item !== 'object') return null
  const raw = item as Record<string, unknown>
  if (typeof raw.uf !== 'string' || !STATS_UF[raw.uf]) return null
  const secoes = Array.isArray(raw.secoes) ? raw.secoes.filter((s): s is string => typeof s === 'string') : []
  const portes = Array.isArray(raw.portes) ? raw.portes.filter((p): p is PorteCodigo => typeof p === 'string') : []
  return normalizarItem({
    uf: raw.uf,
    municipio: typeof raw.municipio === 'string' ? raw.municipio : undefined,
    municipioNome: typeof raw.municipioNome === 'string' ? raw.municipioNome : undefined,
    secoes,
    portes,
    incluirMei: raw.incluirMei === true,
  })
}

/** Estatísticas de um município: nome e contagens por seção CNAE [ME, EPP, Demais, MEI]. */
export interface StatsMunicipio {
  /** Nome como está na base da Receita (maiúsculas, sem acento). */
  n: string
  /** Nome acentuado (tabela de municípios), quando encontrado. */
  a?: string
  s: Record<string, Contagem>
}
/** Municípios de uma UF, indexados pelo código da Receita. */
export type MunicipiosUf = Record<string, StatsMunicipio>
/** Municípios carregados, por UF (o navegador busca sob demanda; o servidor importa). */
export type MunicipiosPorUf = Record<string, MunicipiosUf | undefined>

/**
 * Quantidade exata de empresas do recorte, a partir das estatísticas da base.
 * Para recortes por município, é preciso informar as estatísticas da UF correspondente.
 */
export function contarEmpresas(item: ItemRecorte, municipios?: MunicipiosUf): number {
  const stats = item.municipio ? municipios?.[item.municipio]?.s : STATS_UF[item.uf]
  if (!stats) return 0
  const secoes = item.secoes.length ? item.secoes : Object.keys(stats)
  const idx = (item.portes.length ? item.portes : PORTES.map((p) => p.codigo)).map((p) =>
    p === 'ME' ? 0 : p === 'EPP' ? 1 : 2,
  )
  let total = 0
  for (const s of secoes) {
    const c = stats[s]
    if (!c) continue
    for (const i of idx) total += c[i]
    if (item.incluirMei) total += c[3]
  }
  return total
}

/** Preço em centavos para um recorte com `n` empresas. */
export function precoPorQuantidade(n: number): number {
  if (n <= 0) return 0
  let valor = PRECO_ENTRADA_CENTAVOS
  let anterior = EMPRESAS_INCLUIDAS_NA_ENTRADA
  for (const faixa of FAIXAS) {
    if (n <= anterior) break
    const quantidade = Math.min(n, faixa.ate) - anterior
    valor += quantidade * faixa.centavosPorEmpresa
    anterior = faixa.ate
  }
  // Arredonda para cima até o próximo final ",90" (preço de vitrine).
  const reais = Math.ceil((valor - 90) / 100)
  return Math.max(PRECO_ENTRADA_CENTAVOS, reais * 100 + 90)
}

export function descontoPercentual(qtdItens: number): number {
  return DESCONTOS_CARRINHO.find((d) => qtdItens >= d.minItens)?.percentual ?? 0
}

export interface ItemCotado extends ItemRecorte {
  empresas: number
  precoCentavos: number
  descricao: string
}

export interface Cotacao {
  itens: ItemCotado[]
  subtotalCentavos: number
  descontoPercentual: number
  descontoCentavos: number
  totalCentavos: number
  totalEmpresas: number
}

/** Nome da cidade para exibição: acentuado quando disponível. */
export function nomeCidade(m: { n: string; a?: string }): string {
  return m.a ?? tituloCidade(m.n)
}

export function tituloCidade(nome: string): string {
  if (nome !== nome.toUpperCase()) return nome // já está com grafia correta
  const minusculas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', "d'"])
  return nome
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && minusculas.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

export function descreverItem(item: ItemRecorte): string {
  const partes = [
    item.municipio && item.municipioNome
      ? `${tituloCidade(item.municipioNome)} (${item.uf})`
      : `${UF_NOME[item.uf] ?? item.uf} (${item.uf})`,
  ]
  partes.push(
    item.secoes.length ? item.secoes.map((s) => SECAO_NOME[s] ?? s).join(', ') : 'Todos os segmentos',
  )
  partes.push(
    item.portes.length
      ? item.portes.map((p) => PORTES.find((x) => x.codigo === p)?.codigo ?? p).join(', ')
      : 'ME, EPP e Demais',
  )
  partes.push(item.incluirMei ? 'com MEI' : 'sem MEI')
  return partes.join(' · ')
}

export function chaveItem(item: ItemRecorte): string {
  return [item.uf, item.municipio ?? '', item.secoes.join(''), item.portes.join(','), item.incluirMei ? 'mei' : 'semmei'].join('|')
}

export function cotar(itens: ItemRecorte[], municipios: MunicipiosPorUf = {}): Cotacao {
  const vistos = new Set<string>()
  const cotados: ItemCotado[] = []
  for (const bruto of itens.slice(0, MAX_ITENS_CARRINHO)) {
    let item = normalizarItem(bruto)
    if (item.municipio) {
      const mun = municipios[item.uf]?.[item.municipio]
      if (!mun) continue // município desconhecido ou estatística não carregada
      item = { ...item, municipioNome: nomeCidade(mun) } // o nome exibido vem sempre da base
    }
    const chave = chaveItem(item)
    if (vistos.has(chave)) continue
    vistos.add(chave)
    const empresas = contarEmpresas(item, municipios[item.uf])
    if (empresas <= 0) continue
    cotados.push({ ...item, empresas, precoCentavos: precoPorQuantidade(empresas), descricao: descreverItem(item) })
  }
  const subtotal = cotados.reduce((s, i) => s + i.precoCentavos, 0)
  const pct = descontoPercentual(cotados.length)
  const desconto = Math.round((subtotal * pct) / 100)
  return {
    itens: cotados,
    subtotalCentavos: subtotal,
    descontoPercentual: pct,
    descontoCentavos: desconto,
    totalCentavos: subtotal - desconto,
    totalEmpresas: cotados.reduce((s, i) => s + i.empresas, 0),
  }
}

export function formatarBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarNumero(n: number): string {
  return n.toLocaleString('pt-BR')
}
