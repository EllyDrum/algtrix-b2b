// Requer: npm i -D playwright
import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w, h, name] of [[1366, 900, 'desk'], [390, 844, 'mob']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
  await p.selectOption('select', 'MG')
  await p.getByText('Construção', { exact: false }).first().click()
  await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await p.getByText('Indústria de transformação').click()
  await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await p.screenshot({ path: `/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/builder-${name}.png`, fullPage: true })
  const sw = await p.evaluate(() => document.documentElement.scrollWidth)
  console.log(name, 'scrollWidth', sw)
}
const p = await b.newPage({ viewport: { width: 1366, height: 900 } })
await p.goto('http://localhost:3123/#oferta', { waitUntil: 'networkidle' })
await p.locator('#oferta').screenshot({ path: '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/oferta.png' })
await b.close()
