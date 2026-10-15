import { NextResponse } from 'next/server'
import { statusLoja } from '@/lib/server/config'

export const dynamic = 'force-dynamic'

/** Informa ao site quais formas de pagamento estão liberadas. */
export async function GET() {
  return NextResponse.json(statusLoja(), { headers: { 'Cache-Control': 'no-store' } })
}
