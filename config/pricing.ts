/**
 * Configuração central de preço, parcelamento e garantia.
 *
 * IMPORTANTE — REGRA DE NEGÓCIO (definida no briefing original):
 * "Somente informações verdadeiras. Se não houver, não inventar."
 *
 * Elli optou por seguir com placeholders nesta primeira versão. TODOS os
 * valores abaixo marcados com "A DEFINIR" são placeholders visíveis na UI
 * e devem ser substituídos por dados reais antes de publicar o site.
 * Este é o ÚNICO arquivo que precisa ser editado para atualizar a oferta.
 *
 * O preço exibido aqui é também a fonte de verdade usada pela validação
 * de preço no servidor em app/api/checkout/route.ts — o valor cobrado
 * NUNCA deve ser confiado a partir do cliente.
 */

export const PRICING_IS_PLACEHOLDER = true

export const pricing = {
  currency: 'BRL',
  // Preço cheio, em centavos, para evitar erros de ponto flutuante.
  priceCents: null as number | null, // TODO(Elli): definir preço à vista real, em centavos
  installments: {
    max: null as number | null, // TODO(Elli): número máximo de parcelas
    installmentValueCents: null as number | null, // TODO(Elli): valor de cada parcela
  },
  displayPrice: 'A definir', // usado como fallback textual enquanto priceCents for null
  savingsClaim: null as string | null, // só exibir se houver economia real comprovável
  guarantee: {
    enabled: false, // vira true quando houver política de garantia real
    days: null as number | null,
    description: null as string | null,
  },
  included: [
    // TODO(Elli): confirmar a lista final do que está incluído na oferta
    'Base de dados empresariais estruturada',
    'Filtros avançados de segmentação',
    'Formato de entrega digital',
  ],
} as const
