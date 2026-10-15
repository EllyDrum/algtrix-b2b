import type { Metadata } from 'next'
import { PainelPedidos } from '@/components/PainelPedidos'

export const metadata: Metadata = { title: 'Pedidos (interno)', robots: { index: false, follow: false } }

export default function AdminPedidosPage() {
  return (
    <main className="min-h-screen bg-algtrix-surface px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-pageWide">
        <h1 className="text-2xl font-semibold text-algtrix-text">Pedidos</h1>
        <p className="mt-1 text-sm text-algtrix-muted">
          Painel interno. Para Pix recebido direto na chave da empresa, confira o extrato e confirme o pagamento aqui;
          os arquivos são gerados em seguida.
        </p>
        <PainelPedidos />
      </div>
    </main>
  )
}
