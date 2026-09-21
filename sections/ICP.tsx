'use client'

import { ArrowRight } from '@phosphor-icons/react/dist/ssr/ArrowRight'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { useLeadModal } from '@/components/LeadModalContext'

const PARTS = ['Segmento', 'Região', 'Porte', 'Atividade', 'Perfil']

export function ICP() {
  const { openLead } = useLeadModal()

  return (
    <section className="bg-algtrix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-[24ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Comece pelo seu cliente ideal.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div
              className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-algtrix-borderAccent to-algtrix-borderAccent sm:block"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:justify-between">
              {PARTS.map((part) => (
                <span
                  key={part}
                  className="relative rounded-md border border-algtrix-border bg-algtrix-surface px-4 py-3 text-sm font-semibold text-algtrix-text"
                >
                  {part}
                </span>
              ))}
              <ArrowRight size={18} className="hidden shrink-0 text-algtrix-accent sm:block" />
              <span className="relative flex items-center gap-2 rounded-md border border-algtrix-borderAccent bg-algtrix-accentSoft px-5 py-3.5 text-sm font-semibold text-algtrix-text shadow-glow">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-algtrix-accent" aria-hidden />
                Mercado-alvo
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14} className="mt-10 flex justify-center">
          <Button onClick={() => openLead('icp')}>Quero encontrar meu mercado</Button>
        </Reveal>
      </div>
    </section>
  )
}
