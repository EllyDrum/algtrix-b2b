import { NextResponse } from 'next/server'
import { chaveAdminValida, listarPedidos } from '@/lib/server/admin'

export const dynamic = 'force-dynamic'

/** Lista de pedidos para o painel interno (exige INTERNAL_SECRET). */
export async function GET(request: Request) {
  if (!chaveAdminValida(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const pedidos = await listarPedidos()
  return NextResponse.json(
    pedidos.map((p) => ({
      id: p.id,
      criadoEm: p.criadoEm,
      status: p.status,
      email: p.email,
      nome: p.nome,
      metodo: p.metodo,
      provedor: p.pagamento?.provedor,
      totalCentavos: p.totalCentavos,
      itens: p.itens.map((i) => ({ descricao: i.descricao, empresas: i.empresas })),
      arquivos: p.arquivos.length,
      erro: p.erro,
    })),
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
