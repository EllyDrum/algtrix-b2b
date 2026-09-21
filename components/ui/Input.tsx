import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function Field({ label, error, helperText, id, className, ...rest }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-algtrix-text">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          'rounded-md border bg-black/[0.045] px-3.5 py-2.5 text-sm text-algtrix-text placeholder:text-algtrix-dim',
          'focus:outline-none focus:ring-2 focus:ring-algtrix-accent/40 focus:border-algtrix-accent',
          error ? 'border-algtrix-risk' : 'border-algtrix-border',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...rest}
      />
      {helperText && !error && (
        <span id={`${fieldId}-helper`} className="text-xs text-algtrix-muted">
          {helperText}
        </span>
      )}
      {error && (
        <span id={`${fieldId}-error`} className="text-xs font-medium text-algtrix-risk">
          {error}
        </span>
      )}
    </div>
  )
}

export function SelectField({
  label,
  id,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-algtrix-text">
        {label}
      </label>
      <select
        id={fieldId}
        className={cn(
          'rounded-md border border-algtrix-border bg-black/[0.045] px-3.5 py-2.5 text-sm text-algtrix-text',
          'focus:outline-none focus:ring-2 focus:ring-algtrix-accent/40 focus:border-algtrix-accent',
          '[&>option]:bg-algtrix-surface2',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}
