import { Database } from '@phosphor-icons/react/dist/ssr/Database'
import { FunnelSimple } from '@phosphor-icons/react/dist/ssr/FunnelSimple'
import { MapPinLine } from '@phosphor-icons/react/dist/ssr/MapPinLine'
import { CloudArrowDown } from '@phosphor-icons/react/dist/ssr/CloudArrowDown'
import { Headset } from '@phosphor-icons/react/dist/ssr/Headset'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const ITEMS = [
  { icon: Database, label: 'Dados estruturados' },
  { icon: FunnelSimple, label: 'Filtros avançados' },
  { icon: MapPinLine, label: 'Cobertura nacional' },
  { icon: CloudArrowDown, label: 'Entrega digital' },
  { icon: Headset, label: 'Suporte' },
]

export function TrustStrip() {
  return (
    <section className="border-b border-border bg-white py-10">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <p className="max-w-[38ch] text-[15px] leading-relaxed text-ink-secondary">
              Uma base estruturada para transformar pesquisa manual em listas comerciais.
            </p>
            <ButtonLink href="#demonstracao" variant="secondary" size="md">
              Explorar os dados
            </ButtonLink>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
            {ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                <Icon size={18} className="text-brand-primary" />
                {label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
