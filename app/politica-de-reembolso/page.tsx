import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'
import { pricing } from '@/config/pricing'

export const metadata: Metadata = { title: 'Política de Reembolso' }

export default function RefundPolicyPage() {
  return (
    <LegalPageShell title="Política de Reembolso">
      {pricing.guarantee.enabled ? (
        <p>
          Sugere-se detalhar aqui as condições da garantia de {pricing.guarantee.days} dias mencionada no site,
          incluindo o processo para solicitar o reembolso e o prazo de processamento.
        </p>
      ) : (
        <p>
          Nenhuma política de reembolso foi definida até o momento. Recomenda-se publicar esta página somente após
          a definição formal das condições de garantia e reembolso, para evitar divergência entre o que é
          comunicado no site e o que é efetivamente praticado.
        </p>
      )}
      <p>
        Em qualquer cenário, recomenda-se que o texto final seja revisado por um profissional jurídico e esteja em
        conformidade com o Código de Defesa do Consumidor, incluindo o direito de arrependimento em compras
        realizadas fora do estabelecimento comercial (art. 49 do CDC), quando aplicável.
      </p>
    </LegalPageShell>
  )
}
