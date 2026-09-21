'use client'

import { ButtonLink } from '@/components/ui/Button'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function FinalCTA() {
  return (
    <section className="bg-brand-dark py-20 text-center sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <h2 className="mx-auto max-w-[22ch] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Comece a encontrar as empresas certas hoje.
        </h2>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="#oferta" size="lg" onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'final_cta' })}>
            Começar agora
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
