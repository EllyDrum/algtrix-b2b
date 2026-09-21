/**
 * Arquitetura preparada para testes A/B futuros (não ativa por padrão).
 * Cada experimento define variantes; getVariant() decide de forma
 * determinística por visitante (via lib/ab.ts) sem duplicar páginas.
 */
export type ExperimentKey =
  | 'hero_headline'
  | 'hero_cta_label'
  | 'pricing_display'
  | 'hero_layout'
  | 'offer_framing'
  | 'social_proof_position'
  | 'pricing_position'
  | 'section_order'

export interface Experiment {
  key: ExperimentKey
  description: string
  active: boolean
  variants: readonly string[]
}

export const experiments: readonly Experiment[] = [
  {
    key: 'hero_headline',
    description: 'Testar variações da headline principal do hero.',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'hero_cta_label',
    description: 'Testar o texto do CTA primário do hero.',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'pricing_display',
    description: 'Testar formato de exibição do preço (à vista vs. parcelado em destaque).',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'hero_layout',
    description: 'Testar hero com split visual vs. hero mais editorial.',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'offer_framing',
    description: 'Testar enquadramento da oferta (foco em economia de tempo vs. foco em volume de dados).',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'social_proof_position',
    description: 'Testar posição da faixa de credibilidade (logo após o hero vs. após a demonstração).',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'pricing_position',
    description: 'Testar posição da seção de preço no funil.',
    active: false,
    variants: ['control', 'variant_a'],
  },
  {
    key: 'section_order',
    description: 'Testar reordenação de seções intermediárias do funil.',
    active: false,
    variants: ['control', 'variant_a'],
  },
] as const
