'use client'

import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { Reveal } from '@/components/ui/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { product } from '@/config/product'
import { COMPETENCIA, TOTAL_EMPRESAS } from '@/lib/catalog'
import { DESCONTOS_CARRINHO, formatarBRL, formatarNumero, precoPorQuantidade } from '@/lib/pricing-engine'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const EXEMPLOS = [2_000, 5_000, 10_000, 50_000, 100_000, 250_000, 1_000_000]

const INCLUIDO = [
  'Lista exata do recorte escolhido: estado ou cidade, segmentos e porte',
  'Arquivo ZIP com CSV e Excel (até 100 mil empresas)',
  'CNPJ, razão social, CNAE, porte, endereço, telefones e e-mail',
  'Download imediato após Pix ou cartão aprovado',
  'Link de download permanente na página do pedido e por e-mail',
]

const DETAILS = [
  { label: 'Formato', value: product.deliverable.formats.join(' e ') },
  { label: 'Atualização', value: product.deliverable.updateFrequency },
  { label: 'Cobertura', value: `${formatarNumero(TOTAL_EMPRESAS)} empresas ativas` },
  { label: 'Pagamento', value: 'Pix ou cartão, sem assinatura' },
]

export function Pricing() {
  return (
    <section id="oferta" className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Pague só pelo recorte que você precisa.
          </h2>
          <p className="mt-3 max-w-[60ch] text-algtrix-muted">
            A partir de {formatarBRL(1990)}, sem mensalidade. O preço por empresa cai conforme o volume, e o valor
            exato aparece antes do pagamento.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal delay={0.05}>
            <div className="overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-algtrix-surface2 text-algtrix-dim">
                    <th className="px-5 py-3 font-semibold">Empresas no recorte</th>
                    <th className="px-5 py-3 text-right font-semibold">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {EXEMPLOS.map((n) => (
                    <tr key={n} className="border-t border-algtrix-border">
                      <td className="px-5 py-3 text-algtrix-text">{n === 2_000 ? 'Até 2.000' : formatarNumero(n)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-algtrix-text">
                        {formatarBRL(precoPorQuantidade(n))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-algtrix-muted">
              Desconto automático no carrinho:{' '}
              {[...DESCONTOS_CARRINHO]
                .reverse()
                .map((d) => `${d.percentual}% com ${d.minItens}${d.minItens === 5 ? ' ou mais' : ''} recortes`)
                .join(', ')}
              .
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-lg border-2 border-algtrix-accent bg-algtrix-bg p-7 shadow-glow">
              <p className="text-sm font-semibold uppercase tracking-wide text-algtrix-dim">O que está incluído</p>
              <ul className="mt-4 space-y-3">
                {INCLUIDO.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-algtrix-text">
                    <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-algtrix-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {DETAILS.map((detail) => (
                  <div key={detail.label} className="rounded-md border border-algtrix-border bg-algtrix-surface p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-algtrix-dim">{detail.label}</p>
                    <p className="mt-1 text-sm font-semibold text-algtrix-text">{detail.value}</p>
                  </div>
                ))}
              </div>
              <ButtonLink
                href="/montar-lista"
                size="lg"
                className="mt-7 w-full"
                onClick={() => track(AnalyticsEvent.CheckoutStarted, { placement: 'pricing' })}
              >
                Montar minha lista
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-algtrix-dim">
                Fonte: Dados Abertos do CNPJ, Receita Federal. Competência {COMPETENCIA}.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
