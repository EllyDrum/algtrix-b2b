import { Logo } from '@/components/Logo'
import { brand } from '@/config/brand'

const PRODUTO = [
  { href: '/montar-lista', label: 'Montar minha lista' },
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#oferta', label: 'Preços' },
  { href: '/#faq', label: 'Perguntas frequentes' },
]

const LEGAL = [
  { href: brand.legalLinks.privacyPolicy, label: 'Política de Privacidade' },
  { href: brand.legalLinks.terms, label: 'Termos de Uso' },
  { href: brand.legalLinks.refundPolicy, label: 'Política de Reembolso' },
]

export function Footer() {
  return (
    <footer className="border-t border-algtrix-border bg-algtrix-bg">
      <div className="mx-auto max-w-pageWide px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tagline />
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-algtrix-muted">
              Listas de empresas com dados oficiais da Receita Federal, para prospecção B2B. Base atualizada.
            </p>
            <p className="mt-3 text-sm text-algtrix-muted">
              Contato:{' '}
              <a href={`mailto:${brand.support.email}`} className="font-medium text-algtrix-text hover:text-algtrix-accent">
                {brand.support.email}
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-algtrix-dim">Produto</p>
            <ul className="mt-4 space-y-2.5">
              {PRODUTO.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-algtrix-muted hover:text-algtrix-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-algtrix-dim">Legal</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-algtrix-muted hover:text-algtrix-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-algtrix-border pt-6 text-xs text-algtrix-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.legalName}. Todos os direitos reservados.</p>
          <p>O uso dos dados segue a LGPD. Licença de uso interno, não transferível.</p>
        </div>
      </div>
    </footer>
  )
}
