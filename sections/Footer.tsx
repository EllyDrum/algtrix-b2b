import { brand } from '@/config/brand'
import { product } from '@/config/product'

export function Footer() {
  return (
    <footer className="bg-brand-dark py-10">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white">
              {brand.name} <span className="text-white/40">· {product.name}</span>
            </p>
            <p className="mt-2 max-w-[46ch] text-xs leading-relaxed text-white/45">
              O uso dos dados desta base segue a Lei Geral de Proteção de Dados (LGPD). Consulte nossa Política de
              Privacidade para saber como as informações são tratadas.
            </p>
          </div>

          <div className="flex gap-6 text-xs text-white/60">
            <a href={brand.legalLinks.privacyPolicy} className="hover:text-white">
              Política de Privacidade
            </a>
            <a href={brand.legalLinks.terms} className="hover:text-white">
              Termos de Uso
            </a>
            <a href={brand.legalLinks.refundPolicy} className="hover:text-white">
              Política de Reembolso
            </a>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/35">
          © {new Date().getFullYear()} {brand.legalName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
