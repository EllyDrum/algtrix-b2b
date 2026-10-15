import { precoPorQuantidade, cotar, contarEmpresas, formatarBRL } from '@/lib/pricing-engine'
for (const n of [1, 2000, 2001, 5000, 10000, 50000, 150000, 250000, 1000000, 8704846]) console.log(n, formatarBRL(precoPorQuantidade(n)))
const sp = { uf: 'SP', secoes: [], portes: [], incluirMei: true }
console.log('SP total com MEI', contarEmpresas(sp as any))
const c = cotar([{ uf: 'AC', secoes: [], portes: [], incluirMei: false }, { uf: 'RR', secoes: ['G'], portes: ['ME'], incluirMei: false }, { uf: 'AC', secoes: [], portes: [], incluirMei: false }] as any)
console.log(c.itens.map((i) => [i.descricao, i.empresas, i.precoCentavos]), c.subtotalCentavos, c.descontoPercentual, c.totalCentavos)
