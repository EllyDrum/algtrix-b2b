import type { Metadata } from 'next'
import { Navbar } from '@/sections/Navbar'
import { Footer } from '@/sections/Footer'
import { ListaBuilder } from '@/components/ListaBuilder'
import { COMPETENCIA, TOTAL_EMPRESAS } from '@/lib/catalog'
import { FAIXAS, DESCONTOS_CARRINHO, formatarNumero } from '@/lib/pricing-engine'

export const metadata: Metadata = {
  title: 'Monte sua lista de empresas',
  description: 'Escolha estado ou cidade, segmento e porte, veja quantas empresas e quanto custa antes de pagar. A partir de R$ 19,90.',
}

export default function MontarListaPage() {
  return (
    <>
      <Navbar />
      <main className="bg-algtrix-bg pb-20 pt-10 sm:pt-14">
        <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
          <h1 className="max-w-[24ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Monte a lista exata de empresas que você precisa.
          </h1>
          <p className="mt-3 max-w-[60ch] text-algtrix-muted">
            {formatarNumero(TOTAL_EMPRESAS)} empresas ativas em 5.572 cidades das 27 UFs, base da Receita Federal (competência{' '}
            {COMPETENCIA}). Veja a quantidade e o preço antes de pagar. Sem assinatura.
          </p>
          <div className="mt-8">
            <ListaBuilder />
          </div>

          <section className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-algtrix-border bg-algtrix-surface p-6">
              <h2 className="font-semibold text-algtrix-text">Como o preço é calculado</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-algtrix-muted">
                <li>Até 2.000 empresas: R$ 19,90</li>
                {FAIXAS.map((f, i) => (
                  <li key={i}>
                    {i === 0 ? 'De 2.001' : `De ${formatarNumero((FAIXAS[i - 1]?.ate ?? 0) + 1)}`}
                    {Number.isFinite(f.ate) ? ` a ${formatarNumero(f.ate)}` : ' em diante'}: +R${' '}
                    {(f.centavosPorEmpresa / 100).toLocaleString('pt-BR', { maximumFractionDigits: 5 })} por empresa
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-algtrix-border bg-algtrix-surface p-6">
              <h2 className="font-semibold text-algtrix-text">Desconto no carrinho</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-algtrix-muted">
                {[...DESCONTOS_CARRINHO].reverse().map((d) => (
                  <li key={d.minItens}>
                    {d.minItens} ou mais recortes: {d.percentual}% de desconto no total
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-algtrix-muted">
                Cada recorte é entregue em um arquivo ZIP com CSV (e Excel até 100 mil empresas), com a data da base em
                cada arquivo.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
