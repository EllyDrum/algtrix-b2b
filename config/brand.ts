/**
 * Configuração central da marca. Nenhum outro arquivo deve conter o nome
 * "Algtrix" hardcoded fora deste config — sempre importe daqui.
 */
export const brand = {
  name: 'Algtrix',
  legalName: 'Algtrix Tecnologia e Inteligência de Dados',
  domain: 'algtrix.com.br',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://b2b.algtrix.com.br',
  tagline: 'Inteligência comercial para encontrar as empresas certas.',
  positioning:
    'A Algtrix trabalha com dados, modelagem e inteligência para apoiar decisões. Esta é a mesma lógica aplicada ao universo comercial B2B.',
  social: {
    linkedin: 'https://www.linkedin.com/company/algtrix',
  },
  legalLinks: {
    privacyPolicy: '/politica-de-privacidade',
    terms: '/termos-de-uso',
    refundPolicy: '/politica-de-reembolso',
  },
  support: {
    email: 'contato@algtrix.com.br',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  },
} as const
