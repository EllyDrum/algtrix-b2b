// Fluxo com cartão pela Stripe: checkout -> sessão -> webhook assinado -> geração -> download.
// A API da Stripe é simulada localmente (STRIPE_API_URL).
import http from 'node:http'
import { createHmac } from 'node:crypto'
import { BlobsServer } from '@netlify/blobs/server'

const blobs = new BlobsServer({ directory: '/home/claude/blobs-local-stripe', token: 'tok', port: 9995 })
const { port } = await blobs.start()
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`, token: 'tok', siteID: 'site-teste' })).toString('base64')
process.env.URL = 'http://localhost:9894'
process.env.STRIPE_API_URL = 'http://localhost:9893/v1'
;(globalThis as any).Netlify = { env: { get: (k: string) => process.env[k] } }

// Stripe falsa
const sessoes = new Map<string, any>()
let ultimoCorpo = ''
http.createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  const corpo = Buffer.concat(chunks).toString()
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.STRIPE_SECRET_KEY}`) { res.writeHead(401).end('{}'); return }
  if (req.method === 'POST' && req.url === '/v1/checkout/sessions') {
    ultimoCorpo = corpo
    const p = new URLSearchParams(corpo)
    const total = [...p.entries()].filter(([k]) => /line_items\[\d+\]\[price_data\]\[unit_amount\]/.test(k)).reduce((s, [, v]) => s + Number(v), 0)
    const id = 'cs_test_' + Math.random().toString(36).slice(2)
    const s = { id, object: 'checkout.session', url: `https://checkout.stripe.com/c/pay/${id}`, payment_status: 'unpaid', status: 'open', amount_total: total, currency: p.get('line_items[0][price_data][currency]'), client_reference_id: p.get('client_reference_id'), payment_intent: null, metadata: { pedidoId: p.get('metadata[pedidoId]') } }
    sessoes.set(id, s)
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(s)); return
  }
  const m = req.url?.match(/^\/v1\/checkout\/sessions\/(cs_[\w]+)$/)
  if (m && sessoes.has(m[1])) { res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(sessoes.get(m[1]))); return }
  res.writeHead(404).end('{}')
}).listen(9893)

// Função de geração
const fn = (await import('../../netlify/functions/gerar-pedido.mts')).default
let concluiu: () => void
const fim = new Promise<void>((r) => (concluiu = r))
http.createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  res.writeHead(202).end()
  await fn(new Request('http://localhost:9894' + req.url, { method: 'POST', headers: req.headers as any, body: Buffer.concat(chunks) }), { site: { url: 'http://localhost:9894' } } as any).catch((e: unknown) => console.error('FUNCAO ERRO', e))
  concluiu()
}).listen(9894)

const status = await (await import('@/app/api/loja/status/route')).GET()
console.log('status loja', await status.json())
const { POST } = await import('@/app/api/checkout/route')
const r = await POST(new Request('http://x/api/checkout', { method: 'POST', body: JSON.stringify({ email: 'cliente@teste.com.br', nome: 'Teste', aceite: true, metodo: 'cartao', itens: [{ uf: 'SP', municipio: '6477', secoes: ['Q'], portes: [], incluirMei: false }, { uf: 'AC', secoes: ['G'], portes: [], incluirMei: true }] }) }))
const d = await r.json(); console.log('checkout', r.status, d)
if (!d.checkoutUrl?.startsWith('https://checkout.stripe.com/')) throw new Error('não redirecionou para a Stripe')
const sessao = [...sessoes.values()][0]
const id = sessao.client_reference_id
console.log('sessão', sessao.id, 'total', sessao.amount_total, 'moeda', sessao.currency, 'parcelamento', ultimoCorpo.includes('payment_method_options%5Bcard%5D%5Binstallments%5D%5Benabled%5D=true'), 'locale', ultimoCorpo.includes('locale=pt-BR'))

const { lerPedido, tokenPedido } = await import('@/lib/server/pedidos')
let pedido = (await lerPedido(id))!
console.log('pedido', pedido.status, pedido.metodo, pedido.pagamento, 'total', pedido.totalCentavos, 'desconto', pedido.descontoCentavos)
if (sessao.amount_total !== pedido.totalCentavos) throw new Error('total da sessão difere do pedido')
const t = tokenPedido(id)

// Webhook: assinatura inválida
const { POST: WH } = await import('@/app/api/webhook/stripe/route')
const evento = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: sessao.id, object: 'checkout.session' } } })
const ruim = await WH(new Request('http://x/api/webhook/stripe', { method: 'POST', body: evento, headers: { 'stripe-signature': 't=1,v1=abc' } }))
console.log('webhook assinatura inválida ->', ruim.status)
// Webhook válido, mas sessão ainda não paga: nada muda
const assinar = (corpo: string) => { const ts = Math.floor(Date.now() / 1000); return `t=${ts},v1=${createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET!).update(`${ts}.${corpo}`).digest('hex')}` }
const naoPago = await WH(new Request('http://x/api/webhook/stripe', { method: 'POST', body: evento, headers: { 'stripe-signature': assinar(evento) } }))
console.log('webhook sessão não paga ->', naoPago.status, (await lerPedido(id))!.status)
// Cliente paga
sessao.payment_status = 'paid'; sessao.status = 'complete'; sessao.payment_intent = 'pi_test_1'
const ok = await WH(new Request('http://x/api/webhook/stripe', { method: 'POST', body: evento, headers: { 'stripe-signature': assinar(evento) } }))
console.log('webhook pago ->', ok.status, await ok.json(), (await lerPedido(id))!.status)
// Evento repetido não deve gerar de novo
const rep = await WH(new Request('http://x/api/webhook/stripe', { method: 'POST', body: evento, headers: { 'stripe-signature': assinar(evento) } }))
console.log('webhook repetido ->', rep.status)
await fim
const { GET } = await import('@/app/api/pedido/[id]/route')
const p = await (await GET(new Request(`http://x/api/pedido/${id}?t=${t}`), { params: { id } })).json()
console.log('final', p.status, p.metodo, p.provedor, p.arquivos.map((a: any) => [a.linhas, a.downloads.map((x: any) => x.formato)]))

// Segundo pedido: cliente volta da Stripe antes do webhook -> a página do pedido sincroniza sozinha
const r2 = await POST(new Request('http://x/api/checkout', { method: 'POST', body: JSON.stringify({ email: 'cliente@teste.com.br', aceite: true, metodo: 'cartao', itens: [{ uf: 'AC', secoes: ['Q'], portes: [], incluirMei: false }] }) }))
const d2 = await r2.json(); const s2 = [...sessoes.values()][1]; const id2 = s2.client_reference_id
s2.payment_status = 'paid'; s2.status = 'complete'
const fim2 = new Promise<void>((res) => (concluiu = res))
const p2 = await (await GET(new Request(`http://x/api/pedido/${id2}?t=${tokenPedido(id2)}`), { params: { id: id2 } })).json()
console.log('sem webhook, após voltar da Stripe ->', p2.status)
await fim2
console.log('segundo pedido final ->', (await lerPedido(id2))!.status)
await blobs.stop(); process.exit(0)
