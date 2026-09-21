import { Cpu } from '@phosphor-icons/react/dist/ssr/Cpu'
import { Heartbeat } from '@phosphor-icons/react/dist/ssr/Heartbeat'
import { HardHat } from '@phosphor-icons/react/dist/ssr/HardHat'
import { Factory } from '@phosphor-icons/react/dist/ssr/Factory'
import { Storefront } from '@phosphor-icons/react/dist/ssr/Storefront'
import { Wrench } from '@phosphor-icons/react/dist/ssr/Wrench'
import { GraduationCap } from '@phosphor-icons/react/dist/ssr/GraduationCap'
import { Truck } from '@phosphor-icons/react/dist/ssr/Truck'
import { Plant } from '@phosphor-icons/react/dist/ssr/Plant'
import { Lightning } from '@phosphor-icons/react/dist/ssr/Lightning'
import { Bank } from '@phosphor-icons/react/dist/ssr/Bank'
import { Briefcase } from '@phosphor-icons/react/dist/ssr/Briefcase'
import { Reveal } from '@/components/ui/Reveal'
import { product } from '@/config/product'
import type { Icon } from '@phosphor-icons/react'

const SEGMENT_META: Record<string, { icon: Icon; description: string }> = {
  Tecnologia: { icon: Cpu, description: 'Empresas de software e serviços digitais.' },
  Saúde: { icon: Heartbeat, description: 'Clínicas, laboratórios e serviços de saúde.' },
  Construção: { icon: HardHat, description: 'Construtoras, incorporadoras e obras.' },
  Indústria: { icon: Factory, description: 'Fabricantes e linhas de produção.' },
  Comércio: { icon: Storefront, description: 'Varejo e distribuição de produtos.' },
  Serviços: { icon: Wrench, description: 'Prestadoras de serviços especializados.' },
  Educação: { icon: GraduationCap, description: 'Escolas, cursos e instituições de ensino.' },
  Logística: { icon: Truck, description: 'Transporte, frete e armazenagem.' },
  Agronegócio: { icon: Plant, description: 'Produção e insumos agrícolas.' },
  Energia: { icon: Lightning, description: 'Geração, distribuição e eficiência energética.' },
  Finanças: { icon: Bank, description: 'Instituições financeiras e meios de pagamento.' },
  Consultoria: { icon: Briefcase, description: 'Consultorias técnicas e de gestão.' },
}

export function Segments() {
  return (
    <section className="bg-algtrix-surface py-20 sm:py-24">
      <div className="mx-auto max-w-pageWide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-[24ch] font-sans text-3xl font-semibold leading-tight tracking-tight text-algtrix-text sm:text-4xl">
            Segmentos que você encontra na base.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {product.segments.map((segment, index) => {
            const meta = SEGMENT_META[segment]
            if (!meta) return null
            return (
              <Reveal key={segment} delay={index * 0.02}>
                <div className="flex h-full flex-col gap-2.5 rounded-lg border border-algtrix-border bg-algtrix-bg p-5">
                  <meta.icon size={20} className="text-algtrix-accent" weight="duotone" />
                  <p className="text-[15px] font-semibold text-algtrix-text">{segment}</p>
                  <p className="text-xs leading-relaxed text-algtrix-dim">{meta.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
