// Teste ponta a ponta local: checkout (pagamento simulado) -> função em segundo plano -> arquivos -> API do pedido.
import http from 'node:http'
import { BlobsServer } from '@netlify/blobs/server'

const blobs = new BlobsServer({ directory: '/home/claude/blobs-local', token: 'tok', port: 9999 })
const { port } = await blobs.start()
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`, token: 'tok', siteID: 'site-teste' })).toString('base64')
process.env.URL = 'http://localhost:9898'
;(globalThis as any).Netlify = { env: { get: (k: string) => process.env[k] } }

const fn = (await import('../../netlify/functions/gerar-pedido.mts')).default
let concluiu: () => void
const fim = new Promise<void>((r) => (concluiu = r))
http.createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  res.writeHead(202).end()
  const r = new Request('http://localhost:9898' + req.url, { method: 'POST', headers: req.headers as any, body: Buffer.concat(chunks) })
  await fn(r, { site: { url: 'http://localhost:9898' } } as any).catch((e: unknown) => console.error('FUNCAO ERRO', e))
  concluiu()
}).listen(9898)

const { POST } = await import('@/app/api/checkout/route')
const resp = await POST(new Request('http://x/api/checkout', { method: 'POST', body: JSON.stringify({
  email: 'cliente@teste.com.br', nome: 'Teste', aceite: true,
  itens: [{ uf: 'AC', secoes: [], portes: [], incluirMei: false }, { uf: 'AC', secoes: ['G', 'I'], portes: ['ME'], incluirMei: true }],
}) }))
const dados = await resp.json()
console.log('checkout', resp.status, dados)
await fim
const url = new URL(dados.checkoutUrl)
const id = url.pathname.split('/').pop()!
const { GET } = await import('@/app/api/pedido/[id]/route')
const r2 = await GET(new Request(`http://x/api/pedido/${id}?t=${url.searchParams.get('t')}`), { params: { id } })
console.log('pedido', r2.status, JSON.stringify(await r2.json(), null, 1).slice(0, 1500))
const r3 = await GET(new Request(`http://x/api/pedido/${id}?t=errado`), { params: { id } })
console.log('token errado ->', r3.status)
await blobs.stop()
process.exit(0)
