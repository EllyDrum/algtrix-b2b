'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr/CircleNotch'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { ChartBar } from '@phosphor-icons/react/dist/ssr/ChartBar'
import { estimateResultCount, generateFakeCompanies } from '@/data/companies'
import { product } from '@/config/product'
import { formatCount, cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'
import { useCountUp } from '@/hooks/useCountUp'

const STATE_OPTIONS = ['Todos', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES']
const SIZE_OPTIONS = ['Todos', 'MEI', 'Pequena', 'Média', 'Grande']
const STATUS_OPTIONS = ['Todas', 'Ativa', 'Inapta', 'Suspensa']

const PREVIEW_RESULT_COUNT = 8421

/**
 * Painel único de exploração de dados, usado em duas formas:
 * - `full`: a demonstração real e interativa (seção "Como funciona").
 * - `preview`: visual estático/ilustrativo do produto usado no Hero, sem
 *   filtros funcionais nem botão de busca. Existe para o Hero não ficar
 *   vazio sem duplicar a demonstração interativa (ver auditoria de
 *   duplicidade do redesign).
 */
export function DataExplorerPanel({ variant = 'full' }: { variant?: 'full' | 'preview' }) {
  if (variant === 'preview') return <PreviewPanel />
  return <FullPanel />
}

function PanelChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-algtrix-border bg-algtrix-surface shadow-card-dark">
      {children}
    </div>
  )
}

function PanelHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-algtrix-border px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-algtrix-accent" aria-hidden />
        <span className="text-xs font-semibold tracking-wide text-algtrix-muted">{label}</span>
      </div>
      <span className="font-mono text-[10.5px] text-algtrix-dim">{product.demoDisclaimer}</span>
    </div>
  )
}

function PreviewPanel() {
  const { ref, display } = useCountUp(PREVIEW_RESULT_COUNT, 1100)
  const rows = generateFakeCompanies(4, 'Tecnologia', 'SP')

  return (
    <PanelChrome>
      <PanelHeader label="Data Explorer" />

      <div className="flex flex-wrap gap-2 p-4 sm:p-5">
        {[
          { label: 'Estado', value: 'São Paulo' },
          { label: 'Segmento', value: 'Tecnologia' },
          { label: 'Porte', value: 'Médio' },
        ].map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-md border border-algtrix-border bg-black/[0.04] px-3 py-1.5 text-xs text-algtrix-muted"
          >
            <span className="text-algtrix-dim">{chip.label}</span>
            <span className="font-medium text-algtrix-text">{chip.value}</span>
          </span>
        ))}
      </div>

      <div ref={ref as React.RefObject<HTMLDivElement>} className="border-t border-algtrix-border px-4 py-4 sm:px-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="tabular font-mono text-2xl font-semibold text-algtrix-text">{formatCount(display)}</p>
            <p className="text-xs text-algtrix-dim">empresas encontradas</p>
          </div>
          <ChartBar size={20} className="text-algtrix-accent" />
        </div>

        <div className="overflow-hidden rounded-md border border-algtrix-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-algtrix-border text-algtrix-dim">
                <th className="py-2 pl-3 pr-4 font-medium">Empresa</th>
                <th className="py-2 pr-4 font-medium">Cidade</th>
                <th className="py-2 pr-3 font-medium">Porte</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <motion.tr
                  key={row.cnpj}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'border-b border-algtrix-border/70 last:border-0 hover:bg-black/[0.04]',
                    index % 2 === 1 && 'bg-black/[0.025]',
                  )}
                >
                  <td className="whitespace-nowrap py-2 pl-3 pr-4 font-mono text-algtrix-text">{row.tradeName}</td>
                  <td className="whitespace-nowrap py-2 pr-4 text-algtrix-muted">{row.city}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-algtrix-muted">{row.size}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PanelChrome>
  )
}

function FullPanel() {
  const [state, setState] = useState('SP')
  const [segment, setSegment] = useState('Todos')
  const [size, setSize] = useState('Todos')
  const [status, setStatus] = useState('Ativa')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [resultCount, setResultCount] = useState<number | null>(null)

  const previewRows = generateFakeCompanies(6, segment, state)

  function handleSearch() {
    setPhase('loading')
    track(AnalyticsEvent.FilterUsed, { state, segment, size, status, context: 'full' })
    window.setTimeout(() => {
      const count = estimateResultCount({ state, segment, size, status })
      setResultCount(count)
      setPhase('done')
      track(AnalyticsEvent.DataPreview, { count, context: 'full' })
    }, 700)
  }

  return (
    <PanelChrome>
      <PanelHeader label="Data Explorer" />

      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 sm:p-5">
        <PanelSelect label="Estado" value={state} onChange={setState} options={STATE_OPTIONS} />
        <PanelSelect label="Segmento" value={segment} onChange={setSegment} options={['Todos', ...product.segments]} />
        <PanelSelect label="Porte" value={size} onChange={setSize} options={SIZE_OPTIONS} />
        <PanelSelect label="Situação" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <button
          onClick={handleSearch}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-algtrix-accent px-4 py-3 text-sm font-semibold text-algtrix-bg transition-colors hover:bg-algtrix-accentHover sm:w-auto sm:px-6"
        >
          <MagnifyingGlass size={16} weight="bold" />
          Encontrar empresas
        </button>
      </div>

      <div className="border-t border-algtrix-border px-4 py-4 sm:px-5">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-algtrix-dim"
            >
              Ajuste os filtros e clique em &ldquo;Encontrar empresas&rdquo; para simular uma busca.
            </motion.p>
          )}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-algtrix-muted"
            >
              <CircleNotch size={16} className="animate-spin text-algtrix-accent" />
              Aplicando filtros...
            </motion.div>
          )}
          {phase === 'done' && resultCount !== null && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-algtrix-accent" />
                <span className="tabular font-mono text-sm font-semibold text-algtrix-text">
                  {formatCount(resultCount)} empresas encontradas
                </span>
              </div>
              <div className="overflow-x-auto rounded-md border border-algtrix-border">
                <table className="w-full min-w-[460px] text-left text-xs">
                  <thead>
                    <tr className="sticky top-0 border-b border-algtrix-border bg-algtrix-surface2 text-algtrix-dim">
                      <th className="py-2.5 pl-3 pr-4 font-medium">Empresa</th>
                      <th className="py-2.5 pr-4 font-medium">Cidade</th>
                      <th className="py-2.5 pr-3 font-medium">Porte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr
                        key={row.cnpj}
                        className={cn(
                          'border-b border-algtrix-border/70 last:border-0 transition-colors hover:bg-black/[0.045]',
                          index % 2 === 1 && 'bg-black/[0.025]',
                        )}
                      >
                        <td className="whitespace-nowrap py-2.5 pl-3 pr-4 font-mono text-algtrix-text">
                          {row.tradeName}
                        </td>
                        <td className="whitespace-nowrap py-2.5 pr-4 text-algtrix-muted">{row.city}</td>
                        <td className="whitespace-nowrap py-2.5 pr-3 text-algtrix-muted">{row.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PanelChrome>
  )
}

function PanelSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-algtrix-dim">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-algtrix-border bg-black/[0.045] px-2.5 py-2 text-sm text-algtrix-text focus:outline-none focus:ring-2 focus:ring-algtrix-accent/40 [&>option]:bg-algtrix-surface2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
