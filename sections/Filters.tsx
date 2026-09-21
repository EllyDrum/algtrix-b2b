import { Reveal } from '@/components/ui/Reveal'
import { product } from '@/config/product'

export function Filters() {
  return (
    <section className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Encontre empresas pelo perfil que você procura.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <div className="divide-y divide-algtrix-border overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg">
            {product.filters.map((group) => (
              <div key={group.group} className="grid gap-3 p-5 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-algtrix-dim">
                  {group.group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full border border-algtrix-border bg-black/[0.04] px-3.5 py-1.5 text-xs font-medium text-algtrix-text"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
