// Verifica que todas as partes (exceto a última) têm o mesmo tamanho, como o R2 exige.
const partes: Buffer[] = []
globalThis.fetch = (async (input: any, init?: any) => {
  const req = input instanceof Request ? input : new Request(input, init)
  const url = req.url
  if (url.includes('?uploads')) return new Response('<UploadId>u1</UploadId>')
  if (url.includes('partNumber')) { partes.push(Buffer.from(await req.arrayBuffer())); return new Response('', { headers: { etag: '"e' + partes.length + '"' } }) }
  return new Response('<ok/>')
}) as typeof fetch
process.env.R2_ACCOUNT_ID = 'x'; process.env.R2_ACCESS_KEY_ID = 'k'; process.env.R2_SECRET_ACCESS_KEY = 's'; process.env.R2_BUCKET = 'b'
const { MultipartUpload } = await import('@/lib/server/r2')
const up = new MultipartUpload('t/a.zip', 'application/zip'); await up.iniciar()
const fontes: Buffer[] = []
for (let i = 0; i < 400; i++) { const n = 50_000 + Math.floor(Math.random() * 300_000); const c = Buffer.alloc(n); for (let j = 0; j < n; j += 997) c[j] = (i + j) % 251; fontes.push(c); await up.escrever(c) }
const bytes = await up.concluir()
const tam = partes.map((p) => p.length)
console.log({ partes: tam.length, iguais: tam.slice(0, -1).every((p) => p === 16 * 1024 * 1024), ultima: tam.at(-1), bytes, integro: Buffer.concat(partes).equals(Buffer.concat(fontes)) })
