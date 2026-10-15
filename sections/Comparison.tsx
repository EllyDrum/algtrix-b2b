import { Check } from '@phosphor-icons/react/dist/ssr/Check'
import { X } from '@phosphor-icons/react/dist/ssr/X'
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { product } from '@/config/product'

type Cell = 'yes' | 'partial' | 'no'

const CRITERIA: { label: string; manual: Cell; assinatura: Cell; algtrix: Cell }[] = [
  { label: 'Quantidade e preço visíveis antes de pagar', manual: 'no', assinatura: 'partial', algtrix: 'yes' },
  { label: 'Sem mensalidade ou fidelidade', manual: 'yes', assinatura: 'no', algtrix: 'yes' },
  { label: 'Recorte por cidade e segmento', manual: 'partial', assinatura: 'yes', algtrix: 'yes' },
  { label: 'Download completo de uma vez', manual: 'no', assinatura: 'partial', algtrix: 'yes' },
  { label: 'Data da base informada no arquivo', manual: 'no', assinatura: 'partial', algtrix: 'yes' },
  { label: 'Tempo para montar uma lista', manual: 'no', assinatura: 'partial', algtrix: 'yes' },
]

const CELL: Record<Cell, JSX.Element> = {
  yes: <Check size={18} weight="bold" className="text-algtrix-accent" aria-label="Sim" />,
  partial: <Minus size={18} className="text-algtrix-dim" aria-label="Parcial" />,
  no: <X size={18} className="text-algtrix-risk" aria-label="Não" />,
}

export function Comparison() {
  return (
    <Section tone="bg">
      <SectionHeader
        eyebrow="Comparativo"
        title="O custo não está só no preço. Está no tempo perdido."
        lead="Como o Algtrix B2B se compara à pesquisa manual e às plataformas por assinatura."
      />
      <Reveal delay={0.08} className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg text-sm">
          <thead>
            <tr className="bg-algtrix-surface2 text-left text-xs uppercase tracking-wide text-algtrix-dim">
              <th className="px-5 py-3.5 font-semibold">Critério</th>
              <th className="px-5 py-3.5 text-center font-semibold">Pesquisa manual</th>
              <th className="px-5 py-3.5 text-center font-semibold">Plataformas por assinatura</th>
              <th className="px-5 py-3.5 text-center font-semibold text-algtrix-accent">{product.name}</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((row) => (
              <tr key={row.label} className="border-t border-algtrix-border">
                <td className="px-5 py-4 font-medium text-algtrix-text">{row.label}</td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex">{CELL[row.manual]}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex">{CELL[row.assinatura]}</span>
                </td>
                <td className="bg-algtrix-accentSoft/40 px-5 py-4 text-center">
                  <span className="inline-flex">{CELL[row.algtrix]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </Section>
  )
}
