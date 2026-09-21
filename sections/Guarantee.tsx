import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { LockKey } from '@phosphor-icons/react/dist/ssr/LockKey'
import { Reveal } from '@/components/ui/Reveal'
import { pricing } from '@/config/pricing'

export function Guarantee() {
  return (
    <section className="bg-zinc-50 py-16 sm:py-20">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center">
            {pricing.guarantee.enabled ? (
              <>
                <ShieldCheck size={28} className="text-accent" />
                <p className="text-lg font-semibold text-ink-primary">
                  Garantia de {pricing.guarantee.days} dias
                </p>
                <p className="max-w-[52ch] text-sm leading-relaxed text-ink-secondary">
                  {pricing.guarantee.description}
                </p>
              </>
            ) : (
              <>
                <LockKey size={28} className="text-brand-primary" />
                <p className="text-lg font-semibold text-ink-primary">Compra segura e dados protegidos</p>
                <p className="max-w-[52ch] text-sm leading-relaxed text-ink-secondary">
                  O checkout é processado por um provedor de pagamento seguro e o uso dos dados segue a LGPD.
                  As condições de garantia serão exibidas aqui quando definidas.
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
