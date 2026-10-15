import { cotar, normalizarItem } from '@/lib/pricing-engine'
import { municipiosDosItens } from '@/lib/server/municipios'
const its = [
  normalizarItem({ uf: 'SP', municipio: '6477', secoes: ['Q'], portes: [], incluirMei: false }),
  normalizarItem({ uf: 'SP', municipio: '6475', secoes: [], portes: [], incluirMei: false }),
]
const c = cotar(its, await municipiosDosItens(its))
console.log(c.itens.map((i) => [i.descricao, i.empresas]))
