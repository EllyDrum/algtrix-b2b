import { gerarArquivoItem } from './gerador'
import { lerPedido, salvarPedido, tokenPedido, type Pedido } from './pedidos'
import { enviarEmailEntrega } from './email'

/**
 * Gera os arquivos de um pedido pago. Idempotente: itens já gerados são
 * mantidos, de modo que uma nova tentativa (retry da função em segundo plano)
 * continua de onde parou.
 */
export async function processarPedido(id: string, siteUrl: string): Promise<Pedido> {
  const pedido = await lerPedido(id)
  if (!pedido) throw new Error(`Pedido não encontrado: ${id}`)
  if (pedido.status === 'concluido') return pedido
  if (!['pago', 'gerando', 'erro'].includes(pedido.status)) {
    throw new Error(`Pedido ${id} não está pago (status: ${pedido.status})`)
  }

  pedido.status = 'gerando'
  pedido.erro = undefined
  await salvarPedido(pedido)

  try {
    for (let i = 0; i < pedido.itens.length; i++) {
      if (pedido.arquivos.some((a) => a.indiceItem === i)) continue
      const item = pedido.itens[i]!
      const arquivo = await gerarArquivoItem(pedido.id, i, item, item.empresas)
      pedido.arquivos.push(arquivo)
      await salvarPedido(pedido)
    }
    pedido.status = 'concluido'
    await salvarPedido(pedido)
  } catch (e) {
    pedido.status = 'erro'
    pedido.erro = e instanceof Error ? e.message.slice(0, 500) : String(e)
    await salvarPedido(pedido)
    throw e
  }

  if (!pedido.emailEnviado) {
    const link = `${siteUrl}/pedido/${pedido.id}?t=${tokenPedido(pedido.id)}`
    const enviado = await enviarEmailEntrega(pedido, link).catch((e) => {
      console.error('Falha ao enviar e-mail de entrega', pedido.id, e)
      return false
    })
    if (enviado) {
      pedido.emailEnviado = true
      await salvarPedido(pedido)
    }
  }
  return pedido
}
