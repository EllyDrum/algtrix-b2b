'use client'

import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink, Button } from '@/components/ui/Button'
import { DataExplorerPanel } from '@/components/DataExplorerPanel'
import { product } from '@/config/product'
import { useLeadModal } from '@/components/LeadModalContext'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function Hero() {
  const { openLead } = useLeadModal()

  return (
    <section id="produto" className="relative overflow-hidden bg-brand-dark pt-16 pb-20 sm:pt-20 sm:pb-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(76,62,122,0.35), transparent 45%), radial-gradient(circle at 85% 0%, rgba(5,150,105,0.14), transparent 40%)',
        }}
        aria-hidden
      />
      <div id="hero-sentinel" className="absolute top-0 h-px w-full" aria-hidden />

      <div className="relative mx-auto grid max-w-page gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
            {product.eyebrow}
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Encontre as empresas certas para o seu próximo negócio.
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-white/70 sm:text-lg">
            Dados empresariais estruturados para segmentar mercados e acelerar sua prospecção B2B.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="#oferta"
              size="lg"
              onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'hero_primary' })}
            >
              Quero acessar a base
            </ButtonLink>
            <Button
              variant="secondary"
              size="lg"
              className="border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              onClick={() => {
                document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ver como funciona
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <DataExplorerPanel variant="hero" />
        </Reveal>
      </div>
    </section>
  )
}
