import { NextResponse } from 'next/server'
import type { LeadPayload } from '@/types'

/**
 * Recebe leads do modal de captura. Hoje apenas valida e loga —
 * TODO(Elli): plugar em LEAD_WEBHOOK_URL (CRM, planilha, e-mail
 * transacional) quando o destino for definido.
 */
export async function POST(request: Request) {
  let body: Partial<LeadPayload>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { name, email, whatsapp, company } = body
  if (!name || !email || !whatsapp || !company) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('[lead] falha ao enviar para o webhook configurado', error)
    }
  } else {
    console.info('[lead] recebido (sem LEAD_WEBHOOK_URL configurado):', body)
  }

  return NextResponse.json({ ok: true })
}
