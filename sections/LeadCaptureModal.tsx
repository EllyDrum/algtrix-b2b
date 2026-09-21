'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, SelectField } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'
import { product } from '@/config/product'

const HEADLINES: Record<string, { title: string; subtitle: string }> = {
  default: {
    title: 'Quero conhecer a base',
    subtitle: 'Deixe seus dados e nossa equipe mostra como aplicar a base no seu processo comercial.',
  },
  exit_intent: {
    title: 'Antes de sair, veja como a base funciona',
    subtitle: 'Deixe seus dados e enviamos um resumo de como funciona a segmentação de empresas.',
  },
  sticky_cta: {
    title: 'Quero acessar a base',
    subtitle: 'Preencha os dados abaixo para receber as informações de acesso.',
  },
  segments: {
    title: 'Quero encontrar meu mercado',
    subtitle: 'Conte pra gente o segmento que você procura e te mostramos a segmentação ideal.',
  },
  icp: {
    title: 'Quero encontrar meu mercado',
    subtitle: 'Descreva seu perfil de cliente ideal e receba orientação sobre os filtros certos.',
  },
}

export function LeadCaptureModal({
  open,
  onClose,
  source,
}: {
  open: boolean
  onClose: () => void
  source: string
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const copy = HEADLINES[source] ?? HEADLINES.default!

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      whatsapp: String(form.get('whatsapp') ?? ''),
      company: String(form.get('company') ?? ''),
      segment: String(form.get('segment') ?? ''),
      source,
    }

    setStatus('submitting')
    track(AnalyticsEvent.LeadStarted, { source })

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Falha ao enviar')
      setStatus('success')
      track(AnalyticsEvent.LeadCompleted, { source })
    } catch {
      setStatus('error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="lead-modal-title">
      {status === 'success' ? (
        <div className="py-4 text-center">
          <h3 className="text-xl font-semibold text-ink-primary">Recebemos seus dados.</h3>
          <p className="mt-2 text-sm text-ink-secondary">
            Nossa equipe vai te enviar mais detalhes sobre a {product.name} em breve.
          </p>
          <Button className="mt-6 w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 id="lead-modal-title" className="text-xl font-semibold text-ink-primary">
              {copy.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-secondary">{copy.subtitle}</p>
          </div>

          <Field label="Nome" name="name" required placeholder="Seu nome completo" />
          <Field label="E-mail" name="email" type="email" required placeholder="voce@empresa.com" />
          <Field label="WhatsApp" name="whatsapp" required placeholder="(11) 90000-0000" />
          <Field label="Empresa" name="company" required placeholder="Nome da sua empresa" />
          <SelectField label="Qual segmento você procura? (opcional)" name="segment" defaultValue="">
            <option value="">Selecionar</option>
            {product.segments.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </SelectField>

          {status === 'error' && (
            <p className="text-sm font-medium text-algtrix-risk">
              Não foi possível enviar agora. Tente novamente em alguns instantes.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enviando...' : 'Quero receber'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
