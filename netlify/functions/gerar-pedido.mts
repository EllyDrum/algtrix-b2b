import type { Config, Context } from '@netlify/functions'
import { timingSafeEqual } from 'node:crypto'
import { processarPedido } from '../../lib/server/processar'

/**
 * Função em segundo plano (até 15 minutos) que gera os arquivos de um pedido pago.
 * Acionada pelo webhook de pagamento com o cabeçalho x-interno = INTERNAL_SECRET.
 */
export default async (req: Request, context: Context) => {
  const segredo = Netlify.env.get('INTERNAL_SECRET') ?? ''
  const recebido = req.headers.get('x-interno') ?? ''
  const ok =
    segredo.length >= 24 &&
    recebido.length === segredo.length &&
    timingSafeEqual(Buffer.from(recebido), Buffer.from(segredo))
  if (!ok) {
    console.warn('gerar-pedido: chamada sem autorização')
    return
  }

  const { pedidoId } = (await req.json().catch(() => ({}))) as { pedidoId?: string }
  if (!pedidoId) return

  const siteUrl = Netlify.env.get('URL') ?? context.site.url ?? ''
  const pedido = await processarPedido(pedidoId, siteUrl)
  console.log(`gerar-pedido: ${pedido.id} ${pedido.status} (${pedido.arquivos.length} arquivo(s))`)
}

export const config: Config = {
  background: true,
  path: '/api/interno/gerar-pedido',
  method: 'POST',
}
