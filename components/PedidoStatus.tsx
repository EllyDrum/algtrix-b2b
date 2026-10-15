'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr/CircleNotch'
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple'
import { FileXls } from '@phosphor-icons/react/dist/ssr/FileXls'
import { FilePdf } from '@phosphor-icons/react/dist/ssr/FilePdf'
import { FileZip } from '@phosphor-icons/react/dist/ssr/FileZip'
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle'
import { formatarBRL, formatarNumero } from '@/lib/pricing-engine'
import { brand } from '@/config/brand'
import { formatarCnpj } from '@/lib/payments/pix-brcode'

interface PedidoApi {
  id: string
  status: 'aguardando_pagamento' | 'pago' | 'gerando' | 'concluido' | 'erro' | 'cancelado'
  email: string
  itens: { descricao: string; empresas: number; precoCentavos: number }[]
  descontoCentavos: number
  totalCentavos: number
  competencia: string
  arquivos: {
    indiceItem: number
    nomeArquivo: string
    linhas: number
    bytes: number
    formatos: string[]
    url: string | null
    downloads?: { formato: 'XLSX' | 'PDF' | 'CSV'; nomeArquivo: string; bytes: number; url: string | null }[]
  }[]
  metodo: 'pix' | 'cartao' | null
  provedor: string | null
  beneficiario: { nome: string; chave: string } | null
  pix: { qrCode: string; qrCodeBase64: string; expiraEm: string } | null
}

const TEXTO: Record<PedidoApi['status'], { titulo: string; detalhe: string }> = {
  aguardando_pagamento: {
    titulo: 'Aguardando a confirmação do pagamento',
    detalhe: 'Pagamentos com Pix costumam ser confirmados em segundos. Esta página atualiza sozinha.',
  },
  pago: {
    titulo: 'Pagamento confirmado',
    detalhe: 'Estamos preparando seus arquivos. Você pode fechar esta página: enviaremos o link de download por e-mail assim que ficarem prontos.',
  },
  gerando: {
    titulo: 'Pagamento confirmado. Gerando seus arquivos',
    detalhe: 'Listas grandes levam de 5 a 10 minutos. Você pode fechar esta página: o link de download chegará no seu e-mail assim que os arquivos estiverem prontos.',
  },
  concluido: { titulo: 'Sua lista está pronta', detalhe: 'Baixe os arquivos abaixo. Este link continua válido.' },
  erro: {
    titulo: 'Estamos finalizando seu pedido',
    detalhe: 'Seu pagamento está confirmado. A geração está sendo refeita automaticamente e o link chegará por e-mail. Se precisar, fale com contato@algtrix.com.',
  },
  cancelado: { titulo: 'Pagamento não concluído', detalhe: 'O pagamento foi recusado ou cancelado. Você pode tentar novamente.' },
}

function tamanho(bytes: number) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1).replace('.', ',')} MB` : `${Math.ceil(bytes / 1e3)} KB`
}

export function PedidoStatus({ id, token }: { id: string; token: string }) {
  const [pedido, setPedido] = useState<PedidoApi | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    let timer: number | undefined
    async function carregar() {
      try {
        const res = await fetch(`/api/pedido/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Pedido não encontrado. Confira o link recebido por e-mail.')
        const data = (await res.json()) as PedidoApi
        if (!ativo) return
        setPedido(data)
        if (data.status !== 'concluido' && data.status !== 'cancelado') timer = window.setTimeout(carregar, 5000)
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar o pedido.')
      }
    }
    carregar()
    return () => {
      ativo = false
      if (timer) window.clearTimeout(timer)
    }
  }, [id, token])

  if (erro) return <p className="rounded-lg border border-algtrix-border bg-algtrix-surface p-6 text-algtrix-muted">{erro}</p>
  if (!pedido)
    return (
      <p className="flex items-center gap-2 text-algtrix-muted">
        <CircleNotch size={18} className="animate-spin" /> Carregando pedido...
      </p>
    )

  async function novoPix() {
    const res = await fetch(`/api/pedido/${encodeURIComponent(id)}/pix?t=${encodeURIComponent(token)}`, { method: 'POST' })
    if (res.ok) window.location.reload()
    else setErro('Não foi possível gerar um novo Pix agora. Tente novamente em instantes.')
  }

  const t =
    pedido.status === 'aguardando_pagamento' && pedido.provedor === 'pix-estatico'
      ? {
          titulo: 'Aguardando o pagamento',
          detalhe: 'Pague pelo QR Code abaixo. Assim que o recebimento for confirmado, os arquivos aparecem nesta página e o link chega por e-mail.',
        }
      : pedido.status === 'aguardando_pagamento' && pedido.metodo === 'cartao'
        ? {
            titulo: 'Aguardando a confirmação do cartão',
            detalhe: 'Se você ainda não concluiu o pagamento, volte à página de pagamento. A confirmação costuma levar alguns segundos e esta página atualiza sozinha.',
          }
        : TEXTO[pedido.status]
  const pronto = pedido.status === 'concluido'

  return (
    <div className="rounded-lg border border-algtrix-border bg-algtrix-surface p-6 sm:p-8">
      <div className="flex items-start gap-3">
        {pronto ? (
          <CheckCircle size={32} weight="fill" className="shrink-0 text-algtrix-accent" />
        ) : pedido.status === 'cancelado' ? (
          <WarningCircle size={32} weight="fill" className="shrink-0 text-algtrix-amber" />
        ) : (
          <CircleNotch size={32} className="shrink-0 animate-spin text-algtrix-accent" />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-algtrix-text">{t.titulo}</h1>
          <p className="mt-1 text-sm text-algtrix-muted">{t.detalhe}</p>
        </div>
      </div>

      {pedido.status === 'aguardando_pagamento' && pedido.pix && (
        <BlocoPix pix={pedido.pix} onNovo={novoPix} estatico={pedido.provedor === 'pix-estatico'} beneficiario={pedido.beneficiario} />
      )}

      {pedido.status === 'cancelado' && (
        <button
          type="button"
          onClick={novoPix}
          className="mt-6 rounded-md bg-algtrix-cta px-5 py-3 text-sm font-semibold text-algtrix-ctaText hover:bg-algtrix-ctaHover"
        >
          Pagar com Pix agora
        </button>
      )}

      <p className="mt-6 text-xs text-algtrix-dim">
        Pedido {pedido.id} · {pedido.email} · base atualizada
      </p>

      <ul className="mt-4 space-y-3">
        {pedido.itens.map((item, i) => {
          const arq = pedido.arquivos.find((a) => a.indiceItem === i)
          const downloads = arq?.downloads?.length ? arq.downloads : arq?.url ? [{ formato: 'CSV' as const, nomeArquivo: arq.nomeArquivo, bytes: arq.bytes, url: arq.url }] : []
          const principais = downloads.filter((d) => d.formato !== 'CSV')
          const csv = downloads.find((d) => d.formato === 'CSV')
          return (
            <li key={i} className="rounded-lg border border-algtrix-border bg-algtrix-bg p-4 sm:p-5">
              <p className="font-medium text-algtrix-text">{item.descricao}</p>
              <p className="mt-0.5 text-sm text-algtrix-dim">
                {formatarNumero(arq?.linhas ?? item.empresas)} empresas
                {arq ? ' · base atualizada' : ''}
              </p>
              {downloads.length > 0 ? (
                <div className="mt-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {principais.map((d) => (
                      <a
                        key={d.formato}
                        href={d.url ?? '#'}
                        className="flex items-center gap-3 rounded-md bg-algtrix-cta px-4 py-3 text-algtrix-ctaText transition-colors hover:bg-algtrix-ctaHover"
                      >
                        {d.formato === 'XLSX' ? <FileXls size={26} weight="duotone" /> : <FilePdf size={26} weight="duotone" />}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {d.formato === 'XLSX' ? 'Baixar Excel' : 'Baixar PDF'}
                          </span>
                          <span className="block text-xs text-algtrix-ctaText/75">
                            {d.formato === 'XLSX' ? 'Planilha com resumo e lista completa' : 'Relatório formatado'} · {tamanho(d.bytes)}
                          </span>
                        </span>
                        <DownloadSimple size={18} weight="bold" className="ml-auto shrink-0" />
                      </a>
                    ))}
                  </div>
                  {csv && (
                    <a
                      href={csv.url ?? '#'}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-algtrix-muted hover:text-algtrix-text"
                    >
                      <FileZip size={16} /> Também em CSV (ZIP com todos os arquivos) · {tamanho(csv.bytes)}
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-algtrix-dim">
                  {pedido.status === 'cancelado' ? '' : pedido.status === 'aguardando_pagamento' ? 'Excel e PDF liberados após o pagamento' : 'Gerando Excel e PDF...'}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-right text-sm text-algtrix-text">
        Total: <strong>{formatarBRL(pedido.totalCentavos)}</strong>
      </p>

      {pedido.status === 'cancelado' && (
        <a href="/montar-lista" className="mt-6 inline-block text-sm font-semibold text-algtrix-accent underline">
          Voltar ao carrinho e tentar novamente
        </a>
      )}
      <p className="mt-8 text-xs text-algtrix-dim">
        Dúvidas: {brand.support.email}. Licença de uso interno, não transferível. Ao usar os contatos, observe a LGPD.
      </p>
    </div>
  )
}

function BlocoPix({
  pix,
  onNovo,
  estatico,
  beneficiario,
}: {
  pix: { qrCode: string; qrCodeBase64: string; expiraEm: string }
  onNovo: () => void
  estatico: boolean
  beneficiario: { nome: string; chave: string } | null
}) {
  const [copiado, setCopiado] = useState(false)
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const restante = Math.max(0, new Date(pix.expiraEm).getTime() - agora)
  const min = Math.floor(restante / 60000)
  const seg = Math.floor((restante % 60000) / 1000)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pix.qrCode)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  if (restante === 0 && !estatico) {
    return (
      <div className="mt-6 rounded-lg border border-algtrix-border bg-algtrix-bg p-5 text-center">
        <p className="text-sm text-algtrix-muted">O QR Code expirou. Gere um novo para concluir o pagamento.</p>
        <button
          type="button"
          onClick={onNovo}
          className="mt-3 rounded-md bg-algtrix-cta px-5 py-3 text-sm font-semibold text-algtrix-ctaText hover:bg-algtrix-ctaHover"
        >
          Gerar novo Pix
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border-2 border-algtrix-accent bg-algtrix-bg">
      <div className="grid gap-6 p-5 sm:grid-cols-[220px_1fr] sm:items-start sm:p-6">
        <div className="mx-auto w-[220px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code do Pix"
            width={220}
            height={220}
            className="h-[220px] w-[220px] rounded-md border border-algtrix-border bg-white p-2"
          />
          {!estatico && (
            <p className="mt-2 text-center text-xs text-algtrix-dim">
              Expira em {String(min).padStart(2, '0')}:{String(seg).padStart(2, '0')}
            </p>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-algtrix-text">Pague com Pix</p>
          {beneficiario && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md bg-algtrix-surface px-3 py-2.5 text-sm">
              <dt className="text-algtrix-dim">Favorecido</dt>
              <dd className="font-medium text-algtrix-text">{beneficiario.nome}</dd>
              <dt className="text-algtrix-dim">CNPJ</dt>
              <dd className="font-mono text-algtrix-text">{formatarCnpj(beneficiario.chave)}</dd>
            </dl>
          )}
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-algtrix-muted">
            <li>Abra o aplicativo do seu banco e escolha pagar com Pix.</li>
            <li>Leia o QR Code ou cole o código Pix Copia e Cola.</li>
            <li>Confira o favorecido e o valor e confirme o pagamento.</li>
            <li>
              {estatico
                ? 'Assim que o recebimento for confirmado, os arquivos são liberados nesta página e por e-mail.'
                : 'A liberação é automática em segundos após o pagamento.'}
            </li>
          </ol>
          <button
            type="button"
            onClick={copiar}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-algtrix-cta px-4 py-3 text-sm font-semibold text-algtrix-ctaText hover:bg-algtrix-ctaHover"
          >
            {copiado ? 'Código copiado' : 'Copiar código Pix Copia e Cola'}
          </button>
        </div>
      </div>
      <p className="border-t border-algtrix-border bg-algtrix-surface px-5 py-2.5 text-xs text-algtrix-dim">
        Esta página atualiza sozinha. Guarde o link do pedido: ele dá acesso aos arquivos depois da liberação.
      </p>
    </div>
  )
}
