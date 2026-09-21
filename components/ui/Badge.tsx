import { cn } from '@/lib/utils'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'accent' | 'dark'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-black/[0.05] text-algtrix-muted border border-algtrix-border',
    accent: 'bg-algtrix-accentSoft text-algtrix-accent border border-algtrix-borderAccent',
    dark: 'bg-algtrix-surface2 text-algtrix-text border border-algtrix-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
