import type { Pedido } from './pedidos'

/**
 * E-mail transacional via Resend (https://resend.com).
 * Variáveis: RESEND_API_KEY, EMAIL_REMETENTE (ex.: "Algtrix B2B <pedidos@seudominio.com.br>").
 * Sem RESEND_API_KEY o envio é ignorado e o cliente usa o link da página do pedido.
 */

function brl(c: number) {
  return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function escapar(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)
}

async function enviar(para: string, assunto: string, html: string): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY
  const remetente = process.env.EMAIL_REMETENTE
  if (!chave || !remetente) {
    console.warn('E-mail não enviado: RESEND_API_KEY ou EMAIL_REMETENTE ausente')
    return false
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: remetente, to: [para], reply_to: process.env.EMAIL_RESPOSTA || 'contato@algtrix.com', subject: assunto, html }),
  })
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`)
  return true
}

export async function enviarEmailEntrega(pedido: Pedido, linkPedido: string): Promise<boolean> {
  const linhas = pedido.itens
    .map((item, i) => {
      const arq = pedido.arquivos.find((a) => a.indiceItem === i)
      return `<li>${escapar(item.descricao)}: <strong>${(arq?.linhas ?? item.empresas).toLocaleString('pt-BR')} empresas</strong></li>`
    })
    .join('')
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#1c1533">
    <h2 style="color:#1c1533">Sua lista está pronta</h2>
    <p>Olá${pedido.nome ? ` ${escapar(pedido.nome)}` : ''}, o pagamento do pedido <strong>${pedido.id}</strong> foi confirmado e os arquivos já estão disponíveis.</p>
    <ul>${linhas}</ul>
    <p>Total pago: <strong>${brl(pedido.totalCentavos)}</strong> · Dados da Receita Federal, base atualizada</p>
    <p style="margin:28px 0"><a href="${linkPedido}" style="background:#41b7c4;color:#170f2b;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Baixar meus arquivos</a></p>
    <p style="font-size:13px;color:#555">Guarde este e-mail: o link acima dá acesso permanente aos seus downloads. Licença de uso interno, não transferível. Ao usar os contatos, observe a LGPD.</p>
  </div>`
  return enviar(pedido.email, `Algtrix B2B: sua lista está pronta (pedido ${pedido.id})`, html)
}

export async function enviarEmailPagamentoPendente(pedido: Pedido, linkPedido: string): Promise<boolean> {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#1c1533">
    <h2>Seu pedido está reservado</h2>
    <p>Recebemos o pedido <strong>${pedido.id}</strong> (${brl(pedido.totalCentavos)}). Assim que o pagamento for confirmado, a lista é gerada automaticamente.</p>
    <p><a href="${linkPedido}">Acompanhar meu pedido</a></p>
  </div>`
  return enviar(pedido.email, `Algtrix B2B: pedido ${pedido.id} recebido`, html)
}
