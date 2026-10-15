import type { Metadata } from 'next'
import { Navbar } from '@/sections/Navbar'
import { Footer } from '@/sections/Footer'
import { PedidoStatus } from '@/components/PedidoStatus'

export const metadata: Metadata = {
  title: 'Seu pedido',
  robots: { index: false, follow: false },
}

export default function PedidoPage({ params, searchParams }: { params: { id: string }; searchParams: { t?: string } }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-algtrix-bg py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <PedidoStatus id={params.id} token={searchParams.t ?? ''} />
        </div>
      </main>
      <Footer />
    </>
  )
}
