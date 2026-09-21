import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { Reveal } from '@/components/ui/Reveal'
import { pricing } from '@/config/pricing'
import { product } from '@/config/product'

const DETAILS = [
  { label: 'Formato', value: product.deliverable.formats.join(' e ') },
  { label: 'Atualização', value: product.deliverable.updateFrequency },
  { label: 'Cobertura', value: product.deliverable.coverage },
  { label: 'Entrega', value: 'Digital' },
]

export function Offer() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Tenha os dados que sua operação precisa para começar.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">O que está incluído</p>
              <ul className="mt-4 space-y-3">
                {pricing.included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink-primary">
                    <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {DETAILS.map((detail) => (
                <div key={detail.label} className="rounded-lg border border-border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">{detail.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink-primary">{detail.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
