import type { Metadata } from 'next'
import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { Lightning } from '@phosphor-icons/react/dist/ssr/Lightning'
import { FileXls } from '@phosphor-icons/react/dist/ssr/FileXls'
import { Navbar } from '@/sections/Navbar'
import { Footer } from '@/sections/Footer'
import { ListaBuilder } from '@/components/ListaBuilder'
import { TOTAL_EMPRESAS } from '@/lib/catalog'
import { DESCONTOS_CARRINHO, formatarBRL, formatarNumero } from '@/lib/pricing-engine'

export const metadata: Metadata = {
  title: 'Monte sua lista de empresas',
  description:
    'Escolha estado ou cidade, segmento e porte, veja quantas empresas e quanto custa antes de pagar. A partir de R$ 19,90.',
}

const GARANTIAS = [
  { icon: Lightning, titulo: 'Download imediato', texto: 'Arquivos gerados automaticamente após a confirmação do pagamento.' },
  { icon: FileXls, titulo: 'CSV, Excel e PDF', texto: 'Prontos para planilhas e CRM, com relatório formatado e a data da base em cada arquivo.' },
  { icon: ShieldCheck, titulo: 'Pagamento seguro', texto: 'Pix ou cartão de crédito processados pelo Mercado Pago.' },
]

export default function MontarListaPage() {
  const desconto = DESCONTOS_CARRINHO[0]
  return (
    <>
      <Navbar />
      <main className="bg-algtrix-bg pb-24 pt-10 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-pageWide px-5 sm:px-8">
          <header className="max-w-[640px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-algtrix-accent">Montar lista</p>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-[1.12] text-algtrix-text sm:text-[2.5rem]">
              Monte a lista exata de empresas que você precisa.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-algtrix-muted sm:text-base">
              {formatarNumero(TOTAL_EMPRESAS)} empresas ativas em 5.572 cidades das 27 UFs, com dados da Receita
              Federal e base atualizada. Veja a quantidade e o preço antes de pagar. Sem assinatura.
            </p>
          </header>

          <div className="mt-10">
            <ListaBuilder />
          </div>

          <section className="mt-16 grid gap-5 md:grid-cols-3" aria-label="Garantias">
            {GARANTIAS.map((g) => (
              <div key={g.titulo} className="flex gap-4 rounded-lg border border-algtrix-border bg-algtrix-surface p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-algtrix-accentSoft text-algtrix-accent">
                  <g.icon size={20} weight="duotone" />
                </span>
                <div>
                  <p className="font-semibold text-algtrix-text">{g.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-algtrix-muted">{g.texto}</p>
                </div>
              </div>
            ))}
          </section>

          <p className="mt-6 text-sm text-algtrix-muted">
            Listas a partir de {formatarBRL(1990)}. O valor depende do tamanho do recorte e aparece antes do
            pagamento.
            {desconto ? ` Ao comprar ${desconto.minItens} ou mais recortes, o carrinho aplica ${desconto.percentual}% de desconto no total.` : ''}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
