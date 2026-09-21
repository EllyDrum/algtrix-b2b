import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'
import { product } from '@/config/product'

export const metadata: Metadata = { title: 'Política de Privacidade' }

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Política de Privacidade">
      <p>
        Este é um texto-base sugerido para orientar a redação da Política de Privacidade da {product.name}.
        Recomenda-se que o conteúdo final seja revisado por um profissional jurídico antes da publicação, em
        conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
      </p>
      <h2>Dados coletados</h2>
      <p>
        Sugere-se descrever aqui, de forma específica, quais dados pessoais são coletados através dos formulários
        de captura de lead e checkout (nome, e-mail, WhatsApp e empresa), e com qual finalidade.
      </p>
      <h2>Uso dos dados empresariais oferecidos no produto</h2>
      <p>
        Recomenda-se esclarecer que os dados empresariais comercializados são informações públicas ou de natureza
        comercial, e orientar o comprador sobre o uso responsável dessas informações, em conformidade com a LGPD.
      </p>
      <h2>Direitos do titular</h2>
      <p>
        Sugere-se incluir os canais de contato para exercício dos direitos previstos na LGPD (acesso, correção,
        exclusão e portabilidade de dados).
      </p>
    </LegalPageShell>
  )
}
