'use client'

import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { DataExplorerPanel } from '@/components/DataExplorerPanel'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const PROVAS = ['Dados oficiais da Receita Federal', 'Sem assinatura', 'Download imediato']

export function Hero() {
  return (
    <section id="produto" className="relative overflow-hidden bg-algtrix-bg pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="data-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 10% 10%, rgba(92,73,144,0.12), transparent 45%), radial-gradient(circle at 90% 0%, rgba(15,138,151,0.10), transparent 40%)',
        }}
        aria-hidden
      />
      <div id="hero-sentinel" className="absolute top-0 h-px w-full" aria-hidden />

      <div className="relative mx-auto grid max-w-pageWide items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-algtrix-borderAccent bg-algtrix-accentSoft px-3 py-1 text-xs font-semibold text-algtrix-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-algtrix-accent" aria-hidden />
            Inteligência comercial B2B
          </span>
          <h1 className="mt-5 text-[2.25rem] font-semibold leading-[1.08] text-algtrix-text sm:text-[3rem] lg:text-[3.4rem]">
            Encontre as empresas certas para o seu próximo negócio.
          </h1>
          <p className="mt-5 max-w-[50ch] text-base leading-relaxed text-algtrix-muted sm:text-lg">
            Escolha o estado ou a cidade, o segmento e o porte. Veja quantas empresas existem e quanto custa antes
            de pagar. Listas a partir de R$ 19,90.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/montar-lista"
              size="lg"
              onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'hero_primary' })}
            >
              Montar minha lista
            </ButtonLink>
            <ButtonLink href="#demonstracao" variant="secondary" size="lg">
              Ver demonstração
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {PROVAS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-algtrix-muted">
                <CheckCircle size={16} weight="fill" className="text-algtrix-accent" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="w-full">
          <DataExplorerPanel variant="preview" />
        </Reveal>
      </div>
    </section>
  )
}
