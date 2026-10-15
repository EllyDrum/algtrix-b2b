import { timingSafeEqual } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { lerPedido, type Pedido } from './pedidos'

/** Confere a chave administrativa (INTERNAL_SECRET) enviada por cabeçalho ou query string. */
export function chaveAdminValida(request: Request): boolean {
  const segredo = process.env.INTERNAL_SECRET ?? ''
  const recebido = request.headers.get('x-interno') ?? new URL(request.url).searchParams.get('chave') ?? ''
  return (
    segredo.length >= 24 && recebido.length === segredo.length && timingSafeEqual(Buffer.from(recebido), Buffer.from(segredo))
  )
}

/** Lista os pedidos mais recentes (o Blobs guarda um JSON por pedido). */
export async function listarPedidos(limite = 100): Promise<Pedido[]> {
  const { blobs } = await getStore({ name: 'pedidos', consistency: 'strong' }).list()
  const ids = blobs
    .map((b) => b.key)
    .filter((k) => /^ALG-\d{8}-[0-9A-F]{8}$/.test(k))
    .sort()
    .reverse()
    .slice(0, limite)
  const pedidos = await Promise.all(ids.map((id) => lerPedido(id)))
  return pedidos.filter((p): p is Pedido => Boolean(p))
}
