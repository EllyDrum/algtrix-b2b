import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
  tone = 'light',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        tone === 'light'
          ? 'border-algtrix-border bg-algtrix-surface shadow-card'
          : 'border-algtrix-border bg-black/[0.04] shadow-card-dark',
        className,
      )}
    >
      {children}
    </div>
  )
}
