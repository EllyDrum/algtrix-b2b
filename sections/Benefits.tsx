import { Target } from '@phosphor-icons/react/dist/ssr/Target'
import { Gauge } from '@phosphor-icons/react/dist/ssr/Gauge'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp'
import { ArrowsOutSimple } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple'
import { Brain } from '@phosphor-icons/react/dist/ssr/Brain'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import type { Icon } from '@phosphor-icons/react'

const BENEFITS: {
  icon: Icon
  title: string
  description: string
  span: string
  tone: 'accent' | 'violet' | 'plain'
}[] = [
  {
    icon: Target,
    title: 'Segmentação',
    description: 'Encontre empresas por critérios relevantes ao seu mercado, do porte ao segmento de atuação.',
    span: 'sm:col-span-2 sm:row-span-2',
    tone: 'accent',
  },
  {
    icon: Gauge,
    title: 'Produtividade',
    description: 'Reduza o trabalho manual de pesquisa.',
    span: 'sm:col-span-2 sm:row-span-1',
    tone: 'plain',
  },
  {
    icon: Stack,
    title: 'Organização',
    description: 'Trabalhe com dados estruturados.',
    span: 'sm:col-span-1 sm:row-span-1',
    tone: 'plain',
  },
  {
    icon: ChartLineUp,
    title: 'Escala',
    description: 'Crie listas maiores sem pesquisar empresa por empresa.',
    span: 'sm:col-span-1 sm:row-span-1',
    tone: 'plain',
  },
  {
    icon: ArrowsOutSimple,
    title: 'Flexibilidade',
    description: 'Utilize os dados em diferentes fluxos comerciais.',
    span: 'sm:col-span-2 sm:row-span-1',
    tone: 'violet',
  },
  {
    icon: Brain,
    title: 'Inteligência',
    description: 'Transforme informação empresarial em contexto para prospecção.',
    span: 'sm:col-span-2 sm:row-span-1',
    tone: 'plain',
  },
]

const toneClasses: Record<string, string> = {
  accent: 'border-algtrix-borderAccent bg-gradient-to-br from-algtrix-accentSoft to-algtrix-surface',
  violet: 'border-algtrix-border bg-algtrix-violetSoft',
  plain: 'border-algtrix-border bg-algtrix-surface',
}

export function Benefits() {
  return (
    <section className="bg-algtrix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Uma base pensada para quem precisa encontrar empresas.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-4 sm:[grid-template-rows:repeat(3,minmax(0,1fr))]">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.04} className={benefit.span}>
              <div
                className={cn(
                  'relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border p-6',
                  toneClasses[benefit.tone],
                )}
              >
                {benefit.tone === 'accent' && (
                  <benefit.icon
                    size={220}
                    weight="duotone"
                    className="pointer-events-none absolute -right-10 -top-10 text-algtrix-accent/[0.07]"
                  />
                )}
                <benefit.icon
                  size={benefit.tone === 'accent' ? 28 : 22}
                  className="relative text-algtrix-accent"
                  weight="duotone"
                />
                <div className={cn('relative', benefit.tone === 'accent' && 'mt-auto')}>
                  <h3
                    className={cn(
                      'font-sans font-semibold text-algtrix-text',
                      benefit.tone === 'accent' ? 'text-xl' : 'text-[15px]',
                    )}
                  >
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-algtrix-muted">{benefit.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
