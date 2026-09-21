import type { CompanySize, FakeCompany } from '@/types'

/**
 * Dados 100% fictícios para fins de demonstração visual do produto.
 * Nenhum CNPJ, telefone, e-mail ou nome de sócio aqui corresponde a uma
 * empresa ou pessoa real — os CNPJs usam a raiz reservada 00.000.000,
 * que nunca é emitida pela Receita Federal para empresas reais.
 */

const STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES'] as const

const CITIES_BY_STATE: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Sorocaba', 'Ribeirão Preto', 'Santos'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
  PR: ['Curitiba', 'Londrina', 'Maringá'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau'],
  BA: ['Salvador', 'Feira de Santana'],
  PE: ['Recife', 'Olinda'],
  CE: ['Fortaleza', 'Sobral'],
  GO: ['Goiânia', 'Anápolis'],
  DF: ['Brasília'],
  ES: ['Vitória', 'Vila Velha'],
}

const SEGMENT_META: Record<
  string,
  { cnae: string; activity: string; nameBank: string[]; suffixes: string[] }
> = {
  Tecnologia: {
    cnae: '62.01-5-01',
    activity: 'Desenvolvimento de programas de computador sob encomenda',
    nameBank: ['Nortec', 'Vetra', 'Cluster', 'Databit', 'Orbita', 'Fluxa'],
    suffixes: ['Sistemas', 'Software', 'Tecnologia', 'Labs'],
  },
  Saúde: {
    cnae: '86.30-5-03',
    activity: 'Atividade médica ambulatorial restrita a consultas',
    nameBank: ['Vitalis', 'Cliniva', 'Bemcuidar', 'Amparo', 'Prosaúde'],
    suffixes: ['Saúde', 'Clínica', 'Diagnósticos'],
  },
  Construção: {
    cnae: '41.20-4-00',
    activity: 'Construção de edifícios',
    nameBank: ['Alicerce', 'Construtiva', 'Montese', 'Solidez', 'Rocha Forte'],
    suffixes: ['Construções', 'Engenharia', 'Empreendimentos'],
  },
  Indústria: {
    cnae: '25.11-0-00',
    activity: 'Fabricação de estruturas metálicas',
    nameBank: ['Metalfor', 'Industrix', 'Ferraço', 'Produtiva', 'Aço Sul'],
    suffixes: ['Indústria', 'Metalúrgica', 'Manufatura'],
  },
  Comércio: {
    cnae: '46.49-4-99',
    activity: 'Comércio atacadista de outros produtos não especificados',
    nameBank: ['Comerciva', 'Distribu', 'Mercantil Rio', 'Atacarte', 'Girocom'],
    suffixes: ['Comércio', 'Distribuidora', 'Atacado'],
  },
  Serviços: {
    cnae: '82.11-3-00',
    activity: 'Serviços combinados de escritório e apoio administrativo',
    nameBank: ['Suporte Ativo', 'Gestora', 'Prontoserv', 'Facilita', 'Operosa'],
    suffixes: ['Serviços', 'Facilities', 'Soluções'],
  },
  Educação: {
    cnae: '85.13-9-00',
    activity: 'Ensino fundamental',
    nameBank: ['Saber Novo', 'Educare', 'Aprende Mais', 'Trilha', 'Constelação'],
    suffixes: ['Educacional', 'Ensino', 'Instituto'],
  },
  Logística: {
    cnae: '49.30-2-02',
    activity: 'Transporte rodoviário de carga',
    nameBank: ['Rotalog', 'Expressa', 'Tracker', 'Movita', 'Cargofly'],
    suffixes: ['Logística', 'Transportes', 'Cargas'],
  },
  Agronegócio: {
    cnae: '01.19-9-03',
    activity: 'Cultivo de grãos e cereais',
    nameBank: ['Terra Firme', 'Agrovale', 'Semeale', 'Campo Aberto', 'Raiz Agro'],
    suffixes: ['Agropecuária', 'Agronegócios', 'Grãos'],
  },
  Energia: {
    cnae: '35.11-5-01',
    activity: 'Geração de energia elétrica',
    nameBank: ['Voltago', 'Energiva', 'Solaris', 'Amperê', 'Fluxo Energia'],
    suffixes: ['Energia', 'Power', 'Geração'],
  },
  Finanças: {
    cnae: '64.99-9-99',
    activity: 'Outras atividades de serviços financeiros',
    nameBank: ['Capitalis', 'Rendere', 'Finaxis', 'Prosperar', 'Valorem'],
    suffixes: ['Capital', 'Finanças', 'Investimentos'],
  },
  Consultoria: {
    cnae: '70.20-4-00',
    activity: 'Atividades de consultoria em gestão empresarial',
    nameBank: ['Direciona', 'Estrategis', 'Vantagem', 'Norteia', 'Método Ativo'],
    suffixes: ['Consultoria', 'Assessoria', 'Advisory'],
  },
}

const LEGAL_NATURES = ['Sociedade Empresária Limitada', 'Empresário Individual', 'Sociedade Anônima']
const PARTNER_FIRST = ['Marina', 'Rafael', 'Camila', 'Bruno', 'Fernanda', 'Diego', 'Larissa', 'Otávio', 'Patrícia', 'Igor']
const PARTNER_LAST = ['Andrade', 'Teixeira', 'Moreira', 'Cavalcanti', 'Farias', 'Nogueira', 'Barbosa', 'Siqueira']
const PARTNER_ROLES = ['Sócio-administrador', 'Diretor comercial', 'Sócio', 'CEO']

/** Gera um dígito pseudo-aleatório determinístico a partir de uma seed. */
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)] as T
}

function sizeFromRank(rnd: () => number): CompanySize {
  const r = rnd()
  if (r < 0.35) return 'MEI'
  if (r < 0.7) return 'Pequena'
  if (r < 0.92) return 'Média'
  return 'Grande'
}

function formatFakeCnpj(index: number): string {
  const n = 1000000 + index
  const p1 = String(n).slice(0, 2)
  const p2 = String(n).slice(2, 5)
  const p3 = String(n).slice(5, 8)
  return `00.000.${p1}${p2 ? '' : ''}${p2}/${p3}0-${(index % 89) + 10}`.slice(0, 18)
}

export function generateFakeCompanies(count: number, segmentFilter?: string, stateFilter?: string): FakeCompany[] {
  const segments = segmentFilter && segmentFilter !== 'Todos' ? [segmentFilter] : Object.keys(SEGMENT_META)
  const states = stateFilter && stateFilter !== 'Todos' ? [stateFilter] : [...STATES]

  const companies: FakeCompany[] = []
  for (let i = 0; i < count; i += 1) {
    const rnd = seededRandom(i * 7919 + 13)
    const segment = pick(segments, rnd) ?? 'Serviços'
    const meta = SEGMENT_META[segment] ?? SEGMENT_META.Serviços!
    const state = pick(states, rnd) ?? 'SP'
    const cityList = CITIES_BY_STATE[state] ?? ['Capital']
    const city = pick(cityList, rnd)
    const namePart = pick(meta.nameBank, rnd)
    const suffix = pick(meta.suffixes, rnd)
    const companyName = `${namePart} ${suffix} ${LEGAL_NATURES[0] === '' ? '' : ''}Ltda`.replace(/\s+/g, ' ').trim()
    const tradeName = `${namePart} ${suffix}`
    const partnerName = `${pick(PARTNER_FIRST, rnd)} ${pick(PARTNER_LAST, rnd)}`
    const ddd = 11 + Math.floor(rnd() * 79)
    const openedYear = 2008 + Math.floor(rnd() * 17)

    companies.push({
      cnpj: formatFakeCnpj(i + 1),
      companyName: `${companyName} ${LEGAL_NATURES[Math.floor(rnd() * LEGAL_NATURES.length)] === 'Empresário Individual' ? '' : 'Ltda'}`.trim(),
      tradeName,
      cnae: meta.cnae,
      activityDescription: meta.activity,
      size: sizeFromRank(rnd),
      legalNature: pick(LEGAL_NATURES, rnd),
      shareCapital: `R$ ${(5 + Math.floor(rnd() * 495)) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      city,
      state,
      zip: `${10000 + Math.floor(rnd() * 89999)}-${100 + Math.floor(rnd() * 899)}`,
      phone: `(${ddd}) ${3000 + Math.floor(rnd() * 5999)}-${1000 + Math.floor(rnd() * 8999)}`,
      mobile: `(${ddd}) 9${6000 + Math.floor(rnd() * 3999)}-${1000 + Math.floor(rnd() * 8999)}`,
      email: `contato@${tradeName.toLowerCase().replace(/\s+/g, '')}.com.br`,
      partnerName,
      partnerRole: pick(PARTNER_ROLES, rnd),
      isHeadquarters: rnd() > 0.22,
      simplesNacional: rnd() > 0.4,
      openedAt: `${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}/${openedYear}`,
    })
  }
  return companies
}

/** Amostra fixa (não regenerada por filtro) usada na seção "Veja o que existe dentro da base". */
export const sampleDataset: FakeCompany[] = generateFakeCompanies(14)

/**
 * Estima uma contagem "de produto real" para o Data Explorer com base
 * nos filtros selecionados. É uma simulação visual, não uma consulta
 * real a uma base de dados.
 */
export function estimateResultCount(filters: { state: string; segment: string; size: string; status: string }): number {
  let base = 182_430
  if (filters.state !== 'Todos') base = Math.round(base / 9)
  if (filters.segment !== 'Todos') base = Math.round(base / 3.4)
  if (filters.size !== 'Todos') base = Math.round(base / 2.1)
  if (filters.status !== 'Todas') base = Math.round(base / 1.6)
  const seedValue = `${filters.state}${filters.segment}${filters.size}${filters.status}`
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const rnd = seededRandom(seedValue)
  const jitter = 0.85 + rnd() * 0.3
  return Math.max(37, Math.round(base * jitter))
}
