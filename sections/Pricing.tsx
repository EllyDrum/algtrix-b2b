'use client'

import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { LockKey } from '@phosphor-icons/react/dist/ssr/LockKey'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { pricing, PRICING_IS_PLACEHOLDER } from '@/config/pricing'
import { product } from '@/config/product'
import { formatCentsToBRL } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'
import { useLeadModal } from '@/components/LeadModalContext'

const DETAILS = [
  { label: 'Formato', value: product.deliverable.formats.join(' e ') },
  { label: 'Atualização', value: product.deliverable.updateFrequency },
  { label: 'Cobertura', value: product.deliverable.coverage },
  { label: 'Entrega', value: 'Digital' },
]

export function Pricing() {
  const { openLead } = useLeadModal()
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const priceLabel = formatCentsToBRL(pricing.priceCents) ?? pricing.displayPrice
  const installmentLabel =
    pricing.installments.max && pricing.installments.installmentValueCents
      ? `em até ${pricing.installments.max}x de ${formatCentsToBRL(pricing.installments.installmentValueCents)}`
      : null

  async function handleBuy() {
    track(AnalyticsEvent.CheckoutStarted, {})

    if (PRICING_IS_PLACEHOLDER) {
      // Sem preço real definido ainda: direciona para captura de lead em
      // vez de simular uma compra com valor inventado.
      openLead('sticky_cta')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/checkout', { method: 'POST' })
      const data = await response.json()
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } finally {
      setStatus('idle')
    }
  }

  return (
    <section id="oferta" className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Acesse a base agora.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal delay={0.05} className="order-2 lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-algtrix-dim">O que está incluído</p>
            <ul className="mt-4 space-y-3">
              {pricing.included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-algtrix-text">
                  <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-algtrix-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {DETAILS.map((detail) => (
                <div key={detail.label} className="rounded-lg border border-algtrix-border bg-algtrix-bg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-algtrix-dim">{detail.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-algtrix-text">{detail.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="rounded-lg border-2 border-algtrix-accent bg-algtrix-bg p-8 text-center shadow-glow">
              {PRICING_IS_PLACEHOLDER && (
                <p className="mb-4 inline-flex rounded-full border border-algtrix-amber/40 bg-algtrix-amber/10 px-3 py-1.5 text-xs font-semibold text-algtrix-amber">
                  Preço em definição, fale com a equipe
                </p>
              )}
              <p className="font-mono text-4xl font-semibold tracking-tight text-algtrix-text">{priceLabel}</p>
              {installmentLabel && <p className="mt-1.5 text-sm text-algtrix-muted">{installmentLabel}</p>}
              {pricing.savingsClaim && (
                <p className="mt-2 text-sm font-medium text-algtrix-accent">{pricing.savingsClaim}</p>
              )}

              <Button size="lg" className="mt-7 w-full" onClick={handleBuy} disabled={status === 'loading'}>
                {status === 'loading' ? 'Abrindo checkout...' : 'Comprar agora'}
              </Button>

              <div className="mt-5 border-t border-algtrix-border pt-5">
                {pricing.guarantee.enabled ? (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-algtrix-muted">
                    <ShieldCheck size={14} className="text-algtrix-accent" />
                    Garantia de {pricing.guarantee.days} dias{pricing.guarantee.description ? ` · ${pricing.guarantee.description}` : ''}
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-algtrix-muted">
                    <LockKey size={14} className="text-algtrix-dim" />
                    Compra segura, dados protegidos e uso conforme a LGPD.
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
