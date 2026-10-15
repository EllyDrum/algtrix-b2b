import { NextResponse } from 'next/server'
import { vendasAtivas } from '@/lib/server/config'

export const dynamic = 'force-dynamic'

/** Informa ao site se as compras online já estão liberadas (configuração completa). */
export async function GET() {
  return NextResponse.json({ vendasAtivas: vendasAtivas() }, { headers: { 'Cache-Control': 'no-store' } })
}
