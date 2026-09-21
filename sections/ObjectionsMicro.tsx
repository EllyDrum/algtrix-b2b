import { Reveal } from '@/components/ui/Reveal'

const ITEMS = [
  { question: 'Recebo como?', answer: 'Acesso digital, liberado após a confirmação da compra.' },
  { question: 'Preciso saber programação?', answer: 'Não. O uso é direto, sem conhecimento técnico.' },
  { question: 'Funciona no Excel?', answer: 'Sim, os arquivos são compatíveis com Excel e planilhas.' },
  { question: 'Posso filtrar os dados?', answer: 'Sim, por localização, segmento, porte e mais.' },
  { question: 'Quando recebo?', answer: 'O prazo exato é informado no momento da compra.' },
]

export function ObjectionsMicro() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ITEMS.map((item) => (
              <div key={item.question} className="rounded-lg border border-border p-5">
                <p className="text-sm font-semibold text-ink-primary">{item.question}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">{item.answer}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
