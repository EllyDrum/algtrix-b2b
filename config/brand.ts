/**
 * ConfiguraÃ§Ã£o central da marca. Nenhum outro arquivo deve conter o nome
 * "Algtrix" hardcoded fora deste config â€” sempre importe daqui.
 */
export const brand = {
  name: 'Algtrix',
  legalName: 'Algtrix Tecnologia e InteligÃªncia de Dados',
  domain: 'algtrix.com.br',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://b2b.algtrix.com.br',
  tagline: 'InteligÃªncia comercial para encontrar as empresas certas.',
  positioning:
    'A Algtrix trabalha com dados, modelagem e inteligÃªncia para apoiar decisÃµes. Esta Ã© a mesma lÃ³gica aplicada ao universo comercial B2B.',
  social: {
    linkedin: 'https://www.linkedin.com/company/algtrix',
  },
  legalLinks: {
    privacyPolicy: '/politica-de-privacidade',
    terms: '/termos-de-uso',
    refundPolicy: '/politica-de-reembolso',
  },
  support: {
    email: 'contato@algtrix.com',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  },
} as const
