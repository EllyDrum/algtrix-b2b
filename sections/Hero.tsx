'use client'

import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink, Button } from '@/components/ui/Button'
import { DataExplorerPanel } from '@/components/DataExplorerPanel'
import { product } from '@/config/product'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

export function Hero() {
  return (
    <section id="produto" className="relative overflow-hidden bg-algtrix-bg pt-16 pb-20 sm:pt-20 sm:pb-24">
      <div className="data-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 15%, rgba(92,73,144,0.14), transparent 45%), radial-gradient(circle at 88% 0%, rgba(15,138,151,0.10), transparent 42%)',
        }}
        aria-hidden
      />
      <div id="hero-sentinel" className="absolute top-0 h-px w-full" aria-hidden />

      <div className="relative mx-auto grid max-w-pageWide gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-algtrix-accent">
            {product.eyebrow}
          </span>
          <h1 className="mt-4 font-sans text-4xl font-semibold leading-[1.1] tracking-tight text-algtrix-text sm:text-5xl lg:text-[3.25rem]">
            Encontre as empresas certas para o seu próximo negócio.
          </h1>
          <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-algtrix-muted sm:text-lg">
            Dados empresariais estruturados para segmentar mercados, construir listas comerciais e acelerar sua
            prospecção B2B.
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
              onClick={() => {
                document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ver como funciona
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <DataExplorerPanel variant="preview" />
        </Reveal>
      </div>
    </section>
  )
}
