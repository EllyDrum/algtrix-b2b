import { NextResponse } from 'next/server'
import { carregarMunicipios } from '@/lib/server/municipios'

/** Municípios de uma UF com as contagens por segmento (dados agregados, sem empresas). */
export async function GET(_request: Request, { params }: { params: { uf: string } }) {
  const municipios = await carregarMunicipios(params.uf.toUpperCase())
  if (!municipios) return NextResponse.json({ error: 'UF inválida' }, { status: 404 })
  return NextResponse.json(municipios, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' },
  })
}
