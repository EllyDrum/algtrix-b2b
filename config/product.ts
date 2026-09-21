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
    updateFrequency: 'A definir', // TODO(Elli): confirmar periodicidade real de atualização
    coverage: 'Nacional', // TODO(Elli): confirmar cobertura geográfica exata
  },
  demoDisclaimer: 'Demonstração ilustrativa. Os dados exibidos abaixo são fictícios.',
  filters: [
    { group: 'Localização', fields: ['Estado', 'Cidade', 'Região', 'CEP'] },
    { group: 'Atividade', fields: ['CNAE', 'Atividade principal', 'Atividades secundárias'] },
    { group: 'Empresa', fields: ['Porte', 'Natureza jurídica', 'Matriz', 'Filial'] },
    { group: 'Situação', fields: ['Situação cadastral', 'MEI', 'Simples Nacional'] },
    { group: 'Estrutura', fields: ['Capital social', 'Data de abertura'] },
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
    'Telefone',
    'Celular',
    'E-mail',
    'Sócio',
    'Cargo',
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
