import { X } from '@phosphor-icons/react/dist/ssr/X'
import { Check } from '@phosphor-icons/react/dist/ssr/Check'
import { Reveal } from '@/components/ui/Reveal'

const WITHOUT = ['Pesquisar', 'Copiar', 'Conferir', 'Organizar', 'Filtrar', 'Montar lista']
const WITH = ['Definir perfil', 'Filtrar', 'Exportar', 'Prospectar']

export function Problem() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[22ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Quanto tempo sua equipe perde procurando empresas?
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="h-full rounded-lg border border-border bg-zinc-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                Sem uma base estruturada
              </p>
              <ul className="mt-5 space-y-3">
                {WITHOUT.map((step) => (
                  <li key={step} className="flex items-center gap-3 text-[15px] text-ink-secondary">
                    <X size={16} className="shrink-0 text-red-400" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-lg border border-accent/25 bg-emerald-50/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-hover">
                Com uma base estruturada
              </p>
              <ul className="mt-5 space-y-3">
                {WITH.map((step) => (
                  <li key={step} className="flex items-center gap-3 text-[15px] font-medium text-ink-primary">
                    <Check size={16} weight="bold" className="shrink-0 text-accent" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
