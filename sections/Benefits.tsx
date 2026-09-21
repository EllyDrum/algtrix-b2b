import { Target } from '@phosphor-icons/react/dist/ssr/Target'
import { Gauge } from '@phosphor-icons/react/dist/ssr/Gauge'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp'
import { ArrowsOutSimple } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple'
import { Brain } from '@phosphor-icons/react/dist/ssr/Brain'
import { Reveal } from '@/components/ui/Reveal'
import type { Icon } from '@phosphor-icons/react'

const BENEFITS: { icon: Icon; title: string; description: string; wide?: boolean }[] = [
  {
    icon: Target,
    title: 'Segmentação',
    description: 'Encontre empresas por critérios relevantes ao seu mercado.',
    wide: true,
  },
  { icon: Gauge, title: 'Produtividade', description: 'Reduza o trabalho manual de pesquisa.' },
  { icon: Stack, title: 'Organização', description: 'Trabalhe com dados estruturados.' },
  { icon: ChartLineUp, title: 'Escala', description: 'Crie listas maiores sem depender de pesquisa empresa por empresa.' },
  { icon: ArrowsOutSimple, title: 'Flexibilidade', description: 'Utilize os dados em diferentes fluxos comerciais.' },
  { icon: Brain, title: 'Inteligência', description: 'Transforme informação empresarial em contexto para prospecção.' },
]

export function Benefits() {
  return (
    <section className="bg-zinc-50 py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Uma base pensada para quem precisa encontrar empresas.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.04} className={benefit.wide ? 'sm:col-span-2' : ''}>
              <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-white p-6">
                <benefit.icon size={22} className="text-accent-hover" weight="duotone" />
                <div>
                  <h3 className="text-[15px] font-semibold text-ink-primary">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{benefit.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
