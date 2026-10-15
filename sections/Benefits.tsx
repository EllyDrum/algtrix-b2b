import { Target } from '@phosphor-icons/react/dist/ssr/Target'
import { Gauge } from '@phosphor-icons/react/dist/ssr/Gauge'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp'
import { ArrowsOutSimple } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple'
import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import type { Icon } from '@phosphor-icons/react'

const BENEFITS: { icon: Icon; title: string; description: string }[] = [
  {
    icon: Target,
    title: 'Segmentação exata',
    description: 'Estado ou cidade, 21 segmentos de atividade, porte e opção de incluir ou excluir MEI.',
  },
  {
    icon: Gauge,
    title: 'Preço antes de pagar',
    description: 'A quantidade de empresas e o valor do recorte aparecem na tela antes de qualquer cadastro.',
  },
  {
    icon: Stack,
    title: 'Dados estruturados',
    description: 'CNPJ, razão social, CNAE, porte, endereço, telefones e e-mail em colunas prontas para uso.',
  },
  {
    icon: ChartLineUp,
    title: 'Escala sem retrabalho',
    description: 'De algumas centenas a milhões de empresas no mesmo formato, sem pesquisar uma a uma.',
  },
  {
    icon: ArrowsOutSimple,
    title: 'Pronto para o seu fluxo',
    description: 'CSV e Excel, compatíveis com planilhas, CRMs e ferramentas de automação comercial.',
  },
  {
    icon: ShieldCheck,
    title: 'Origem e data claras',
    description: 'Fonte oficial da Receita Federal e competência da base informada em cada arquivo.',
  },
]

export function Benefits() {
  return (
    <Section tone="bg">
      <SectionHeader
        eyebrow="Por que Algtrix B2B"
        title="Uma base pensada para quem precisa encontrar empresas."
        lead="Menos tempo organizando planilhas, mais tempo falando com clientes."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.04}>
            <div className="group h-full rounded-lg border border-algtrix-border bg-algtrix-bg p-6 transition-shadow hover:shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-algtrix-accentSoft text-algtrix-accent">
                <b.icon size={20} weight="duotone" />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold text-algtrix-text">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-algtrix-muted">{b.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
