'use client'

import { useMemo, useState } from 'react'
import { CaretUpDown } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import { Reveal } from '@/components/ui/Reveal'
import { Badge } from '@/components/ui/Badge'
import { sampleDataset } from '@/data/companies'
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
  { key: 'static', label: 'Sócio' },
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
    if (sortKey === key) {
      setAscending((prev) => !prev)
    } else {
      setSortKey(key)
      setAscending(true)
    }
  }

  return (
    <section className="bg-zinc-50 py-20 sm:py-24">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[24ch] text-3xl font-bold leading-tight tracking-tight text-ink-primary sm:text-4xl">
            Veja o que existe dentro da base.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.dataFields.slice(0, 6).map((field) => (
              <Badge key={field}>{field}</Badge>
            ))}
            <Badge tone="accent">+{product.dataFields.length - 6} campos</Badge>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="overflow-hidden rounded-lg border border-border bg-white shadow-card">
            <div className="max-h-[440px] overflow-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-100">
                  <tr>
                    {COLUMNS.map((column) => (
                      <th key={column.label} className="whitespace-nowrap px-4 py-3 font-semibold text-ink-secondary">
                        {column.key === 'static' ? (
                          column.label
                        ) : (
                          <button
                            className="flex items-center gap-1 hover:text-ink-primary"
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
                  {rows.map((row) => (
                    <tr key={row.cnpj} className="border-t border-border/70 hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink-primary">{row.companyName}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink-secondary">{row.cnpj}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-secondary">{row.cnae}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <Badge tone={row.size === 'Grande' ? 'accent' : 'neutral'}>{row.size}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-secondary">{row.city}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-secondary">{row.state}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink-secondary">
                        {row.shareCapital}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-secondary">{row.openedAt}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-secondary">{row.partnerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-secondary/70">{product.demoDisclaimer}</p>
        </Reveal>
      </div>
    </section>
  )
}
