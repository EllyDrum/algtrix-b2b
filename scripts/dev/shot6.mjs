// Requer: npm i -D playwright
import { chromium } from 'playwright'
import fs from 'node:fs'
const S = '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/'
const qr = fs.readFileSync(S + 'qr.txt', 'utf8')
const logo = '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="87"><text x="0" y="66" font-family="Arial" font-weight="700" font-size="70" fill="#1C1533">algtrix</text></svg>'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const loja = { vendasAtivas: true, cartao: true, pix: 'estatico', beneficiario: { nome: 'ALGTRIX CONSULTORIA LTDA', chave: '48653532000154' } }
const base = { id: 'ALG-20261015-D5F1AB65', email: 'cl***@empresa.com.br', competencia: '2026-09', subtotalCentavos: 2690, descontoCentavos: 0, totalCentavos: 2690, metodo: 'pix', provedor: 'pix-estatico', beneficiario: loja.beneficiario, criadoEm: new Date().toISOString(),
  itens: [{ descricao: 'Guarulhos (SP) · Saúde e serviços sociais · ME, EPP e Demais · sem MEI', empresas: 3605, precoCentavos: 2690 }] }
for (const [w, h, tag] of [[1366, 900, 'desk'], [390, 844, 'mob']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
  await ctx.route('https://algtrix.com.br/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: logo }))
  await ctx.route('**/api/loja/status', (r) => r.fulfill({ json: loja }))
  const p = await ctx.newPage()
  await p.goto('http://localhost:3123/', { waitUntil: 'networkidle' })
  await p.screenshot({ path: `${S}v2-home-${tag}.png`, fullPage: true })
  await p.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
  await p.locator('input[role=combobox]').fill('guaru'); await p.waitForTimeout(300); await p.keyboard.press('Enter')
  await p.getByText('Saúde e serviços sociais', { exact: true }).click()
  await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${S}v2-builder-${tag}.png`, fullPage: true })
  await p.route('**/api/pedido/**', (r) => r.fulfill({ json: { ...base, status: 'aguardando_pagamento', arquivos: [], pix: { qrCode: 'x', qrCodeBase64: qr, expiraEm: new Date(Date.now() + 24 * 3600000).toISOString() } } }))
  await p.goto('http://localhost:3123/pedido/ALG-20261015-D5F1AB65?t=x', { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  await p.screenshot({ path: `${S}v2-pix-${tag}.png`, fullPage: true })
  await p.unroute('**/api/pedido/**')
  await p.route('**/api/pedido/**', (r) => r.fulfill({ json: { ...base, status: 'concluido', pix: null, arquivos: [{ indiceItem: 0, nomeArquivo: 'a.zip', linhas: 3605, bytes: 1800000, formatos: ['CSV', 'XLSX', 'PDF'], url: '#' }] } }))
  await p.goto('http://localhost:3123/pedido/ALG-20261015-D5F1AB65?t=x', { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  await p.screenshot({ path: `${S}v2-concluido-${tag}.png`, fullPage: true })
  for (const n of ['home', 'builder', 'pix', 'concluido']) {}
  console.log(tag, await p.evaluate(() => document.documentElement.scrollWidth))
  await ctx.close()
}
await b.close()
