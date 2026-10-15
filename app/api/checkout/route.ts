import { NextResponse } from 'next/server'
import { COMPETENCIA } from '@/lib/catalog'
import { cotar, MAX_ITENS_CARRINHO, validarItem, type ItemRecorte } from '@/lib/pricing-engine'
import { criarPedido, salvarPedido, tokenPedido } from '@/lib/server/pedidos'
import { criarPagamentoPix, criarPreferencia } from '@/lib/payments/mercadopago'
import { acionarGeracao, pagamentoSimuladoPermitido, urlDoSite } from '@/lib/server/site'
import { enviarEmailPagamentoPendente } from '@/lib/server/email'
import { municipiosDosItens } from '@/lib/server/municipios'
import { statusLoja } from '@/lib/server/config'
import { criarPixEstatico } from '@/lib/payments/pix-brcode'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Cria o pedido e a cobrança. O valor é SEMPRE recalculado no servidor a partir
 * das estatísticas da base; o cliente envia apenas os recortes escolhidos.
 *
 * Formas de pagamento:
 * - pix: QR Code gerado na hora e exibido na página do pedido (Checkout Transparente);
 * - cartao: redireciona para o Checkout Pro do Mercado Pago, restrito a cartão de crédito.
 */
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as {
    email?: string
    nome?: string
    documento?: string
    itens?: unknown[]
    aceite?: boolean
    metodo?: string
  } | null

  const loja = statusLoja()
  if (!loja.vendasAtivas) {
    return NextResponse.json(
      { error: 'As compras online estão em fase final de configuração. Deixe seu e-mail para ser avisado.' },
      { status: 503 },
    )
  }

  const email = corpo?.email?.trim().toLowerCase() ?? ''
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  if (corpo?.aceite !== true) {
    return NextResponse.json({ error: 'É preciso aceitar os termos de uso e a política de privacidade.' }, { status: 400 })
  }
  const metodo: 'pix' | 'cartao' = corpo?.metodo === 'cartao' && loja.cartao ? 'cartao' : 'pix'
  const documento = (corpo?.documento ?? '').replace(/\D/g, '')
  if (documento && documento.length !== 11 && documento.length !== 14) {
    return NextResponse.json({ error: 'CPF ou CNPJ inválido.' }, { status: 400 })
  }
  const itens = (corpo?.itens ?? []).slice(0, MAX_ITENS_CARRINHO).map(validarItem).filter(Boolean) as ItemRecorte[]
  const cotacao = cotar(itens, await municipiosDosItens(itens))
  if (!cotacao.itens.length) return NextResponse.json({ error: 'Carrinho vazio ou inválido.' }, { status: 400 })

  const pedido = await criarPedido({
    email,
    nome: corpo?.nome?.trim().slice(0, 120) || undefined,
    documento: documento || undefined,
    cotacao,
    competencia: COMPETENCIA,
  })
  pedido.metodo = metodo
  const site = urlDoSite()
  const linkPedido = `${site}/pedido/${pedido.id}?t=${tokenPedido(pedido.id)}`
  const urlNotificacao = `${site}/api/webhook?source_news=webhooks`

  if (pagamentoSimuladoPermitido()) {
    pedido.status = 'pago'
    pedido.pagamento = { provedor: 'simulado', status: 'approved', aprovadoEm: new Date().toISOString() }
    await salvarPedido(pedido)
    await acionarGeracao(pedido.id)
    return NextResponse.json({ pedidoId: pedido.id, checkoutUrl: linkPedido })
  }

  try {
    if (metodo === 'pix' && loja.pix === 'estatico') {
      // Pix direto na chave da empresa: o cliente paga e a confirmação é feita no painel interno.
      const pix = await criarPixEstatico(pedido.id, pedido.totalCentavos)
      pedido.pagamento = { provedor: 'pix-estatico', id: pix.id, status: 'pending' }
      pedido.pix = { pagamentoId: pix.id, qrCode: pix.qrCode, qrCodeBase64: pix.qrCodeBase64, expiraEm: pix.expiraEm }
      await salvarPedido(pedido)
      await enviarEmailPagamentoPendente(pedido, linkPedido).catch(() => false)
      return NextResponse.json({ pedidoId: pedido.id, checkoutUrl: linkPedido })
    }

    if (metodo === 'pix') {
      const pix = await criarPagamentoPix({
        pedidoId: pedido.id,
        valorCentavos: pedido.totalCentavos,
        email,
        nome: pedido.nome,
        documento: pedido.documento,
        descricao: `Algtrix B2B - pedido ${pedido.id}`,
        urlNotificacao,
      })
      pedido.pagamento = { provedor: 'mercadopago', id: pix.id, status: 'pending' }
      pedido.pix = { pagamentoId: pix.id, qrCode: pix.qrCode, qrCodeBase64: pix.qrCodeBase64, expiraEm: pix.expiraEm }
      await salvarPedido(pedido)
      await enviarEmailPagamentoPendente(pedido, linkPedido).catch(() => false)
      return NextResponse.json({ pedidoId: pedido.id, checkoutUrl: linkPedido })
    }

    const preferencia = await criarPreferencia({
      pedidoId: pedido.id,
      email,
      nome: pedido.nome,
      itens: cotacao.itens.map((item, i) => ({
        id: `${pedido.id}-${i + 1}`,
        titulo: `Lista de empresas: ${item.descricao}`,
        precoCentavos: item.precoCentavos,
      })),
      descontoCentavos: cotacao.descontoCentavos,
      urlRetorno: linkPedido,
      urlNotificacao,
    })
    pedido.pagamento = { provedor: 'mercadopago', id: preferencia.id }
    await salvarPedido(pedido)
    await enviarEmailPagamentoPendente(pedido, linkPedido).catch(() => false)
    return NextResponse.json({ pedidoId: pedido.id, checkoutUrl: preferencia.initPoint })
  } catch (e) {
    console.error('checkout: erro ao criar cobrança', pedido.id, e)
    await salvarPedido(pedido).catch(() => undefined)
    return NextResponse.json(
      { error: 'Não foi possível iniciar o pagamento agora. Tente novamente em instantes.' },
      { status: 502 },
    )
  }
}
