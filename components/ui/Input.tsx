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
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-primary">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          'rounded-sm border bg-white px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-secondary/60',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent',
          error ? 'border-red-400' : 'border-border',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...rest}
      />
      {helperText && !error && (
        <span id={`${fieldId}-helper`} className="text-xs text-ink-secondary">
          {helperText}
        </span>
      )}
      {error && (
        <span id={`${fieldId}-error`} className="text-xs font-medium text-red-600">
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
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-primary">
        {label}
      </label>
      <select
        id={fieldId}
        className={cn(
          'rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-ink-primary',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}
