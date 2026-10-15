import { Database } from '@phosphor-icons/react/dist/ssr/Database'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { SquaresFour } from '@phosphor-icons/react/dist/ssr/SquaresFour'
import { Brain } from '@phosphor-icons/react/dist/ssr/Brain'
import { Target } from '@phosphor-icons/react/dist/ssr/Target'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { brand } from '@/config/brand'
import type { Icon } from '@phosphor-icons/react'

const FLOW: { step: string; icon: Icon; description: string }[] = [
  { step: 'Dados brutos', icon: Database, description: 'Cadastro oficial da Receita Federal, como é publicado.' },
  { step: 'Organização', icon: Stack, description: 'Padronização e verificação de cada registro.' },
  { step: 'Estrutura', icon: SquaresFour, description: 'Campos e filtros consistentes para consulta.' },
  { step: 'Inteligência', icon: Brain, description: 'Segmentação que conecta perfil e mercado.' },
  { step: 'Decisão', icon: Target, description: 'Lista pronta para a sua equipe prospectar.' },
]

export function WhyAlgtrix() {
  return (
    <Section tone="dark">
      <SectionHeader
        eyebrow="Método"
        title="Dados precisam ser tratados como inteligência."
        lead={brand.positioning}
        dark
      />
      <Reveal delay={0.1}>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-5">
          {FLOW.map((item, index) => (
            <li key={item.step} className="flex flex-col gap-3 bg-[#1c1533] p-6">
              <span className="font-mono text-xs text-algtrix-accentStrong">{String(index + 1).padStart(2, '0')}</span>
              <item.icon size={22} className="text-white/70" weight="duotone" />
              <p className="text-[15px] font-semibold text-white">{item.step}</p>
              <p className="text-sm leading-relaxed text-white/60">{item.description}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  )
}
