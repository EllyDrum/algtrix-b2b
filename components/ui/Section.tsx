import { cn } from '@/lib/utils'

/**
 * Seção padrão da página: ritmo vertical e largura de contêiner consistentes.
 * tone controla o fundo (claro, superfície ou escuro de marca).
 */
export function Section({
  id,
  tone = 'bg',
  className,
  children,
}: {
  id?: string
  tone?: 'bg' | 'surface' | 'dark'
  className?: string
  children: React.ReactNode
}) {
  const tones = {
    bg: 'bg-algtrix-bg',
    surface: 'bg-algtrix-surface',
    dark: 'bg-[#1c1533] text-white',
  }
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', tones[tone], className)}>
      <div className="mx-auto w-full max-w-pageWide px-5 sm:px-8">{children}</div>
    </section>
  )
}

/** Cabeçalho de seção: eyebrow, título e texto de apoio, com alinhamento opcional ao centro. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  dark = false,
  className,
}: {
  eyebrow?: string
  title: string
  lead?: string
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-[640px]', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className={cn('text-xs font-semibold uppercase tracking-[0.14em]', dark ? 'text-algtrix-accentStrong' : 'text-algtrix-accent')}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'mt-3 text-[1.75rem] font-semibold leading-[1.15] sm:text-[2.25rem]',
          dark ? 'text-white' : 'text-algtrix-text',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn('mt-4 text-[15px] leading-relaxed sm:text-base', dark ? 'text-white/70' : 'text-algtrix-muted')}>
          {lead}
        </p>
      )}
    </div>
  )
}
