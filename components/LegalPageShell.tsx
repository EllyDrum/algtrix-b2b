import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr/CaretLeft'
import { brand } from '@/config/brand'

export function LegalPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary">
        <CaretLeft size={14} />
        Voltar para {brand.name}
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-primary">{title}</h1>
      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-[15px] leading-relaxed text-ink-secondary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink-primary">
        {children}
      </div>
    </main>
  )
}
