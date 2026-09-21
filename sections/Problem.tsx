import { ArrowDown } from '@phosphor-icons/react/dist/ssr/ArrowDown'
import { Reveal } from '@/components/ui/Reveal'

const WITHOUT = ['Pesquisar', 'Copiar', 'Conferir', 'Organizar', 'Filtrar']
const WITH = ['Definir perfil', 'Segmentar', 'Exportar', 'Prospectar']

export function Problem() {
  return (
    <section className="bg-algtrix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[22ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Quanto tempo sua equipe perde procurando empresas?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="h-full rounded-lg border border-algtrix-border bg-black/[0.03] p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-algtrix-dim">Pesquisa manual</p>
              <div className="mt-6 flex flex-col items-center gap-2">
                {WITHOUT.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <span className="w-full max-w-[220px] rounded-md border border-algtrix-border bg-black/[0.04] px-4 py-2.5 text-center text-sm font-medium text-algtrix-muted">
                      {step}
                    </span>
                    {index < WITHOUT.length - 1 && <ArrowDown size={14} className="text-algtrix-dim" />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-lg border border-algtrix-borderAccent bg-algtrix-accentSoft p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-algtrix-accent">Algtrix B2B</p>
              <div className="mt-6 flex flex-col items-center gap-2">
                {WITH.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <span className="w-full max-w-[220px] rounded-md border border-algtrix-border bg-algtrix-surface px-4 py-2.5 text-center text-sm font-semibold text-algtrix-text">
                      {step}
                    </span>
                    {index < WITH.length - 1 && <ArrowDown size={14} className="text-algtrix-accent" />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
