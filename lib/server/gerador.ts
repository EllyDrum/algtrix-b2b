import { parquetMetadataAsync, parquetRead } from 'hyparquet'
import { compressors } from 'hyparquet-compressors'
import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from 'fflate'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'node:stream'
import { COMPETENCIA, PARTES_UF, PORTES, secaoDoCnae, UF_NOME, SECAO_NOME } from '../catalog'
import type { ItemRecorte } from '../pricing-engine'
import { headObject, MultipartUpload, parquetBufferR2, putObject } from './r2'
import type { ArquivoEntregue } from './pedidos'

/** Acima deste volume o arquivo é entregue só em CSV (o XLSX fica pesado e o Excel limita 1.048.576 linhas). */
export const LIMITE_XLSX = 100_000
/** O PDF traz a lista completa até este volume; acima, traz o resumo e as primeiras linhas. */
export const LIMITE_PDF_LINHAS = 5_000

const COLUNAS_LIDAS = [
  'cnpj', 'razao_social', 'nome_fantasia', 'data_inicio_atividade', 'cnae_principal', 'descricao_cnae_principal',
  'cnaes_secundarios', 'natureza_juridica', 'porte_empresa', 'capital_social', 'tipo_logradouro', 'logradouro',
  'numero', 'complemento', 'bairro', 'cep', 'municipio', 'uf', 'ddd_1', 'telefone_1', 'ddd_2', 'telefone_2',
  'email', 'competencia_receita', 'codigo_municipio_receita',
] as const

type Linha = Record<(typeof COLUNAS_LIDAS)[number], string | null>

const CABECALHO = [
  'CNPJ', 'Razão social', 'Nome fantasia', 'Data de abertura', 'CNAE principal', 'Descrição do CNAE principal',
  'CNAEs secundários', 'Segmento', 'Natureza jurídica', 'Porte', 'MEI', 'Capital social (R$)', 'Logradouro',
  'Número', 'Complemento', 'Bairro', 'CEP', 'Município', 'UF', 'Telefone 1', 'Telefone 2', 'E-mail',
  'Fonte',
]

const PORTE_NOME: Record<string, string> = { '01': 'ME', '03': 'EPP', '05': 'Demais' }

function formatarCnpj(c: string | null): string {
  if (!c) return ''
  if (c.length !== 14) return c
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`
}

function formatarData(d: string | null): string {
  return d && d.length === 8 ? `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}` : ''
}

function telefone(ddd: string | null, numero: string | null): string {
  if (!numero || /^0+$/.test(numero)) return ''
  return ddd && !/^0+$/.test(ddd) ? `(${ddd}) ${numero}` : numero
}

function transformar(l: Linha, secao: string, mei: boolean): string[] {
  return [
    formatarCnpj(l.cnpj),
    l.razao_social ?? '',
    l.nome_fantasia ?? '',
    formatarData(l.data_inicio_atividade),
    l.cnae_principal ?? '',
    l.descricao_cnae_principal ?? '',
    l.cnaes_secundarios ?? '',
    SECAO_NOME[secao] ?? '',
    l.natureza_juridica ?? '',
    PORTE_NOME[l.porte_empresa ?? ''] ?? '',
    mei ? 'Sim' : 'Não',
    (l.capital_social ?? '').replace('.', ','),
    [l.tipo_logradouro, l.logradouro].filter(Boolean).join(' '),
    l.numero ?? '',
    l.complemento ?? '',
    l.bairro ?? '',
    l.cep ?? '',
    l.municipio ?? '',
    l.uf ?? '',
    telefone(l.ddd_1, l.telefone_1),
    telefone(l.ddd_2, l.telefone_2),
    (l.email ?? '').toLowerCase(),
    'Receita Federal',
  ]
}

function csvCampo(v: string): string {
  return /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

function csvLinha(campos: string[]): string {
  return campos.map(csvCampo).join(';') + '\r\n'
}

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function nomeArquivoItem(pedidoId: string, indice: number, item: ItemRecorte): string {
  const local = item.municipio ? `${item.uf}-${slug(item.municipioNome ?? item.municipio)}` : item.uf
  const segmento = item.secoes.length ? item.secoes.join('') : 'todos-segmentos'
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)
  return `algtrix_${local}_${slug(segmento)}_${pedidoId}_item${indice + 1}_${carimbo}.zip`
}

function leiaMe(item: ItemRecorte, pedidoId: string, linhas: number, comXlsx: boolean): string {
  return [
    'ALGTRIX B2B - LISTA DE EMPRESAS',
    '',
    `Pedido: ${pedidoId}`,
    `Recorte: ${item.municipio ? `${item.municipioNome ?? item.municipio} - ` : ''}${UF_NOME[item.uf]} (${item.uf})`,
    `Segmentos: ${item.secoes.length ? item.secoes.map((s) => SECAO_NOME[s]).join('; ') : 'Todos'}`,
    `Portes: ${item.portes.length ? item.portes.join(', ') : 'ME, EPP e Demais'}`,
    `MEI: ${item.incluirMei ? 'incluído' : 'não incluído'}`,
    `Empresas: ${linhas.toLocaleString('pt-BR')}`,
    'Base: Dados Abertos do CNPJ - Receita Federal do Brasil (base atualizada)',
    '',
    'Arquivos:',
    '- empresas.csv: separado por ponto e vírgula, codificação UTF-8. Abre direto no Excel.',
    comXlsx ? '- empresas.xlsx: mesma lista em Excel, com aba de resumo por segmento e porte.' : '- Formato Excel não incluído: o volume excede o limite recomendado; use o CSV.',
    linhas <= LIMITE_PDF_LINHAS
      ? '- relatorio.pdf: relatório formatado com resumo e a lista completa.'
      : '- relatorio.pdf: relatório formatado com resumo e as primeiras ' + LIMITE_PDF_LINHAS.toLocaleString('pt-BR') + ' empresas.',
    '',
    'Uso: licença de uso interno, não transferível. É proibida a revenda ou redistribuição.',
    'Ao usar os contatos, observe a LGPD (Lei 13.709/2018) e ofereça meio de descadastramento.',
    '',
  ].join('\r\n')
}

export interface ProgressoItem {
  linhas: number
  arquivoParquet: string
}

/**
 * Gera o ZIP de um item do pedido (CSV + XLSX quando couber) lendo a base no R2
 * grupo a grupo de linhas e enviando o resultado em partes para o R2.
 */
export async function gerarArquivoItem(
  pedidoId: string,
  indice: number,
  item: ItemRecorte,
  empresasPrevistas: number,
  onProgresso?: (p: ProgressoItem) => void,
): Promise<ArquivoEntregue> {
  const prefixo = process.env.R2_BASE_PREFIX || `base/${COMPETENCIA}`
  const nomeArquivo = nomeArquivoItem(pedidoId, indice, item)
  const chave = `pedidos/${pedidoId}/${nomeArquivo}`
  const comXlsx = empresasPrevistas <= LIMITE_XLSX
  const secoes = new Set(item.secoes)
  const portes = new Set(
    (item.portes.length ? item.portes : PORTES.map((p) => p.codigo)).map(
      (p) => PORTES.find((x) => x.codigo === p)!.receita as string,
    ),
  )

  const upload = new MultipartUpload(chave, 'application/zip')
  await upload.iniciar()

  const pendentes: Uint8Array[] = []
  let erroZip: Error | null = null
  const zip = new Zip((err, data) => {
    if (err) erroZip = err
    else pendentes.push(data)
  })
  const descarregar = async () => {
    if (erroZip) throw erroZip
    while (pendentes.length) await upload.escrever(pendentes.shift()!)
  }

  const csv = new ZipDeflate('empresas.csv', { level: 6 })
  zip.add(csv)
  csv.push(strToU8('﻿' + csvLinha(CABECALHO)))

  const linhasXlsx: string[][] = []
  const linhasPdf: string[][] = []
  const resumoSegmento = new Map<string, number>()
  const resumoPorte = new Map<string, number>()
  const resumoCidade = new Map<string, number>()
  let total = 0

  try {
    for (const parte of PARTES_UF[item.uf] ?? []) {
      const chaveParquet = `${prefixo}/${parte}`
      if (process.env.R2_LOCAL_DIR && !(await headObject(chaveParquet))) continue // testes locais com base parcial
      const file = await parquetBufferR2(chaveParquet)
      const metadata = await parquetMetadataAsync(file)
      let inicio = 0
      for (const grupo of metadata.row_groups) {
        const fim = inicio + Number(grupo.num_rows)
        let linhas: Linha[] = []
        await parquetRead({
          file: await bufferDoGrupo(file, grupo),
          metadata,
          compressors,
          columns: [...COLUNAS_LIDAS],
          rowStart: inicio,
          rowEnd: fim,
          rowFormat: 'object',
          onComplete: (rows) => {
            linhas = rows as unknown as Linha[]
          },
        })
        inicio = fim

        let bloco = ''
        for (const l of linhas) {
          if (item.municipio && l.codigo_municipio_receita !== item.municipio) continue
          const mei = l.natureza_juridica === '2135'
          if (mei && !item.incluirMei) continue
          if (!mei && !portes.has(l.porte_empresa ?? '')) continue
          const secao = secaoDoCnae(l.cnae_principal)
          if (!secao || (secoes.size && !secoes.has(secao))) continue
          const campos = transformar(l, secao, mei)
          bloco += csvLinha(campos)
          if (comXlsx) linhasXlsx.push(campos)
          if (linhasPdf.length < LIMITE_PDF_LINHAS) linhasPdf.push(campos)
          resumoSegmento.set(campos[7]!, (resumoSegmento.get(campos[7]!) ?? 0) + 1)
          resumoPorte.set(mei ? 'MEI' : campos[9]!, (resumoPorte.get(mei ? 'MEI' : campos[9]!) ?? 0) + 1)
          resumoCidade.set(campos[17]!, (resumoCidade.get(campos[17]!) ?? 0) + 1)
          total++
        }
        if (bloco) csv.push(strToU8(bloco))
        await descarregar()
        onProgresso?.({ linhas: total, arquivoParquet: parte })
      }
    }
    csv.push(new Uint8Array(0), true)
    await descarregar()

    const resumo: Resumo = {
      item,
      pedidoId,
      total,
      segmentos: [...resumoSegmento.entries()].sort((a, b) => b[1] - a[1]),
      portes: [...resumoPorte.entries()].sort((a, b) => b[1] - a[1]),
      cidades: [...resumoCidade.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
    }

    // Excel e PDF são gravados como arquivos próprios (download direto) e também dentro do ZIP.
    const base = chave.replace(/\.zip$/, '')
    const downloads: NonNullable<ArquivoEntregue['downloads']> = []
    if (comXlsx) {
      const xlsx = await gerarXlsx(linhasXlsx, resumo)
      await putObject(`${base}.xlsx`, xlsx, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      downloads.push({ formato: 'XLSX', chave: `${base}.xlsx`, nomeArquivo: nomeArquivo.replace(/\.zip$/, '.xlsx'), bytes: xlsx.length })
      const arquivo = new ZipPassThrough('empresas.xlsx')
      zip.add(arquivo)
      arquivo.push(xlsx, true)
      await descarregar()
    }

    const pdf = await gerarPdf(linhasPdf, resumo)
    await putObject(`${base}.pdf`, pdf, 'application/pdf')
    downloads.push({ formato: 'PDF', chave: `${base}.pdf`, nomeArquivo: nomeArquivo.replace(/\.zip$/, '.pdf'), bytes: pdf.length })
    const arquivoPdf = new ZipPassThrough('relatorio.pdf')
    zip.add(arquivoPdf)
    arquivoPdf.push(pdf, true)
    await descarregar()

    const leia = new ZipDeflate('LEIA-ME.txt', { level: 6 })
    zip.add(leia)
    leia.push(strToU8(leiaMe(item, pedidoId, total, comXlsx)), true)
    zip.end()
    await descarregar()
    const bytes = await upload.concluir()

    return {
      indiceItem: indice,
      chave,
      nomeArquivo,
      bytes,
      linhas: total,
      formatos: comXlsx ? ['CSV', 'XLSX', 'PDF'] : ['CSV', 'PDF'],
      downloads: [...downloads, { formato: 'CSV', chave, nomeArquivo, bytes }],
    }
  } catch (e) {
    await upload.abortar()
    throw e
  }
}

type BufferAssincrono = { byteLength: number; slice(start: number, end?: number): Promise<ArrayBuffer> }

/**
 * Baixa de uma só vez o intervalo de bytes de um grupo de linhas (todas as colunas
 * contíguas) e atende as leituras do hyparquet a partir da memória. Evita dezenas
 * de requisições pequenas ao R2 por grupo.
 */
async function bufferDoGrupo(
  file: BufferAssincrono,
  grupo: { columns: { meta_data?: { dictionary_page_offset?: bigint | number; data_page_offset: bigint | number; total_compressed_size: bigint | number } }[] },
): Promise<BufferAssincrono> {
  let ini = Number.POSITIVE_INFINITY
  let fim = 0
  for (const col of grupo.columns) {
    const m = col.meta_data
    if (!m) continue
    const start = Number(m.dictionary_page_offset ?? m.data_page_offset)
    const s2 = Math.min(start, Number(m.data_page_offset))
    ini = Math.min(ini, s2)
    fim = Math.max(fim, s2 + Number(m.total_compressed_size))
  }
  if (!Number.isFinite(ini)) return file
  const dados = await file.slice(ini, fim)
  return {
    byteLength: file.byteLength,
    slice(start: number, end?: number) {
      const e = end ?? file.byteLength
      if (start >= ini && e <= fim) return Promise.resolve(dados.slice(start - ini, e - ini))
      return file.slice(start, e)
    },
  }
}

interface Resumo {
  item: ItemRecorte
  pedidoId: string
  total: number
  segmentos: [string, number][]
  portes: [string, number][]
  cidades: [string, number][]
}

function descricaoRecorte(r: Resumo): string[] {
  return [
    `Região: ${r.item.municipio ? `${r.item.municipioNome ?? r.item.municipio} - ` : ''}${UF_NOME[r.item.uf]} (${r.item.uf})`,
    `Segmentos: ${r.item.secoes.length ? r.item.secoes.map((s) => SECAO_NOME[s]).join('; ') : 'Todos'}`,
    `Portes: ${r.item.portes.length ? r.item.portes.join(', ') : 'ME, EPP e Demais'}${r.item.incluirMei ? ' + MEI' : ' (sem MEI)'}`,
    `Empresas: ${r.total.toLocaleString('pt-BR')}`,
    'Base: Dados Abertos do CNPJ, Receita Federal (base atualizada)',
    `Pedido: ${r.pedidoId}`,
  ]
}

const LARGURAS_XLSX = [20, 40, 30, 14, 12, 42, 30, 32, 12, 9, 7, 16, 36, 10, 18, 24, 11, 24, 6, 16, 16, 34, 12]

async function gerarXlsx(linhas: string[][], resumo: Resumo): Promise<Uint8Array> {
  const stream = new PassThrough()
  const partes: Buffer[] = []
  stream.on('data', (c: Buffer) => partes.push(c))
  const fim = new Promise<void>((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useSharedStrings: false, useStyles: true })
  wb.creator = 'Algtrix B2B'

  // Aba 1: resumo do recorte
  const wr = wb.addWorksheet('Resumo')
  wr.columns = [{ width: 44 }, { width: 18 }]
  const titulo = wr.addRow(['Algtrix B2B - Lista de empresas'])
  titulo.font = { bold: true, size: 16, color: { argb: 'FF1C1533' } }
  titulo.commit()
  wr.addRow([]).commit()
  for (const l of descricaoRecorte(resumo)) {
    const [k, v] = l.split(/: (.+)/)
    const row = wr.addRow([k, v ?? ''])
    row.getCell(1).font = { bold: true }
    row.commit()
  }
  const bloco = (nome: string, pares: [string, number][]) => {
    wr.addRow([]).commit()
    const h = wr.addRow([nome, 'Empresas'])
    h.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1533' } }
    h.commit()
    for (const [k, v] of pares) {
      const r = wr.addRow([k, v])
      r.getCell(2).numFmt = '#,##0'
      r.commit()
    }
  }
  bloco('Por segmento', resumo.segmentos)
  bloco('Por porte', resumo.portes)
  if (resumo.cidades.length > 1) bloco('Principais cidades', resumo.cidades)
  await wr.commit()

  // Aba 2: empresas
  const ws = wb.addWorksheet('Empresas', { views: [{ state: 'frozen', ySplit: 1 }] })
  ws.columns = CABECALHO.map((h, i) => ({ header: h, width: LARGURAS_XLSX[i] ?? 16 }))
  const cab = ws.getRow(1)
  cab.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cab.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1533' } }
  cab.alignment = { vertical: 'middle' }
  cab.height = 22
  cab.commit()
  let n = 0
  for (const l of linhas) {
    const r = ws.addRow(l)
    if (n % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F6FB' } }
    r.commit()
    n++
  }
  ws.autoFilter = { from: 'A1', to: { row: 1, column: CABECALHO.length } }
  await ws.commit()
  await wb.commit()
  await fim
  return new Uint8Array(Buffer.concat(partes))
}

const COLUNAS_PDF: { idx: number; titulo: string; largura: number }[] = [
  { idx: 0, titulo: 'CNPJ', largura: 95 },
  { idx: 1, titulo: 'Razão social', largura: 170 },
  { idx: 7, titulo: 'Segmento', largura: 120 },
  { idx: 9, titulo: 'Porte', largura: 40 },
  { idx: 17, titulo: 'Município', largura: 95 },
  { idx: 18, titulo: 'UF', largura: 24 },
  { idx: 19, titulo: 'Telefone', largura: 80 },
  { idx: 21, titulo: 'E-mail', largura: 145 },
]

/** Relatório em PDF (A4 paisagem): capa com resumo e tabela paginada das empresas. */
async function gerarPdf(linhas: string[][], resumo: Resumo): Promise<Uint8Array> {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36, bufferPages: true, info: { Title: `Algtrix B2B - ${resumo.pedidoId}`, Author: 'Algtrix B2B' } })
  const partes: Buffer[] = []
  doc.on('data', (c: Buffer) => partes.push(c))
  const fim = new Promise<void>((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)
  })
  const roxo = '#1c1533'
  const cinza = '#5b5470'
  const larguraUtil = doc.page.width - 72
  /** Corta o texto para caber na largura, com reticências (evita quebra de linha nas células). */
  const cortar = (texto: string, largura: number): string => {
    if (doc.widthOfString(texto) <= largura) return texto
    let t = texto
    while (t.length > 1 && doc.widthOfString(t + '…') > largura) t = t.slice(0, -1)
    return t + '…'
  }

  // Capa / resumo
  doc.rect(0, 0, doc.page.width, 84).fill(roxo)
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22).text('Algtrix B2B', 36, 26)
  doc.font('Helvetica').fontSize(11).fillColor('#c9c3dc').text('Lista de empresas para prospecção B2B', 36, 54)
  doc.font('Helvetica').fontSize(9).fillColor('#c9c3dc').text(`Pedido ${resumo.pedidoId}`, 36, 30, { width: larguraUtil, align: 'right' })
  doc.fontSize(10).fillColor(roxo)
  let y = 108
  for (const l of descricaoRecorte(resumo)) {
    const [k, v] = l.split(/: (.+)/)
    doc.font('Helvetica-Bold').text(`${k}:`, 36, y, { continued: true }).font('Helvetica').text(` ${v ?? ''}`)
    y += 16
  }
  y += 10
  const tabelaResumo = (titulo: string, pares: [string, number][], x: number, largura: number) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(roxo).text(titulo, x, y)
    let yy = y + 16
    doc.font('Helvetica').fontSize(9)
    for (const [k, v] of pares.slice(0, 12)) {
      doc.fillColor(cinza).text(cortar(k, largura - 66), x, yy, { lineBreak: false })
      doc.fillColor(roxo).text(v.toLocaleString('pt-BR'), x + largura - 60, yy, { width: 60, align: 'right' })
      yy += 13
    }
    return yy
  }
  const col = (larguraUtil - 40) / 3
  const y1 = tabelaResumo('Por segmento', resumo.segmentos, 36, col)
  const y2 = tabelaResumo('Por porte', resumo.portes, 36 + col + 20, col)
  const y3 = resumo.cidades.length > 1 ? tabelaResumo('Principais cidades', resumo.cidades, 36 + 2 * (col + 20), col) : y
  y = Math.max(y1, y2, y3) + 14
  if (linhas.length < resumo.total) {
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(cinza).text(
      `Este PDF traz as primeiras ${linhas.length.toLocaleString('pt-BR')} de ${resumo.total.toLocaleString('pt-BR')} empresas. A lista completa está nos arquivos CSV e Excel.`,
      36,
      y,
      { width: larguraUtil },
    )
  }

  // Tabela paginada
  const alturaLinha = 14
  const cabecalho = () => {
    doc.rect(36, y, larguraUtil, 18).fill(roxo)
    let x = 40
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
    for (const c of COLUNAS_PDF) {
      doc.text(c.titulo, x, y + 5, { lineBreak: false })
      x += c.largura
    }
    y += 20
  }
  doc.addPage()
  y = 36
  cabecalho()
  let n = 0
  for (const l of linhas) {
    if (y + alturaLinha > doc.page.height - 40) {
      doc.addPage()
      y = 36
      cabecalho()
    }
    if (n % 2 === 1) doc.rect(36, y - 2, larguraUtil, alturaLinha).fill('#f7f6fb')
    let x = 40
    doc.font('Helvetica').fontSize(7.5).fillColor(roxo)
    for (const c of COLUNAS_PDF) {
      doc.text(cortar(l[c.idx] ?? '', c.largura - 8), x, y + 1, { lineBreak: false })
      x += c.largura
    }
    y += alturaLinha
    n++
  }

  // Rodapé com numeração
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    doc.page.margins.bottom = 0
    doc.font('Helvetica').fontSize(7.5).fillColor(cinza).text(
      `Algtrix B2B · Pedido ${resumo.pedidoId} · Dados da Receita Federal · Uso interno, não transferível · Página ${i + 1} de ${range.count}`,
      36,
      doc.page.height - 26,
      { width: larguraUtil, align: 'center', lineBreak: false },
    )
  }
  doc.end()
  await fim
  return new Uint8Array(Buffer.concat(partes))
}
