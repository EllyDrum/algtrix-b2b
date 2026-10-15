'use client'

import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function FinalCTA() {
  return (
    <section className="bg-algtrix-surface px-5 pb-20 pt-4 sm:px-8 sm:pb-24">
      <Reveal>
        <div className="relative mx-auto max-w-pageWide overflow-hidden rounded-lg bg-[#1c1533] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 15% 20%, rgba(92,73,144,0.5), transparent 45%), radial-gradient(circle at 85% 80%, rgba(65,183,196,0.25), transparent 40%)',
            }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="mx-auto max-w-[22ch] text-[1.75rem] font-semibold leading-[1.15] text-white sm:text-[2.5rem]">
              Comece a encontrar as empresas certas hoje.
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base text-white/70">
              Monte o recorte, veja o preço e baixe a lista em minutos. A partir de R$ 19,90, sem assinatura.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink
                href="/montar-lista"
                size="lg"
                onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'final_cta' })}
              >
                Montar minha lista
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
