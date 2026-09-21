import { Reveal } from '@/components/ui/Reveal'
import { product } from '@/config/product'

export function Filters() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Encontre empresas pelo perfil que você procura.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {product.filters.map((group, index) => (
            <Reveal key={group.group} delay={index * 0.04}>
              <div className="h-full rounded-lg border border-border p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{group.group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full border border-border bg-zinc-50 px-3 py-1 text-xs font-medium text-ink-primary"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
