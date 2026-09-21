import { cn } from '@/lib/utils'

/**
 * Logo oficial da Algtrix. Não é recriado: usamos o arquivo hospedado no
 * próprio site institucional (algtrix.com.br), sem alterar proporções,
 * cores ou aplicar efeitos. O componente apenas controla o tamanho e
 * adiciona, de forma discreta, o rótulo do produto "B2B" ao lado.
 */
const LOGO_SRC = 'https://algtrix.com.br/assets/algtrix-logo.png'

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Algtrix"
        width={340}
        height={87}
        className={cn('w-auto object-contain', compact ? 'h-6' : 'h-7')}
      />
      <span
        className={cn(
          'rounded-md border border-algtrix-borderAccent bg-algtrix-accentSoft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-algtrix-accent',
        )}
      >
        B2B
      </span>
    </span>
  )
}
