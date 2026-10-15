/**
 * Configuração central do produto comercial "Algtrix B2B".
 * Nome comercial, descrição e formato de entrega centralizados aqui.
 */
export const product = {
  name: 'Algtrix B2B',
  eyebrow: 'Algtrix B2B | Inteligência Comercial',
  category: 'Base de dados empresariais para prospecção B2B',
  shortDescription:
    'Dados empresariais estruturados para criar listas segmentadas, identificar mercados e acelerar sua prospecção B2B.',
  deliverable: {
    // TODO(Elli): confirmar formato final de entrega (Excel, CSV, acesso via plataforma, etc.)
    formats: ['Excel (.xlsx)', 'CSV'],
    updateFrequency: 'Mensal (base atual: competência 2026-09)',
    coverage: 'Nacional, 27 UFs',
  },
  demoDisclaimer: 'Demonstração ilustrativa. Os dados exibidos abaixo são fictícios.',
  filters: [
    { group: 'Localização', fields: ['Estado (27 UFs)', 'Cidade (5.572 municípios)'] },
    { group: 'Atividade', fields: ['Segmento (21 seções da CNAE)', 'CNAE principal e secundários no arquivo'] },
    { group: 'Empresa', fields: ['Porte: ME, EPP e Demais', 'Incluir ou excluir MEI'] },
    { group: 'Situação', fields: ['Somente empresas ativas'] },
  ],
  dataFields: [
    'CNPJ',
    'Razão social',
    'Nome fantasia',
    'CNAE',
    'Descrição da atividade',
    'Porte',
    'Natureza jurídica',
    'Capital social',
    'Cidade',
    'UF',
    'CEP',
    'Endereço completo',
    'Data de abertura',
    'Telefone 1 e 2',
    'E-mail',
  ],
  segments: [
    'Tecnologia',
    'Saúde',
    'Construção',
    'Indústria',
    'Comércio',
    'Serviços',
    'Educação',
    'Logística',
    'Agronegócio',
    'Energia',
    'Finanças',
    'Consultoria',
  ],
} as const
