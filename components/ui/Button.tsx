import Link from 'next/link'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse'
type Size = 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-algtrix-accent text-algtrix-bg hover:bg-algtrix-accentHover shadow-glow',
  secondary:
    'bg-transparent text-algtrix-text border border-algtrix-borderStrong hover:border-algtrix-accent/50 hover:bg-black/[0.03]',
  ghost: 'bg-transparent text-algtrix-muted hover:text-algtrix-text hover:bg-black/[0.04]',
  inverse: 'bg-algtrix-text text-algtrix-bg hover:bg-algtrix-violet',
}

const sizeClasses: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold leading-none whitespace-nowrap transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-algtrix-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-algtrix-bg disabled:opacity-50 disabled:pointer-events-none'

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
}: CommonProps & { href: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={cn(base, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </Link>
  )
}
