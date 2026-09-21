'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { useLeadModal } from '@/components/LeadModalContext'

const PARTS = ['Segmento', 'Região', 'Porte', 'Atividade', 'Perfil']

export function ICP() {
  const { openLead } = useLeadModal()

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-[24ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Comece pelo seu cliente ideal.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-center">
            {PARTS.map((part, index) => (
              <div key={part} className="flex items-center gap-3">
                <span className="rounded-lg border border-border bg-zinc-50 px-4 py-3 text-sm font-semibold text-ink-primary">
                  {part}
                </span>
                {index < PARTS.length - 1 && <span className="text-lg font-semibold text-ink-secondary/50">+</span>}
              </div>
            ))}
            <span className="text-lg font-semibold text-ink-secondary/50">=</span>
            <span className="rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white">
              Mercado alvo
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.14} className="mt-9 flex justify-center">
          <Button onClick={() => openLead('icp')}>Quero encontrar meu mercado</Button>
        </Reveal>
      </div>
    </section>
  )
}
