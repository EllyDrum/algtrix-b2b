'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Accordion } from '@/components/ui/Accordion'
import { faqItems } from '@/data/faq'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Perguntas frequentes
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-9 max-w-2xl">
          <Accordion items={faqItems} onOpenItem={(question) => track(AnalyticsEvent.FaqOpen, { question })} />
        </Reveal>
      </div>
    </section>
  )
}
