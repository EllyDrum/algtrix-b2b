'use client'

import { useEffect, useRef } from 'react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { DataExplorerPanel } from '@/components/DataExplorerPanel'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function DemoSection() {
  const started = useRef(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true
          track(AnalyticsEvent.DemoStart, {})
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Section id="demonstracao" tone="surface">
      <div ref={ref}>
        <SectionHeader
          eyebrow="Demonstração"
          title="Veja como a base responde aos seus filtros."
          lead="Ajuste estado, segmento e porte como faria na compra real. Os dados exibidos aqui são ilustrativos; os dados reais são liberados após o pagamento."
        />
        <Reveal delay={0.08} className="mt-10">
          <DataExplorerPanel variant="full" />
        </Reveal>
      </div>
    </Section>
  )
}
