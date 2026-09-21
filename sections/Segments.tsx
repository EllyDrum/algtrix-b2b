'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { useLeadModal } from '@/components/LeadModalContext'
import { product } from '@/config/product'

export function Segments() {
  const { openLead } = useLeadModal()

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <h2 className="max-w-[24ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
              Segmentos que você encontra na base.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <Button variant="secondary" onClick={() => openLead('segments')}>
              Quero encontrar meu mercado
            </Button>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {product.segments.map((segment, index) => (
            <Reveal key={segment} delay={index * 0.02}>
              <div
                className={
                  index % 5 === 0
                    ? 'flex h-24 items-center rounded-lg bg-brand-primary px-5 text-[15px] font-semibold text-white'
                    : 'flex h-24 items-center rounded-lg border border-border px-5 text-[15px] font-medium text-ink-primary'
                }
              >
                {segment}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
