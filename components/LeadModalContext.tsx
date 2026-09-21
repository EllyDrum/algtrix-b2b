'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LeadCaptureModal } from '@/sections/LeadCaptureModal'

type LeadSource = 'default' | 'exit_intent' | 'sticky_cta' | 'segments' | 'icp'

interface LeadModalContextValue {
  openLead: (source?: LeadSource) => void
  closeLead: () => void
}

const LeadModalContext = createContext<LeadModalContextValue | null>(null)

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<LeadSource>('default')

  const openLead = useCallback((nextSource: LeadSource = 'default') => {
    setSource(nextSource)
    setOpen(true)
  }, [])
  const closeLead = useCallback(() => setOpen(false), [])

  const value = useMemo(() => ({ openLead, closeLead }), [openLead, closeLead])

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      <LeadCaptureModal open={open} onClose={closeLead} source={source} />
    </LeadModalContext.Provider>
  )
}

export function useLeadModal() {
  const ctx = useContext(LeadModalContext)
  if (!ctx) throw new Error('useLeadModal deve ser usado dentro de LeadModalProvider')
  return ctx
}
