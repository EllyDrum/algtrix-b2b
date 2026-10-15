// Requer: npm i -D playwright
import { chromium } from 'playwright'
const S = '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/'
const logo = '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="87"><text x="0" y="66" font-family="Arial" font-weight="700" font-size="70" fill="#1C1533">algtrix</text></svg>'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w, h, tag] of [[1366, 900, 'desk'], [390, 844, 'mob'], [820, 1180, 'tab']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await ctx.route('https://algtrix.com.br/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: logo }))
  const p = await ctx.newPage()
  await p.goto('http://localhost:3123/', { waitUntil: 'networkidle' })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } window.scrollTo(0, 0) })
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${S}home-${tag}.png`, fullPage: true })
  console.log(tag, 'home scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth))
  await p.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
  await p.locator('input[role=combobox]').fill('guaru'); await p.waitForTimeout(300); await p.keyboard.press('Enter')
  await p.getByText('Saúde e serviços sociais', { exact: true }).click()
  await p.getByRole('button', { name: /Adicionar ao carrinho/ }).click()
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${S}builder-${tag}.png`, fullPage: true })
  console.log(tag, 'builder scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth))
  await ctx.close()
}
await b.close()
