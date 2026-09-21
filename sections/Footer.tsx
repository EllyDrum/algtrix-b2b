import { Logo } from '@/components/Logo'
import { brand } from '@/config/brand'

export function Footer() {
  return (
    <footer className="bg-algtrix-surface py-10">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-t border-algtrix-border pt-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-[46ch] text-xs leading-relaxed text-algtrix-dim">
              O uso dos dados desta base segue a Lei Geral de Proteção de Dados (LGPD). Consulte nossa Política de
              Privacidade para saber como as informações são tratadas.
            </p>
          </div>

          <div className="flex gap-6 text-xs text-algtrix-muted">
            <a href={brand.legalLinks.privacyPolicy} className="hover:text-algtrix-text">
              Política de Privacidade
            </a>
            <a href={brand.legalLinks.terms} className="hover:text-algtrix-text">
              Termos de Uso
            </a>
            <a href={brand.legalLinks.refundPolicy} className="hover:text-algtrix-text">
              Política de Reembolso
            </a>
          </div>
        </div>

        <p className="mt-8 text-xs text-algtrix-dim/70">
          © {new Date().getFullYear()} {brand.legalName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
