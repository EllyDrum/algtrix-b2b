import { Database } from '@phosphor-icons/react/dist/ssr/Database'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { SquaresFour } from '@phosphor-icons/react/dist/ssr/SquaresFour'
import { Brain } from '@phosphor-icons/react/dist/ssr/Brain'
import { Target } from '@phosphor-icons/react/dist/ssr/Target'
import { Reveal } from '@/components/ui/Reveal'
import { brand } from '@/config/brand'
import type { Icon } from '@phosphor-icons/react'

const FLOW: { step: string; icon: Icon; description: string }[] = [
  { step: 'Dados brutos', icon: Database, description: 'CNPJ, atividade e cadastro como chegam, sem tratamento.' },
  { step: 'Organização', icon: Stack, description: 'Deduplicação e padronização em uma base confiável.' },
  { step: 'Estrutura', icon: SquaresFour, description: 'Campos e filtros consistentes para consulta.' },
  { step: 'Inteligência', icon: Brain, description: 'Segmentação que conecta perfil e mercado.' },
  { step: 'Decisão', icon: Target, description: 'Lista pronta para a sua equipe prospectar.' },
]

export function WhyAlgtrix() {
  return (
    <section className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[22ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Dados precisam ser tratados como inteligência.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-algtrix-muted">{brand.positioning}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid divide-y divide-algtrix-border border-t border-algtrix-border sm:grid-cols-5 sm:divide-x sm:divide-y-0">
            {FLOW.map((item, index) => (
              <div key={item.step} className="flex flex-col gap-3 px-1 py-5 sm:px-5">
                <span className="font-mono text-xs text-algtrix-accent">{String(index + 1).padStart(2, '0')}</span>
                <item.icon size={20} className="text-algtrix-muted" />
                <p className="text-sm font-semibold text-algtrix-text">{item.step}</p>
                <p className="text-xs leading-relaxed text-algtrix-dim">{item.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
