import { cn } from '@/lib/utils'

/**
 * Logo da Algtrix: símbolo hospedado no próprio site (não depende do
 * algtrix.com.br) e o nome "ALGTRIX" em texto, com o mesmo espaçamento
 * do cabeçalho do site institucional. Sempre legível sobre fundo claro.
 */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="inline-flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/algtrix-icon-source.png"
          alt=""
          aria-hidden
          width={39}
          height={37}
          className={cn('w-auto object-contain', compact ? 'h-6' : 'h-7')}
        />
        <span
          className={cn(
            'font-sans font-semibold uppercase leading-none tracking-[0.18em] text-algtrix-text',
            compact ? 'text-[15px]' : 'text-[17px]',
          )}
        >
          Algtrix
        </span>
      </span>
      <span className="rounded-md border border-algtrix-borderAccent bg-algtrix-accentSoft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-algtrix-accent">
        B2B
      </span>
    </span>
  )
}
