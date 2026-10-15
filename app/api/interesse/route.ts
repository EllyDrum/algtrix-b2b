import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { cotar, validarItem, type ItemRecorte } from '@/lib/pricing-engine'
import { municipiosDosItens } from '@/lib/server/municipios'

export const dynamic = 'force-dynamic'

/**
 * Lista de interessados enquanto as compras online não estão liberadas.
 * Guarda e-mail e recortes no Netlify Blobs (store "interessados"), visível em
 * Netlify > Data & Storage > Blobs.
 */
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as { email?: string; nome?: string; itens?: unknown[] } | null
  const email = corpo?.email?.trim().toLowerCase() ?? ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  }
  const itens = (corpo?.itens ?? []).slice(0, 20).map(validarItem).filter(Boolean) as ItemRecorte[]
  const cotacao = cotar(itens, await municipiosDosItens(itens))
  const registro = {
    email,
    nome: corpo?.nome?.trim().slice(0, 120) || undefined,
    criadoEm: new Date().toISOString(),
    itens: cotacao.itens.map((i) => ({ descricao: i.descricao, empresas: i.empresas, precoCentavos: i.precoCentavos })),
    totalCentavos: cotacao.totalCentavos,
  }
  const chave = `${registro.criadoEm.slice(0, 10)}/${Date.now()}-${randomBytes(3).toString('hex')}`
  await getStore('interessados').setJSON(chave, registro)
  return NextResponse.json({ ok: true })
}
