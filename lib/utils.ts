import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Formata um número inteiro no padrão brasileiro (ex.: 8.421). */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/** Formata centavos como moeda brasileira. Retorna null se o valor não existir. */
export function formatCentsToBRL(cents: number | null): string | null {
  if (cents === null) return null
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}
