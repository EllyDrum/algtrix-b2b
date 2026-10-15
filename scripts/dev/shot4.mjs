// Requer: npm i -D playwright
import { chromium } from 'playwright'
const S = '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await b.newContext({ viewport: { width: 1366, height: 1000 } })
await ctx.route('https://algtrix.com.br/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="87"><text x="0" y="66" font-family="Arial" font-weight="700" font-size="70" fill="#1C1533">algtrix</text></svg>' }))
const p = await ctx.newPage()
await p.goto('http://localhost:3123/montar-lista', { waitUntil: 'networkidle' })
await p.locator('input[role=combobox]').fill('sao')
await p.waitForTimeout(300)
await p.screenshot({ path: S + '10-busca-acentos.png', clip: { x: 0, y: 250, width: 1366, height: 560 } })
await b.close()
