// Requer: npm i -D playwright
import { chromium } from 'playwright'
import fs from 'node:fs'
const S = '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/'
const qr = fs.readFileSync(S + 'qr.txt', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } })
// O logo vem de algtrix.com.br (bloqueado neste ambiente): substitui por um rótulo para a captura.
await ctx.route('https://algtrix.com.br/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="87"><text x="0" y="66" font-family="Arial" font-weight="700" font-size="70" fill="#1C1533">algtrix</text></svg>' }))
const p = await ctx.newPage()
await p.goto('http://localhost:3123/', { waitUntil: 'networkidle' })
await p.screenshot({ path: S + '1-inicio.png' })
await p.locator('#oferta').scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
await p.locator('#oferta').screenshot({ path: S + '2-precos.png' })
await p.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
await p.selectOption('select', 'SP')
await p.getByText('Informação, comunicação e tecnologia', { exact: true }).click()
await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
await p.getByText('Informação, comunicação e tecnologia', { exact: true }).click()
await p.getByText('Saúde e serviços sociais', { exact: true }).click()
await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
await p.selectOption('select', 'MG')
await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
await p.waitForTimeout(400)
await p.screenshot({ path: S + '3-montar-lista.png', fullPage: true })
const now = Date.now()
const base = { id: 'ALG-20261014-3F9A21C7', email: 'cl***@empresa.com.br', competencia: '2026-09', subtotalCentavos: 0, descontoCentavos: 0, totalCentavos: 0, metodo: 'pix', criadoEm: new Date().toISOString(),
  itens: [{ descricao: 'São Paulo (SP) · Informação, comunicação e tecnologia · ME, EPP e Demais · sem MEI', empresas: 152340, precoCentavos: 15990 }, { descricao: 'São Paulo (SP) · Saúde e serviços sociais · ME, EPP e Demais · sem MEI', empresas: 118704, precoCentavos: 14590 }] }
base.totalCentavos = Math.round((15990 + 14590) * 0.95)
await p.route('**/api/pedido/**', (r) => r.fulfill({ json: { ...base, status: 'aguardando_pagamento', arquivos: [], pix: { qrCode: '00020126580014BR.GOV.BCB.PIX...', qrCodeBase64: qr, expiraEm: new Date(now + 29 * 60000).toISOString() } } }))
await p.goto('http://localhost:3123/pedido/ALG-20261014-3F9A21C7?t=x', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.screenshot({ path: S + '4-pedido-pix.png' })
await p.unroute('**/api/pedido/**')
await p.route('**/api/pedido/**', (r) => r.fulfill({ json: { ...base, status: 'concluido', pix: null, arquivos: [
  { indiceItem: 0, nomeArquivo: 'a.zip', linhas: 152340, bytes: 21800000, formatos: ['CSV'], url: '#' },
  { indiceItem: 1, nomeArquivo: 'b.zip', linhas: 118704, bytes: 17100000, formatos: ['CSV'], url: '#' }] } }))
await p.goto('http://localhost:3123/pedido/ALG-20261014-3F9A21C7?t=x', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.screenshot({ path: S + '5-pedido-concluido.png' })
const m = await b.newPage({ viewport: { width: 390, height: 844 } })
await m.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
await m.screenshot({ path: S + '6-celular.png' })
await b.close()
