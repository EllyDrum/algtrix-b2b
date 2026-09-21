'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr/CircleNotch'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { estimateResultCount, generateFakeCompanies } from '@/data/companies'
import { product } from '@/config/product'
import { formatCount, cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const STATE_OPTIONS = ['Todos', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES']
const SIZE_OPTIONS = ['Todos', 'MEI', 'Pequena', 'Média', 'Grande']
const STATUS_OPTIONS = ['Todas', 'Ativa', 'Inapta', 'Suspensa']

interface Props {
  variant?: 'hero' | 'full'
}

export function DataExplorerPanel({ variant = 'full' }: Props) {
  const isHero = variant === 'hero'
  const [state, setState] = useState('SP')
  const [segment, setSegment] = useState(isHero ? 'Tecnologia' : 'Todos')
  const [size, setSize] = useState(isHero ? 'Pequena' : 'Todos')
  const [status, setStatus] = useState('Ativa')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [resultCount, setResultCount] = useState<number | null>(null)

  const previewRows = generateFakeCompanies(isHero ? 3 : 6, segment, state)

  function handleSearch() {
    setPhase('loading')
    track(AnalyticsEvent.FilterUsed, { state, segment, size, status, context: variant })
    window.setTimeout(() => {
      const count = estimateResultCount({ state, segment, size, status })
      setResultCount(count)
      setPhase('done')
      track(AnalyticsEvent.DataPreview, { count, context: variant })
    }, 700)
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border border-white/10 bg-[#160F2B]',
        isHero ? 'shadow-card-dark' : 'shadow-card border-border bg-white',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b px-4 py-3',
          isHero ? 'border-white/10' : 'border-border bg-zinc-50',
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', isHero ? 'bg-emerald-400' : 'bg-accent')} aria-hidden />
          <span className={cn('text-xs font-semibold tracking-wide', isHero ? 'text-white/80' : 'text-ink-secondary')}>
            {product.eyebrow}
          </span>
        </div>
        <span className={cn('text-[11px] font-medium', isHero ? 'text-white/40' : 'text-ink-secondary/60')}>
          {product.demoDisclaimer}
        </span>
      </div>

      <div className={cn('grid gap-4 p-4', isHero ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4', 'sm:p-5')}>
        <PanelSelect dark={isHero} label="Estado" value={state} onChange={setState} options={STATE_OPTIONS} />
        <PanelSelect
          dark={isHero}
          label="Segmento"
          value={segment}
          onChange={setSegment}
          options={['Todos', ...product.segments]}
        />
        {!isHero && (
          <>
            <PanelSelect dark={isHero} label="Porte" value={size} onChange={setSize} options={SIZE_OPTIONS} />
            <PanelSelect dark={isHero} label="Situação" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          </>
        )}
        {isHero && (
          <div className="col-span-2 flex items-end sm:col-span-2">
            <button
              onClick={handleSearch}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <MagnifyingGlass size={16} weight="bold" />
              Encontrar empresas
            </button>
          </div>
        )}
      </div>

      {!isHero && (
        <div className="px-4 pb-2 sm:px-5">
          <button
            onClick={handleSearch}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto sm:px-6"
          >
            <MagnifyingGlass size={16} weight="bold" />
            Encontrar empresas
          </button>
        </div>
      )}

      <div className={cn('border-t px-4 py-4 sm:px-5', isHero ? 'border-white/10' : 'border-border')}>
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('text-sm', isHero ? 'text-white/50' : 'text-ink-secondary')}
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
              className={cn('flex items-center gap-2 text-sm', isHero ? 'text-white/70' : 'text-ink-secondary')}
            >
              <CircleNotch size={16} className="animate-spin" />
              Processando filtros...
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
                <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                <span className={cn('text-sm font-semibold', isHero ? 'text-white' : 'text-ink-primary')}>
                  {formatCount(resultCount)} empresas encontradas
                </span>
              </div>
              <div className="overflow-x-auto rounded-sm">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className={cn('border-b', isHero ? 'border-white/10 text-white/40' : 'border-border text-ink-secondary')}>
                      <th className="py-2 pr-4 font-medium">Empresa</th>
                      <th className="py-2 pr-4 font-medium">Cidade</th>
                      <th className="py-2 font-medium">Porte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr
                        key={row.cnpj}
                        className={cn(
                          'border-b last:border-0',
                          isHero ? 'border-white/5 text-white/80' : 'border-border/70 text-ink-primary',
                        )}
                      >
                        <td className="py-2 pr-4 font-mono">{row.tradeName}</td>
                        <td className="py-2 pr-4">{row.city}</td>
                        <td className="py-2">{row.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PanelSelect({
  label,
  value,
  onChange,
  options,
  dark,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  dark: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={cn('text-[11px] font-medium', dark ? 'text-white/40' : 'text-ink-secondary')}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'rounded-sm border px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40',
          dark
            ? 'border-white/15 bg-white/5 text-white [&>option]:bg-[#160F2B]'
            : 'border-border bg-white text-ink-primary',
        )}
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
