import type { Metadata } from 'next'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { brand } from '@/config/brand'
import { product } from '@/config/product'

export const metadata: Metadata = {
  title: 'Seu acesso está pronto',
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-card">
        <CheckCircle size={40} weight="fill" className="mx-auto text-accent" />
        <h1 className="mt-4 text-2xl font-bold text-ink-primary">Seu acesso está pronto.</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Assim que o pagamento for confirmado pelo provedor, as instruções de acesso à {product.name} chegam
          por e-mail. Em caso de dúvida, fale com o suporte.
        </p>

        <dl className="mt-6 space-y-2 rounded-lg bg-zinc-50 p-4 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-secondary">Produto</dt>
            <dd className="font-medium text-ink-primary">{product.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-secondary">Status</dt>
            <dd className="font-medium text-amber-600">Aguardando confirmação</dd>
          </div>
        </dl>

        <a
          href={`mailto:${brand.support.email}`}
          className="mt-6 inline-flex text-sm font-semibold text-brand-primary underline underline-offset-2"
        >
          Falar com o suporte
        </a>
      </div>
    </main>
  )
}
