import { Check } from '@phosphor-icons/react/dist/ssr/Check'
import { X } from '@phosphor-icons/react/dist/ssr/X'
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus'
import { Reveal } from '@/components/ui/Reveal'
import { product } from '@/config/product'

type Cell = 'yes' | 'partial' | 'no'

const CRITERIA: { label: string; manual: Cell; structured: Cell; intelligence: Cell }[] = [
  { label: 'Tempo', manual: 'no', structured: 'partial', intelligence: 'yes' },
  { label: 'Organização', manual: 'no', structured: 'yes', intelligence: 'yes' },
  { label: 'Segmentação', manual: 'no', structured: 'partial', intelligence: 'yes' },
  { label: 'Escala', manual: 'no', structured: 'partial', intelligence: 'yes' },
  { label: 'Exportação', manual: 'partial', structured: 'yes', intelligence: 'yes' },
  { label: 'Reutilização', manual: 'no', structured: 'yes', intelligence: 'yes' },
]

const CELL_ICON: Record<Cell, JSX.Element> = {
  yes: <Check size={16} weight="bold" className="text-algtrix-accent" />,
  partial: <Minus size={16} className="text-algtrix-dim" />,
  no: <X size={16} className="text-algtrix-risk" />,
}

export function Comparison() {
  return (
    <section className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[26ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            O custo não está apenas no preço. Está no tempo perdido.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-9 overflow-x-auto">
          <table className="w-full min-w-[560px] overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg text-sm">
            <thead>
              <tr className="bg-algtrix-surface2 text-left text-algtrix-dim">
                <th className="px-5 py-3.5 font-semibold">Critério</th>
                <th className="px-5 py-3.5 font-semibold">Pesquisa manual</th>
                <th className="px-5 py-3.5 font-semibold">Base estruturada</th>
                <th className="px-5 py-3.5 font-semibold text-algtrix-accent">{product.name}</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((row) => (
                <tr key={row.label} className="border-t border-algtrix-border">
                  <td className="px-5 py-3.5 font-medium text-algtrix-text">{row.label}</td>
                  <td className="px-5 py-3.5">{CELL_ICON[row.manual]}</td>
                  <td className="px-5 py-3.5">{CELL_ICON[row.structured]}</td>
                  <td className="px-5 py-3.5">{CELL_ICON[row.intelligence]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  )
}
