import { COMPETENCIA, TOTAL_EMPRESAS } from '@/lib/catalog'
import { formatarNumero } from '@/lib/pricing-engine'

const [ano, mes] = COMPETENCIA.split('-')
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const competenciaLegivel = `${MESES[Number(mes) - 1]}/${ano}`

const STATS = [
  { valor: formatarNumero(TOTAL_EMPRESAS), rotulo: 'empresas ativas' },
  { valor: '27', rotulo: 'estados cobertos' },
  { valor: '5.572', rotulo: 'cidades disponíveis' },
  { valor: competenciaLegivel, rotulo: 'base atualizada' },
]

/** Faixa de números reais da base, logo abaixo do hero. */
export function TrustStrip() {
  return (
    <section className="border-y border-algtrix-border bg-algtrix-surface">
      <div className="mx-auto grid max-w-pageWide grid-cols-2 divide-algtrix-border px-5 sm:px-8 lg:grid-cols-4 lg:divide-x">
        {STATS.map((s) => (
          <div key={s.rotulo} className="py-6 lg:px-8 lg:py-8 lg:first:pl-0 lg:last:pr-0">
            <p className="tabular font-sans text-2xl font-semibold tracking-tight text-algtrix-text sm:text-3xl">
              {s.valor}
            </p>
            <p className="mt-1 text-sm text-algtrix-muted">{s.rotulo}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
