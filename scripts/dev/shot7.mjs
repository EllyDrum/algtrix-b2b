// Requer: npm i -D playwright
import { chromium } from 'playwright'
const S = '/tmp/claude-0/-home-claude/becdf52b-bce3-5816-94aa-767db0e24389/scratchpad/'
const logo = '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="87"><text x="0" y="66" font-family="Arial" font-weight="700" font-size="70" fill="#1C1533">algtrix</text></svg>'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ben = { nome: 'ALGTRIX CONSULTORIA LTDA', chave: '48653532000154' }
const base = { id: 'ALG-20261015-0E43E670', email: 'cl***@empresa.com.br', competencia: '2026-09', subtotalCentavos: 2690, descontoCentavos: 0, totalCentavos: 2690, metodo: 'pix', provedor: 'pix-estatico', beneficiario: ben, criadoEm: new Date().toISOString(), pix: null,
  itens: [{ descricao: 'Guarulhos (SP) · Saúde e serviços sociais · ME, EPP e Demais · sem MEI', empresas: 3605, precoCentavos: 2690 }],
  status: 'concluido', arquivos: [{ indiceItem: 0, nomeArquivo: 'a.zip', linhas: 3605, bytes: 1800000, formatos: ['CSV','XLSX','PDF'], url: '#', downloads: [
    { formato: 'XLSX', nomeArquivo: 'a.xlsx', bytes: 820000, url: '#' }, { formato: 'PDF', nomeArquivo: 'a.pdf', bytes: 460000, url: '#' }, { formato: 'CSV', nomeArquivo: 'a.zip', bytes: 1800000, url: '#' }] }] }
for (const [w, h, tag] of [[1366, 900, 'desk'], [390, 844, 'mob']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
  await ctx.route('https://algtrix.com.br/**', (r) => r.fulfill({ contentType: 'image/svg+xml', body: logo }))
  const p = await ctx.newPage()
  await p.route('**/api/pedido/**', (r) => r.fulfill({ json: base }))
  await p.goto('http://localhost:3123/pedido/ALG-20261015-0E43E670?t=x', { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  await p.screenshot({ path: `${S}v3-concluido-${tag}.png`, fullPage: true })
  await ctx.close()
}
await b.close()
