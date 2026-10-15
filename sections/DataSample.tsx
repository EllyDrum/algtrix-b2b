'use client'

import { useMemo, useState } from 'react'
import { CaretUpDown } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import { Reveal } from '@/components/ui/Reveal'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'
import { sampleDataset } from '@/data/companies'
import { cn } from '@/lib/utils'
import type { FakeCompany } from '@/types'
import { product } from '@/config/product'

type SortKey = keyof Pick<FakeCompany, 'companyName' | 'size' | 'city' | 'openedAt'>

const COLUMNS: { key: SortKey | 'static'; label: string }[] = [
  { key: 'companyName', label: 'Empresa' },
  { key: 'static', label: 'CNPJ' },
  { key: 'static', label: 'CNAE' },
  { key: 'size', label: 'Porte' },
  { key: 'city', label: 'Cidade' },
  { key: 'static', label: 'UF' },
  { key: 'static', label: 'Capital social' },
  { key: 'openedAt', label: 'Abertura' },
]

export function DataSample() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [ascending, setAscending] = useState(true)

  const rows = useMemo(() => {
    if (!sortKey) return sampleDataset
    return [...sampleDataset].sort((a, b) => {
      const result = String(a[sortKey]).localeCompare(String(b[sortKey]), 'pt-BR')
      return ascending ? result : -result
    })
  }, [sortKey, ascending])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAscending((prev) => !prev)
    else {
      setSortKey(key)
      setAscending(true)
    }
  }

  return (
    <Section id="dados" tone="surface">
      <SectionHeader
        eyebrow="Dados"
        title="Veja o que existe dentro da base."
        lead="Cada empresa vem com os campos abaixo, prontos para filtrar e importar."
      />
      <Reveal className="mt-6 flex flex-wrap gap-2">
        {product.dataFields.map((field) => (
          <Badge key={field}>{field}</Badge>
        ))}
      </Reveal>

      <Reveal delay={0.08} className="mt-8">
        <div className="overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-bg shadow-soft">
          <div className="max-h-[440px] overflow-auto">
            <table className="w-full min-w-[840px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-algtrix-surface2">
                <tr>
                  {COLUMNS.map((column) => (
                    <th key={column.label} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-algtrix-dim">
                      {column.key === 'static' ? (
                        column.label
                      ) : (
                        <button
                          className="flex items-center gap-1 uppercase hover:text-algtrix-text"
                          onClick={() => toggleSort(column.key as SortKey)}
                        >
                          {column.label}
                          <CaretUpDown size={13} />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.cnpj}
                    className={cn(
                      'border-t border-algtrix-border/70 hover:bg-algtrix-surface',
                      index % 2 === 1 && 'bg-algtrix-surface/60',
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-algtrix-text">{row.companyName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-algtrix-dim">{row.cnpj}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-algtrix-muted">{row.cnae}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={row.size === 'Grande' ? 'accent' : 'neutral'}>{row.size}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-algtrix-muted">{row.city}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-algtrix-muted">{row.state}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-algtrix-dim">{row.shareCapital}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-algtrix-muted">{row.openedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-xs text-algtrix-dim">{product.demoDisclaimer}</p>
      </Reveal>
    </Section>
  )
}
