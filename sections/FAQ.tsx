'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Accordion } from '@/components/ui/Accordion'
import { faqItems } from '@/data/faq'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const QUICK_FACTS = [
  { question: 'Recebo como?', answer: 'Acesso digital, liberado após a confirmação da compra.' },
  { question: 'Preciso saber programação?', answer: 'Não. O uso é direto, sem conhecimento técnico.' },
  { question: 'Funciona no Excel?', answer: 'Sim, os arquivos são compatíveis com Excel e planilhas.' },
  { question: 'Posso filtrar os dados?', answer: 'Sim, por localização, segmento, porte e mais.' },
  { question: 'Quando recebo?', answer: 'O prazo exato é informado no momento da compra.' },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-algtrix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[22ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Perguntas frequentes
          </h2>
        </Reveal>

        <Reveal delay={0.06} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_FACTS.map((item) => (
            <div key={item.question} className="rounded-md border border-algtrix-border bg-algtrix-surface p-4">
              <p className="text-[13px] font-semibold text-algtrix-text">{item.question}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-algtrix-dim">{item.answer}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-2xl">
          <Accordion items={faqItems} onOpenItem={(question) => track(AnalyticsEvent.FaqOpen, { question })} />
        </Reveal>
      </div>
    </section>
  )
}
