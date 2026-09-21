import { ArrowRight } from '@phosphor-icons/react/dist/ssr/ArrowRight'
import { Reveal } from '@/components/ui/Reveal'
import { brand } from '@/config/brand'

const FLOW = ['Dados brutos', 'Organização', 'Estrutura', 'Inteligência', 'Decisão']

export function WhyAlgtrix() {
  return (
    <section className="bg-brand-dark py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[22ch] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Dados precisam ser tratados como inteligência.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/65">{brand.positioning}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {FLOW.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white sm:flex-none sm:px-6">
                  {step}
                </div>
                {index < FLOW.length - 1 && (
                  <ArrowRight size={18} className="hidden shrink-0 text-emerald-400 sm:block" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
