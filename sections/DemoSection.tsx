'use client'

import { useEffect, useRef } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { DataExplorerPanel } from '@/components/DataExplorerPanel'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function DemoSection() {
  const started = useRef(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !started.current) {
          started.current = true
          track(AnalyticsEvent.DemoStart, {})
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="demonstracao" ref={sectionRef} className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[24ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Não imagine. Veja como funciona.
          </h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-algtrix-muted">
            Ajuste os filtros abaixo como faria com a base real e veja a interface responder.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <DataExplorerPanel variant="full" />
        </Reveal>
      </div>
    </section>
  )
}
