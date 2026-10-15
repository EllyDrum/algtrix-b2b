import QRCode from 'qrcode'

/**
 * Gera o "Pix Copia e Cola" (BR Code EMV, padrão do Banco Central) para uma
 * chave Pix estática, com valor e identificador do pedido. Usado quando a
 * cobrança é feita diretamente na chave Pix da empresa (CNPJ), sem intermediário.
 *
 * Variáveis: PIX_CHAVE (ex.: CNPJ sem pontuação), PIX_NOME (até 25 caracteres),
 * PIX_CIDADE (até 15 caracteres, sem acento).
 */

function campo(id: string, valor: string): string {
  const tamanho = String(valor.length).padStart(2, '0')
  return `${id}${tamanho}${valor}`
}

function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 .-]/g, '')
    .toUpperCase()
}

/** CRC16-CCITT (polinômio 0x1021, inicial 0xFFFF), conforme o manual do BR Code. */
export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export interface PixEstaticoInput {
  chave: string
  nome: string
  cidade: string
  valorCentavos: number
  /** Identificador da transação: letras e números, até 25 caracteres. */
  txid: string
  descricao?: string
}

export function gerarBrCode(input: PixEstaticoInput): string {
  const txid = input.txid.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'
  const conta =
    campo('00', 'br.gov.bcb.pix') +
    campo('01', input.chave) +
    (input.descricao ? campo('02', semAcento(input.descricao).slice(0, 40)) : '')
  const semCrc =
    campo('00', '01') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    campo('54', (input.valorCentavos / 100).toFixed(2)) +
    campo('58', 'BR') +
    campo('59', semAcento(input.nome).slice(0, 25)) +
    campo('60', semAcento(input.cidade).slice(0, 15)) +
    campo('62', campo('05', txid)) +
    '6304'
  return semCrc + crc16(semCrc)
}

export async function qrCodeBase64(conteudo: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(conteudo, { errorCorrectionLevel: 'M', margin: 1, width: 360 })
  return dataUrl.split(',')[1] ?? ''
}

export function pixEstaticoConfigurado(): boolean {
  return Boolean(process.env.PIX_CHAVE && process.env.PIX_NOME)
}

/** Cria a cobrança Pix estática de um pedido (QR Code + Copia e Cola). */
export async function criarPixEstatico(pedidoId: string, valorCentavos: number) {
  const chave = process.env.PIX_CHAVE ?? ''
  const nome = process.env.PIX_NOME ?? ''
  const cidade = process.env.PIX_CIDADE ?? 'SAO PAULO'
  if (!chave || !nome) throw new Error('PIX_CHAVE e PIX_NOME não configurados')
  const brcode = gerarBrCode({ chave, nome, cidade, valorCentavos, txid: pedidoId, descricao: `Algtrix B2B ${pedidoId}` })
  return {
    id: `estatico-${pedidoId}`,
    qrCode: brcode,
    qrCodeBase64: await qrCodeBase64(brcode),
    // Pix estático não expira; o prazo abaixo é só para a tela.
    expiraEm: new Date(Date.now() + 24 * 3600_000).toISOString(),
  }
}

export function formatarCnpj(chave: string): string {
  const d = chave.replace(/\D/g, '')
  if (d.length !== 14) return chave
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
