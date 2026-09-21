'use client'

import { useState } from 'react'
import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { pricing, PRICING_IS_PLACEHOLDER } from '@/config/pricing'
import { formatCentsToBRL } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'
import { useLeadModal } from '@/components/LeadModalContext'

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
    <section id="oferta" className="bg-zinc-50 py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-[24ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Acesse a base agora.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-10 max-w-md">
          <div className="rounded-lg border-2 border-brand-primary bg-white p-8 text-center shadow-card">
            {PRICING_IS_PLACEHOLDER && (
              <p className="mb-4 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Preço em definição, fale com a equipe
              </p>
            )}
            <p className="text-4xl font-bold tracking-tight text-ink-primary">{priceLabel}</p>
            {installmentLabel && <p className="mt-1.5 text-sm text-ink-secondary">{installmentLabel}</p>}
            {pricing.savingsClaim && (
              <p className="mt-2 text-sm font-medium text-accent-hover">{pricing.savingsClaim}</p>
            )}

            <Button size="lg" className="mt-7 w-full" onClick={handleBuy} disabled={status === 'loading'}>
              {status === 'loading' ? 'Abrindo checkout...' : 'Comprar agora'}
            </Button>

            {pricing.guarantee.enabled && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-secondary">
                <ShieldCheck size={14} />
                Garantia de {pricing.guarantee.days} dias
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
