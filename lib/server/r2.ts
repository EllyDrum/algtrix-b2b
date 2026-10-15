import { AwsClient } from 'aws4fetch'
import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * Acesso ao Cloudflare R2 (API compatível com S3) para:
 * - ler a base em Parquet (bucket privado);
 * - gravar os arquivos gerados para cada pedido;
 * - gerar links de download temporários (pré-assinados).
 *
 * Variáveis de ambiente (somente no servidor):
 * R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

function env(name: string): string {
  const value =
    (typeof Netlify !== 'undefined' ? Netlify.env.get(name) : undefined) ?? process.env[name] ?? ''
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`)
  return value
}

declare const Netlify: { env: { get(name: string): string | undefined } } | undefined

/** Modo local (desenvolvimento e testes): R2_LOCAL_DIR aponta para uma pasta que simula o bucket. */
function localDir(): string | null {
  return process.env.R2_LOCAL_DIR || null
}

let cliente: AwsClient | null = null

function client(): AwsClient {
  if (!cliente) {
    cliente = new AwsClient({
      accessKeyId: env('R2_ACCESS_KEY_ID'),
      secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
      service: 's3',
      region: 'auto',
    })
  }
  return cliente
}

function objectUrl(key: string): string {
  const encoded = key.split('/').map(encodeURIComponent).join('/')
  return `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${env('R2_BUCKET')}/${encoded}`
}

async function check(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`R2 ${what} falhou: HTTP ${res.status} ${body.slice(0, 300)}`)
  }
  return res
}

export async function headObject(key: string): Promise<{ size: number } | null> {
  const dir = localDir()
  if (dir) {
    const st = await fs.stat(path.join(dir, key)).catch(() => null)
    return st ? { size: st.size } : null
  }
  const res = await client().fetch(objectUrl(key), { method: 'HEAD' })
  if (res.status === 404) return null
  await check(res, `HEAD ${key}`)
  return { size: Number(res.headers.get('content-length') ?? 0) }
}

export async function getRange(key: string, start: number, end: number): Promise<ArrayBuffer> {
  const dir = localDir()
  if (dir) {
    const fh = await fs.open(path.join(dir, key), 'r')
    try {
      const buf = Buffer.alloc(end - start)
      await fh.read(buf, 0, end - start, start)
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)
    } finally {
      await fh.close()
    }
  }
  const res = await client().fetch(objectUrl(key), { headers: { Range: `bytes=${start}-${end - 1}` } })
  await check(res, `GET ${key}`)
  return res.arrayBuffer()
}

export async function putObject(key: string, body: Uint8Array | string, contentType: string): Promise<void> {
  const dir = localDir()
  if (dir) {
    await fs.mkdir(path.dirname(path.join(dir, key)), { recursive: true })
    await fs.writeFile(path.join(dir, key), body)
    return
  }
  const res = await client().fetch(objectUrl(key), {
    method: 'PUT',
    body: typeof body === 'string' ? body : new Blob([body as BlobPart]),
    headers: { 'Content-Type': contentType },
  })
  await check(res, `PUT ${key}`)
}

/** Upload em partes (multipart), para arquivos grandes sem carregar tudo na memória. */
export class MultipartUpload {
  private uploadId = ''
  private partes: { numero: number; etag: string }[] = []
  private buffer: Uint8Array[] = []
  private bufferBytes = 0
  private enviado = 0
  static readonly TAMANHO_PARTE = 16 * 1024 * 1024

  constructor(private readonly key: string, private readonly contentType: string) {}

  async iniciar(): Promise<void> {
    const dir = localDir()
    if (dir) {
      await fs.mkdir(path.dirname(path.join(dir, this.key)), { recursive: true })
      await fs.writeFile(path.join(dir, this.key), new Uint8Array(0))
      this.uploadId = 'local'
      return
    }
    const res = await client().fetch(`${objectUrl(this.key)}?uploads`, {
      method: 'POST',
      headers: { 'Content-Type': this.contentType },
    })
    await check(res, `CreateMultipartUpload ${this.key}`)
    const xml = await res.text()
    const match = xml.match(/<UploadId>([^<]+)<\/UploadId>/)
    if (!match) throw new Error('R2: UploadId não retornado')
    this.uploadId = match[1] ?? ''
  }

  async escrever(chunk: Uint8Array): Promise<void> {
    this.buffer.push(chunk)
    this.bufferBytes += chunk.length
    // O R2 exige que todas as partes, exceto a última, tenham exatamente o mesmo tamanho.
    while (this.bufferBytes >= MultipartUpload.TAMANHO_PARTE) await this.enviarParte(MultipartUpload.TAMANHO_PARTE)
  }

  /** Envia `tamanho` bytes do buffer (ou tudo, na parte final) e mantém o restante. */
  private async enviarParte(tamanho = this.bufferBytes): Promise<void> {
    if (this.bufferBytes === 0 || tamanho === 0) return
    const body = new Uint8Array(tamanho)
    let offset = 0
    while (offset < tamanho) {
      const c = this.buffer[0]!
      const falta = tamanho - offset
      if (c.length <= falta) {
        body.set(c, offset)
        offset += c.length
        this.buffer.shift()
      } else {
        body.set(c.subarray(0, falta), offset)
        this.buffer[0] = c.subarray(falta)
        offset += falta
      }
    }
    this.bufferBytes -= tamanho
    const dir = localDir()
    if (dir) {
      await fs.appendFile(path.join(dir, this.key), body)
      this.enviado += body.length
      return
    }
    const numero = this.partes.length + 1
    const url = `${objectUrl(this.key)}?partNumber=${numero}&uploadId=${encodeURIComponent(this.uploadId)}`
    const res = await client().fetch(url, { method: 'PUT', body })
    await check(res, `UploadPart ${numero}`)
    const etag = res.headers.get('etag')
    if (!etag) throw new Error('R2: ETag da parte não retornado')
    this.partes.push({ numero, etag })
    this.enviado += body.length
  }

  async concluir(): Promise<number> {
    await this.enviarParte()
    if (localDir()) return this.enviado
    const corpo =
      '<CompleteMultipartUpload>' +
      this.partes.map((p) => `<Part><PartNumber>${p.numero}</PartNumber><ETag>${p.etag}</ETag></Part>`).join('') +
      '</CompleteMultipartUpload>'
    const res = await client().fetch(`${objectUrl(this.key)}?uploadId=${encodeURIComponent(this.uploadId)}`, {
      method: 'POST',
      body: corpo,
      headers: { 'Content-Type': 'application/xml' },
    })
    await check(res, `CompleteMultipartUpload ${this.key}`)
    return this.enviado
  }

  async abortar(): Promise<void> {
    if (!this.uploadId || localDir()) return
    await client()
      .fetch(`${objectUrl(this.key)}?uploadId=${encodeURIComponent(this.uploadId)}`, { method: 'DELETE' })
      .catch(() => undefined)
  }
}

/** Link de download pré-assinado (padrão: 24 horas; máximo do S3: 7 dias). */
export async function linkDownload(key: string, nomeArquivo: string, segundos = 24 * 3600): Promise<string> {
  if (localDir()) return `file://${path.join(localDir()!, key)}#${encodeURIComponent(nomeArquivo)}`
  const url = new URL(objectUrl(key))
  url.searchParams.set('X-Amz-Expires', String(Math.min(segundos, 7 * 24 * 3600)))
  url.searchParams.set('response-content-disposition', `attachment; filename="${nomeArquivo}"`)
  const signed = await client().sign(url.toString(), { method: 'GET', aws: { signQuery: true } })
  return signed.url
}

/** Buffer assíncrono compatível com o hyparquet, lendo o Parquet por intervalos de bytes. */
export async function parquetBufferR2(key: string): Promise<{ byteLength: number; slice(start: number, end?: number): Promise<ArrayBuffer> }> {
  const head = await headObject(key)
  if (!head) throw new Error(`Arquivo da base não encontrado no R2: ${key}`)
  const byteLength = head.size
  return {
    byteLength,
    slice: (start: number, end?: number) => getRange(key, start, end ?? byteLength),
  }
}
