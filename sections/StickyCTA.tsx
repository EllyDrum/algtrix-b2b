'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { product } from '@/config/product'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function StickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-sentinel')
    if (!target) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setVisible(!entry.isIntersecting)
    }, { threshold: 0 })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  function handleClick() {
    track(AnalyticsEvent.StickyCtaClick, {})
    document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur sm:bottom-4 sm:inset-x-4 sm:rounded-full sm:border sm:shadow-card lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-auto"
        >
          <div className="flex h-[56px] items-center justify-between gap-4 px-4 sm:h-[60px] sm:px-5 lg:gap-6">
            <span className="hidden text-sm font-semibold text-ink-primary lg:block">
              {product.eyebrow.replace(' | ', ' · ')}
            </span>
            <span className="text-sm font-medium text-ink-secondary lg:hidden">Acesse a base</span>
            <Button size="md" onClick={handleClick} className="shrink-0">
              Quero acessar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
