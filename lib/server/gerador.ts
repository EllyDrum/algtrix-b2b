import { parquetMetadataAsync, parquetRead } from 'hyparquet'
import { compressors } from 'hyparquet-compressors'
import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from 'fflate'
import ExcelJS from 'exceljs'
import { PassThrough } from 'node:stream'
import { COMPETENCIA, PARTES_UF, PORTES, secaoDoCnae, UF_NOME, SECAO_NOME } from '../catalog'
import type { ItemRecorte } from '../pricing-engine'
import { headObject, MultipartUpload, parquetBufferR2 } from './r2'
import type { ArquivoEntregue } from './pedidos'

/** Acima deste volume o arquivo é entregue só em CSV (o XLSX fica pesado e o Excel limita 1.048.576 linhas). */
export const LIMITE_XLSX = 100_000

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
  'Competência da base',
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
    l.competencia_receita ?? COMPETENCIA,
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
  return `algtrix_${local}_${slug(segmento)}_${COMPETENCIA}_${pedidoId}_item${indice + 1}_${carimbo}.zip`
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
    `Competência da base: ${COMPETENCIA} (Dados Abertos do CNPJ - Receita Federal do Brasil)`,
    '',
    'Arquivos:',
    '- empresas.csv: separado por ponto e vírgula, codificação UTF-8. Abre direto no Excel.',
    comXlsx ? '- empresas.xlsx: mesma lista em formato Excel.' : '- Formato Excel não incluído: o volume excede o limite recomendado; use o CSV.',
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
          total++
        }
        if (bloco) csv.push(strToU8(bloco))
        await descarregar()
        onProgresso?.({ linhas: total, arquivoParquet: parte })
      }
    }
    csv.push(new Uint8Array(0), true)
    await descarregar()

    if (comXlsx) {
      const xlsx = await gerarXlsx(linhasXlsx)
      const arquivo = new ZipPassThrough('empresas.xlsx')
      zip.add(arquivo)
      arquivo.push(xlsx, true)
      await descarregar()
    }

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
      formatos: comXlsx ? ['CSV', 'XLSX'] : ['CSV'],
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

async function gerarXlsx(linhas: string[][]): Promise<Uint8Array> {
  const stream = new PassThrough()
  const partes: Buffer[] = []
  stream.on('data', (c: Buffer) => partes.push(c))
  const fim = new Promise<void>((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useSharedStrings: false, useStyles: true })
  const ws = wb.addWorksheet('Empresas', { views: [{ state: 'frozen', ySplit: 1 }] })
  ws.columns = CABECALHO.map((h) => ({ header: h, width: Math.min(Math.max(h.length + 4, 14), 45) }))
  ws.getRow(1).font = { bold: true }
  ws.getRow(1).commit()
  for (const l of linhas) ws.addRow(l).commit()
  ws.autoFilter = { from: 'A1', to: { row: 1, column: CABECALHO.length } }
  await ws.commit()
  await wb.commit()
  await fim
  return new Uint8Array(Buffer.concat(partes))
}
