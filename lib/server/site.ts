/** URL pública do site no ambiente atual (Netlify define URL/DEPLOY_PRIME_URL em tempo de execução). */
export function urlDoSite(): string {
  const contexto = process.env.CONTEXT
  const url =
    (contexto && contexto !== 'production' ? process.env.DEPLOY_PRIME_URL : undefined) ??
    process.env.URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:8888'
  return url.replace(/\/$/, '')
}

/** O modo de pagamento simulado nunca é aceito em produção. */
export function pagamentoSimuladoPermitido(): boolean {
  return process.env.PAYMENT_PROVIDER === 'mock' && process.env.CONTEXT !== 'production'
}

/** Aciona a função em segundo plano que gera os arquivos do pedido. */
export async function acionarGeracao(pedidoId: string): Promise<void> {
  const res = await fetch(`${urlDoSite()}/api/interno/gerar-pedido`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-interno': process.env.INTERNAL_SECRET ?? '' },
    body: JSON.stringify({ pedidoId }),
  })
  if (res.status !== 202 && !res.ok) throw new Error(`Falha ao acionar geração: HTTP ${res.status}`)
}
