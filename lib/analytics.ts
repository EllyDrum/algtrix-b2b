'use client'

import type { AnalyticsEventName } from '@/config/analytics'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Ponto único de disparo de eventos de funil. Em produção, isto empurra
 * para o dataLayer (GTM/GA4). Em desenvolvimento, apenas loga no console.
 * Nenhum componente deve chamar window.dataLayer diretamente.
 */
export function track(event: AnalyticsEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...payload, timestamp: Date.now() })

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, payload)
  }
}
