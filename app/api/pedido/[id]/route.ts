import { NextResponse } from 'next/server'
import { lerPedido, tokenValido } from '@/lib/server/pedidos'
import { linkDownload } from '@/lib/server/r2'
import { statusLoja } from '@/lib/server/config'

export const dynamic = 'force-dynamic'

/** Situação do pedido e links de download recém-assinados (válidos por 24 horas). */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = new URL(request.url).searchParams.get('t')
  if (!tokenValido(params.id, token)) return NextResponse.json({ error: 'Link inválido' }, { status: 404 })
  const pedido = await lerPedido(params.id)
  if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  const arquivos = await Promise.all(
    pedido.arquivos.map(async (a) => ({
      indiceItem: a.indiceItem,
      nomeArquivo: a.nomeArquivo,
      linhas: a.linhas,
      bytes: a.bytes,
      formatos: a.formatos,
      url: pedido.status === 'concluido' || pedido.status === 'gerando' ? await linkDownload(a.chave, a.nomeArquivo) : null,
    })),
  )

  return NextResponse.json(
    {
      id: pedido.id,
      status: pedido.status,
      criadoEm: pedido.criadoEm,
      email: pedido.email.replace(/^(.{2}).*(@.*)$/, '$1***$2'),
      itens: pedido.itens.map((i) => ({ descricao: i.descricao, empresas: i.empresas, precoCentavos: i.precoCentavos })),
      subtotalCentavos: pedido.subtotalCentavos,
      descontoCentavos: pedido.descontoCentavos,
      totalCentavos: pedido.totalCentavos,
      competencia: pedido.competencia,
      arquivos,
      metodo: pedido.metodo ?? null,
      provedor: pedido.pagamento?.provedor ?? null,
      beneficiario: statusLoja().beneficiario,
      pix:
        pedido.status === 'aguardando_pagamento' && pedido.pix
          ? { qrCode: pedido.pix.qrCode, qrCodeBase64: pedido.pix.qrCodeBase64, expiraEm: pedido.pix.expiraEm }
          : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
