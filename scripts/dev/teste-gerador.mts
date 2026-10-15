// Teste local do gerador: R2_LOCAL_DIR=/home/claude/r2local npx tsx scripts/dev/teste-gerador.mts
import { gerarArquivoItem } from '@/lib/server/gerador'
import { contarEmpresas, normalizarItem } from '@/lib/pricing-engine'

const uf = process.argv[2] ?? 'AC'
const item = normalizarItem({ uf, secoes: (process.argv[3] ?? '').split('').filter(Boolean), portes: [], incluirMei: process.argv[4] === 'mei' })
const t = Date.now()
const r = await gerarArquivoItem('ALG-20261011-TESTE001', 0, item, Number(process.argv[5] ?? contarEmpresas(item)))
console.log(r, (Date.now() - t) + 'ms', Math.round(process.memoryUsage().rss / 1e6) + 'MB rss')
