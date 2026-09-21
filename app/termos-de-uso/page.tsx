import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'

export const metadata: Metadata = { title: 'Termos de Uso' }

export default function TermsPage() {
  return (
    <LegalPageShell title="Termos de Uso">
      <p>
        Este é um texto-base sugerido para os Termos de Uso. Recomenda-se revisão jurídica antes da publicação,
        especialmente quanto às condições de licenciamento de uso dos dados e às responsabilidades das partes.
      </p>
      <h2>Objeto</h2>
      <p>
        Sugere-se descrever aqui o objeto exato da contratação: acesso à base de dados empresariais, formato de
        entrega e finalidade de uso autorizada.
      </p>
      <h2>Licença de uso dos dados</h2>
      <p>
        Recomenda-se detalhar se o uso é licenciado (não há transferência de titularidade dos dados) e quais usos
        são permitidos ou vedados (ex.: revenda dos dados a terceiros).
      </p>
      <h2>Pagamento e acesso</h2>
      <p>
        Sugere-se descrever as condições de pagamento, prazo de liberação de acesso e o que ocorre em caso de
        divergência no pagamento, quando o provedor de pagamento for definido.
      </p>
    </LegalPageShell>
  )
}
