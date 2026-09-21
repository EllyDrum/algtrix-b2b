'use client'

import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown'
import { cn } from '@/lib/utils'

export function Accordion({
  items,
  onOpenItem,
}: {
  items: { question: string; answer: string }[]
  onOpenItem?: (question: string) => void
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => {
                const next = isOpen ? null : index
                setOpenIndex(next)
                if (next !== null) onOpenItem?.(item.question)
              }}
            >
              <span className="text-[15px] font-medium text-ink-primary">{item.question}</span>
              <CaretDown
                size={18}
                className={cn('shrink-0 text-ink-secondary transition-transform duration-200', isOpen && 'rotate-180')}
              />
            </button>
            <div
              className={cn(
                'grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="min-h-0 px-5 pb-4 text-sm leading-relaxed text-ink-secondary">{item.answer}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
