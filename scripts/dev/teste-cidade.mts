import { cotar, normalizarItem } from '@/lib/pricing-engine'
import { municipiosDosItens } from '@/lib/server/municipios'
import { gerarArquivoItem } from '@/lib/server/gerador'
const item = normalizarItem({ uf: 'SP', municipio: '6477', municipioNome: 'NOME FALSO', secoes: ['Q'], portes: [], incluirMei: false })
const c = cotar([item], await municipiosDosItens([item]))
console.log(c.itens.map((i) => [i.descricao, i.empresas, i.precoCentavos]))
const r = await gerarArquivoItem('ALG-20261014-CIDADE01', 0, c.itens[0]!, c.itens[0]!.empresas)
console.log(r.nomeArquivo, r.linhas, '(base local contém só a parte 1 de 9 de SP)')
