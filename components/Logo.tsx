import { cn } from '@/lib/utils'

/**
 * Logo oficial da Algtrix (arquivo final da marca), hospedado no próprio site.
 * - padrão: símbolo + ALGTRIX, para o cabeçalho;
 * - tagline: versão completa com "Transformamos dados em resultados", para o rodapé.
 * O selo B2B identifica este produto dentro da marca.
 */
export function Logo({
  compact = false,
  tagline = false,
  className,
}: {
  compact?: boolean
  tagline?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tagline ? '/algtrix-logo-tagline.png' : '/algtrix-logo.png'}
        alt="Algtrix"
        width={tagline ? 796 : 477}
        height={tagline ? 200 : 120}
        className={cn('w-auto object-contain', tagline ? 'h-10' : compact ? 'h-6' : 'h-7')}
      />
      <span className="rounded-md border border-algtrix-borderAccent bg-algtrix-accentSoft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-algtrix-accent">
        B2B
      </span>
    </span>
  )
}
