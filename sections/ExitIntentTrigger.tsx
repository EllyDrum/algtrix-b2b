'use client'

import { useEffect } from 'react'
import { useExitIntent } from '@/hooks/useExitIntent'
import { useLeadModal } from '@/components/LeadModalContext'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

/**
 * Componente invisível: observa intenção de saída (desktop apenas) e
 * abre o modal de captura de lead com uma copy de recuperação. Não
 * renderiza nada por conta própria — reaproveita o LeadCaptureModal
 * já existente para não empilhar um segundo popup na tela.
 */
export function ExitIntentTrigger() {
  const { triggered } = useExitIntent({ minTimeOnPageMs: 10000 })
  const { openLead } = useLeadModal()

  useEffect(() => {
    if (triggered) {
      track(AnalyticsEvent.ExitIntentShown, {})
      openLead('exit_intent')
    }
  }, [triggered, openLead])

  return null
}
