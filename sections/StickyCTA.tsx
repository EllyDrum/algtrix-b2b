'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

/** Barra fixa no celular: aparece depois do hero e leva ao montador de listas. */
export function StickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-sentinel')
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setVisible(!entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-algtrix-border bg-white/95 px-4 py-3 backdrop-blur sm:hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-algtrix-text">A partir de R$ 19,90</p>
              <p className="text-xs text-algtrix-dim">Sem assinatura</p>
            </div>
            <ButtonLink href="/montar-lista" size="md" onClick={() => track(AnalyticsEvent.StickyCtaClick, {})}>
              Montar lista
            </ButtonLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
