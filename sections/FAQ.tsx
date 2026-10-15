'use client'

import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Accordion } from '@/components/ui/Accordion'
import { faqItems } from '@/data/faq'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function FAQ() {
  return (
    <Section id="faq" tone="bg">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
        <SectionHeader
          eyebrow="Dúvidas"
          title="Perguntas frequentes"
          lead="O que mais perguntam antes da primeira compra. Se faltar algo, fale com a gente pelo e-mail do rodapé."
        />
        <Reveal delay={0.06}>
          <Accordion items={faqItems} onOpenItem={(question) => track(AnalyticsEvent.FaqOpen, { question })} />
        </Reveal>
      </div>
    </Section>
  )
}
