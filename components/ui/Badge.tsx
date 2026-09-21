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
    neutral: 'bg-zinc-100 text-ink-secondary',
    accent: 'bg-accent/10 text-accent-hover',
    dark: 'bg-white/10 text-white',
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
