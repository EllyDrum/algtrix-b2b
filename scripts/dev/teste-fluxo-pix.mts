// Fluxo com Pix na chave da empresa: checkout -> QR Code -> confirmação manual -> geração -> download.
import http from 'node:http'
import { BlobsServer } from '@netlify/blobs/server'
import { crc16 } from '@/lib/payments/pix-brcode'

const blobs = new BlobsServer({ directory: '/home/claude/blobs-local-pix', token: 'tok', port: 9997 })
const { port } = await blobs.start()
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`, token: 'tok', siteID: 'site-teste' })).toString('base64')
process.env.URL = 'http://localhost:9896'
;(globalThis as any).Netlify = { env: { get: (k: string) => process.env[k] } }
const fn = (await import('../../netlify/functions/gerar-pedido.mts')).default
let concluiu: () => void
const fim = new Promise<void>((r) => (concluiu = r))
http.createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  res.writeHead(202).end()
  await fn(new Request('http://localhost:9896' + req.url, { method: 'POST', headers: req.headers as any, body: Buffer.concat(chunks) }), { site: { url: 'http://localhost:9896' } } as any).catch((e: unknown) => console.error('FUNCAO ERRO', e))
  concluiu()
}).listen(9896)

const status = await (await import('@/app/api/loja/status/route')).GET()
console.log('status loja', await status.json())
const { POST } = await import('@/app/api/checkout/route')
const r = await POST(new Request('http://x/api/checkout', { method: 'POST', body: JSON.stringify({ email: 'cliente@teste.com.br', nome: 'Teste', aceite: true, metodo: 'pix', itens: [{ uf: 'SP', municipio: '6477', secoes: ['Q'], portes: [], incluirMei: false }] }) }))
const d = await r.json(); console.log('checkout', r.status, d)
const url = new URL(d.checkoutUrl); const id = url.pathname.split('/').pop()!; const t = url.searchParams.get('t')!
const { GET } = await import('@/app/api/pedido/[id]/route')
let p = await (await GET(new Request(`http://x/api/pedido/${id}?t=${t}`), { params: { id } })).json()
console.log('status', p.status, 'provedor', p.provedor, 'beneficiario', p.beneficiario)
const brcode: string = p.pix.qrCode
console.log('brcode', brcode)
console.log('crc ok', brcode.slice(-4) === crc16(brcode.slice(0, -4)), 'tem chave', brcode.includes('48653532000154'), 'valor', brcode.includes('5405' + (p.totalCentavos / 100).toFixed(2)), 'qr base64', p.pix.qrCodeBase64.length)
const lista = await (await import('@/app/api/interno/pedidos/route')).GET(new Request('http://x/api/interno/pedidos', { headers: { 'x-interno': process.env.INTERNAL_SECRET! } }))
console.log('painel', lista.status, (await lista.json()).length, 'pedido(s)')
const neg = await (await import('@/app/api/interno/confirmar-pagamento/route')).POST(new Request('http://x', { method: 'POST', headers: { 'x-interno': 'errada' }, body: JSON.stringify({ pedidoId: id }) }))
console.log('confirmar com chave errada ->', neg.status)
const ok = await (await import('@/app/api/interno/confirmar-pagamento/route')).POST(new Request('http://x', { method: 'POST', headers: { 'x-interno': process.env.INTERNAL_SECRET! }, body: JSON.stringify({ pedidoId: id }) }))
console.log('confirmar ->', ok.status, await ok.json())
await fim
p = await (await GET(new Request(`http://x/api/pedido/${id}?t=${t}`), { params: { id } })).json()
console.log('final', p.status, p.arquivos.map((a: any) => [a.linhas, a.formatos, a.bytes]))
await blobs.stop(); process.exit(0)
