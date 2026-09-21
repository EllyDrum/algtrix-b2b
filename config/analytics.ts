/**
 * Nomes de eventos de funil centralizados. Usar sempre estas constantes
 * em vez de strings soltas ao chamar track() de lib/analytics.ts.
 */
export const AnalyticsEvent = {
  HeroCta: 'hero_cta',
  DemoStart: 'demo_start',
  FilterUsed: 'filter_used',
  DataPreview: 'data_preview',
  SegmentSelected: 'segment_selected',
  PricingView: 'pricing_view',
  LeadStarted: 'lead_started',
  LeadCompleted: 'lead_completed',
  CheckoutStarted: 'checkout_started',
  Purchase: 'purchase',
  FaqOpen: 'faq_open',
  WhatsappClick: 'whatsapp_click',
  ExitIntentShown: 'exit_intent_shown',
  StickyCtaClick: 'sticky_cta_click',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

/** Funil de referência para instrumentação e análise de abandono. */
export const conversionFunnel: AnalyticsEventName[] = [
  AnalyticsEvent.HeroCta,
  AnalyticsEvent.DemoStart,
  AnalyticsEvent.PricingView,
  AnalyticsEvent.CheckoutStarted,
  AnalyticsEvent.Purchase,
]
