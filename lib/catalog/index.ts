import { STATS_UF, type Contagem } from './stats-uf'

export { COMPETENCIA, TOTAL_EMPRESAS, STATS_UF } from './stats-uf'

/** Unidades da Federação disponíveis na base, com o nome por extenso. */
export const UFS: { sigla: string; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
]

export const UF_NOME: Record<string, string> = Object.fromEntries(UFS.map((u) => [u.sigla, u.nome]))

/** Seções da CNAE 2.0 (IBGE), com nomes comerciais e as divisões (2 primeiros dígitos) de cada uma. */
export const SECOES: { codigo: string; nome: string; divisoes: [number, number] }[] = [
  { codigo: 'A', nome: 'Agropecuária, pesca e produção florestal', divisoes: [1, 3] },
  { codigo: 'B', nome: 'Indústrias extrativas e mineração', divisoes: [5, 9] },
  { codigo: 'C', nome: 'Indústria de transformação', divisoes: [10, 33] },
  { codigo: 'D', nome: 'Eletricidade e gás', divisoes: [35, 35] },
  { codigo: 'E', nome: 'Água, esgoto e gestão de resíduos', divisoes: [36, 39] },
  { codigo: 'F', nome: 'Construção', divisoes: [41, 43] },
  { codigo: 'G', nome: 'Comércio e reparação de veículos', divisoes: [45, 47] },
  { codigo: 'H', nome: 'Transporte, armazenagem e correio', divisoes: [49, 53] },
  { codigo: 'I', nome: 'Alojamento e alimentação', divisoes: [55, 56] },
  { codigo: 'J', nome: 'Informação, comunicação e tecnologia', divisoes: [58, 63] },
  { codigo: 'K', nome: 'Atividades financeiras e seguros', divisoes: [64, 66] },
  { codigo: 'L', nome: 'Atividades imobiliárias', divisoes: [68, 68] },
  { codigo: 'M', nome: 'Serviços profissionais, científicos e técnicos', divisoes: [69, 75] },
  { codigo: 'N', nome: 'Serviços administrativos e complementares', divisoes: [77, 82] },
  { codigo: 'O', nome: 'Administração pública', divisoes: [84, 84] },
  { codigo: 'P', nome: 'Educação', divisoes: [85, 85] },
  { codigo: 'Q', nome: 'Saúde e serviços sociais', divisoes: [86, 88] },
  { codigo: 'R', nome: 'Artes, cultura, esporte e recreação', divisoes: [90, 93] },
  { codigo: 'S', nome: 'Outros serviços', divisoes: [94, 96] },
  { codigo: 'T', nome: 'Serviços domésticos', divisoes: [97, 97] },
  { codigo: 'U', nome: 'Organismos internacionais', divisoes: [99, 99] },
]

export const SECAO_NOME: Record<string, string> = Object.fromEntries(SECOES.map((s) => [s.codigo, s.nome]))

/** Retorna a letra da seção CNAE a partir do código CNAE principal (7 dígitos). */
export function secaoDoCnae(cnae: string | null | undefined): string | null {
  if (!cnae || cnae.length < 2) return null
  const divisao = Number(cnae.slice(0, 2))
  const secao = SECOES.find((s) => divisao >= s.divisoes[0] && divisao <= s.divisoes[1])
  return secao ? secao.codigo : null
}

export const PORTES = [
  { codigo: 'ME', nome: 'Microempresa (ME)', receita: '01' },
  { codigo: 'EPP', nome: 'Empresa de Pequeno Porte (EPP)', receita: '03' },
  { codigo: 'DEMAIS', nome: 'Demais portes (médias e grandes)', receita: '05' },
] as const

export type PorteCodigo = (typeof PORTES)[number]['codigo']

/** Arquivos Parquet da base por UF (as partes refletem a divisão original em blocos de até 999.999 linhas). */
export const PARTES_UF: Record<string, string[]> = Object.fromEntries(
  UFS.map(({ sigla }) => {
    const total = ({ BA: 2, GO: 2, MG: 3, PR: 3, RJ: 3, RS: 2, SC: 2, SP: 9 } as Record<string, number>)[sigla] ?? 1
    return [sigla, Array.from({ length: total }, (_, i) => `${sigla}/parte-${i + 1}-${total}.parquet`)]
  }),
)

export function contagemUf(uf: string): Record<string, Contagem> | undefined {
  return STATS_UF[uf]
}
