'use client'

import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { TOTAL_EMPRESAS } from '@/lib/catalog'
import { DESCONTOS_CARRINHO, formatarBRL, formatarNumero, precoPorQuantidade } from '@/lib/pricing-engine'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

/** Exemplos de tamanho de recorte exibidos na vitrine (o preço exato aparece no carrinho). */
const EXEMPLOS: { rotulo: string; empresas: number; nota: string }[] = [
  { rotulo: 'Até 2.000 empresas', empresas: 2_000, nota: 'Uma cidade ou um nicho' },
  { rotulo: '10.000 empresas', empresas: 10_000, nota: 'Um segmento em uma região' },
  { rotulo: '50.000 empresas', empresas: 50_000, nota: 'Um segmento em um estado' },
  { rotulo: '250.000 empresas', empresas: 250_000, nota: 'Vários segmentos ou estados' },
]

const INCLUIDO = [
  'Recorte exato: estado ou cidade, segmentos e porte',
  'Downloads em Excel (até 1 milhão de empresas), CSV e relatório em PDF',
  'CNPJ, razão social, CNAE, porte, endereço, telefones e e-mail',
  'Download imediato após Pix ou cartão aprovado',
  'Link de download permanente, na página do pedido e por e-mail',
]

export function Pricing() {
  const desconto = DESCONTOS_CARRINHO[0]
  return (
    <Section id="oferta" tone="surface">
      <SectionHeader
        eyebrow="Preços"
        title="Pague só pelo recorte que você precisa."
        lead={`Listas a partir de ${formatarBRL(1990)}, sem mensalidade. O valor exato do seu recorte aparece antes do pagamento.`}
        align="center"
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
        <Reveal delay={0.05}>
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg">
            <div className="border-b border-algtrix-border px-6 py-4">
              <p className="text-sm font-semibold text-algtrix-text">Exemplos de recorte</p>
              <p className="mt-0.5 text-xs text-algtrix-dim">Valores de referência. O preço depende do tamanho da lista.</p>
            </div>
            <ul className="flex-1 divide-y divide-algtrix-border">
              {EXEMPLOS.map((e) => (
                <li key={e.empresas} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="text-[15px] font-medium text-algtrix-text">{e.rotulo}</p>
                    <p className="text-xs text-algtrix-dim">{e.nota}</p>
                  </div>
                  <p className="tabular whitespace-nowrap font-sans text-lg font-semibold text-algtrix-text">
                    {formatarBRL(precoPorQuantidade(e.empresas))}
                  </p>
                </li>
              ))}
            </ul>
            {desconto && (
              <p className="border-t border-algtrix-border bg-algtrix-accentSoft/50 px-6 py-3 text-sm text-algtrix-text">
                <strong>{desconto.percentual}% de desconto</strong> no total ao comprar {desconto.minItens} ou mais recortes.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col rounded-lg border-2 border-algtrix-accent bg-algtrix-bg p-7 shadow-glow sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-algtrix-accent">O que está incluído</p>
            <ul className="mt-5 space-y-3">
              {INCLUIDO.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-algtrix-text">
                  <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-algtrix-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-algtrix-border bg-algtrix-surface p-3">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-algtrix-dim">Cobertura</dt>
                <dd className="mt-1 font-semibold text-algtrix-text">{formatarNumero(TOTAL_EMPRESAS)} empresas</dd>
              </div>
              <div className="rounded-md border border-algtrix-border bg-algtrix-surface p-3">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-algtrix-dim">Atualização</dt>
                <dd className="mt-1 font-semibold text-algtrix-text">Base atualizada</dd>
              </div>
            </dl>
            <ButtonLink
              href="/montar-lista"
              size="lg"
              className="mt-7 w-full"
              onClick={() => track(AnalyticsEvent.CheckoutStarted, { placement: 'pricing' })}
            >
              Montar minha lista
            </ButtonLink>
            <p className="mt-3 text-center text-xs text-algtrix-dim">
              Pix ou cartão de crédito · Fonte: Dados Abertos do CNPJ, Receita Federal
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
