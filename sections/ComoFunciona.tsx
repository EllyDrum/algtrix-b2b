import { SlidersHorizontal } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal'
import { QrCode } from '@phosphor-icons/react/dist/ssr/QrCode'
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import type { Icon } from '@phosphor-icons/react'

const PASSOS: { icon: Icon; titulo: string; texto: string }[] = [
  {
    icon: SlidersHorizontal,
    titulo: 'Monte o recorte',
    texto: 'Escolha estado ou cidade, segmentos e porte. A quantidade de empresas e o preço aparecem na hora.',
  },
  {
    icon: QrCode,
    titulo: 'Pague com Pix ou cartão',
    texto: 'Sem assinatura e sem contrato. Pix com QR Code na tela ou cartão de crédito em até 12x.',
  },
  {
    icon: DownloadSimple,
    titulo: 'Baixe na hora',
    texto: 'A lista é gerada automaticamente em CSV, Excel e PDF, com link permanente na página do pedido e por e-mail.',
  },
]

export function ComoFunciona() {
  return (
    <Section id="como-funciona" tone="bg">
      <SectionHeader
        eyebrow="Como funciona"
        title="Da escolha do público ao download em três passos."
        lead="Tudo acontece no site, sem contato com vendedor e sem esperar liberação manual."
        align="center"
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <Reveal key={p.titulo} delay={i * 0.06}>
            <div className="relative h-full rounded-lg border border-algtrix-border bg-algtrix-surface p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-algtrix-accentSoft text-algtrix-accent">
                  <p.icon size={22} weight="duotone" />
                </span>
                <span className="font-mono text-xs font-medium text-algtrix-dim">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-algtrix-text">{p.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-algtrix-muted">{p.texto}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
