'use client'

import { ButtonLink } from '@/components/ui/Button'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function FinalCTA() {
  return (
    <section className="border-t border-algtrix-border bg-algtrix-bg py-20 text-center sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <h2 className="mx-auto max-w-[22ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
          Comece a encontrar as empresas certas hoje.
        </h2>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="#oferta" size="lg" onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'final_cta' })}>
            Quero acessar a base
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
