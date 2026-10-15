'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatarBRL, formatarNumero } from '@/lib/pricing-engine'

interface Linha {
  id: string
  criadoEm: string
  status: string
  email: string
  nome?: string
  metodo?: string
  provedor?: string
  totalCentavos: number
  itens: { descricao: string; empresas: number }[]
  arquivos: number
  erro?: string
}

const ROTULO: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  gerando: 'Gerando arquivos',
  concluido: 'Concluído',
  erro: 'Erro',
  cancelado: 'Cancelado',
}

export function PainelPedidos() {
  const [chave, setChave] = useState('')
  const [linhas, setLinhas] = useState<Linha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  useEffect(() => {
    try {
      const salva = window.sessionStorage.getItem('algtrix-admin-chave')
      if (salva) setChave(salva)
    } catch {
      // sem armazenamento
    }
  }, [])

  const carregar = useCallback(async () => {
    if (!chave) return
    setErro(null)
    const res = await fetch('/api/interno/pedidos', { headers: { 'x-interno': chave }, cache: 'no-store' })
    if (!res.ok) {
      setLinhas(null)
      setErro(res.status === 401 ? 'Chave inválida.' : 'Falha ao carregar.')
      return
    }
    setLinhas((await res.json()) as Linha[])
    try {
      window.sessionStorage.setItem('algtrix-admin-chave', chave)
    } catch {
      // sem armazenamento
    }
  }, [chave])

  async function confirmar(id: string) {
    setOcupado(id)
    try {
      const res = await fetch('/api/interno/confirmar-pagamento', {
        method: 'POST',
        headers: { 'x-interno': chave, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: id }),
      })
      if (!res.ok) setErro('Não foi possível confirmar.')
      await carregar()
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void carregar()
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="password"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          placeholder="Chave interna (INTERNAL_SECRET)"
          className="field sm:max-w-md"
          autoComplete="off"
        />
        <button type="submit" className="rounded-md bg-algtrix-text px-5 py-3 text-sm font-semibold text-white">
          Carregar pedidos
        </button>
      </form>
      {erro && <p className="mt-3 text-sm font-medium text-algtrix-risk">{erro}</p>}

      {linhas && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-algtrix-border bg-algtrix-bg">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-algtrix-surface2 text-xs uppercase tracking-wide text-algtrix-dim">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-algtrix-muted">
                    Nenhum pedido ainda.
                  </td>
                </tr>
              )}
              {linhas.map((p) => (
                <tr key={p.id} className="border-t border-algtrix-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-algtrix-text">{p.id}</p>
                    <p className="text-xs text-algtrix-dim">{new Date(p.criadoEm).toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-algtrix-text">{p.nome ?? ''}</p>
                    <p className="text-xs text-algtrix-dim">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-algtrix-muted">
                    {p.itens.map((i, k) => (
                      <p key={k}>
                        {i.descricao} · {formatarNumero(i.empresas)}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-xs text-algtrix-muted">
                    {p.metodo === 'cartao' ? 'Cartão' : 'Pix'}
                    {p.provedor === 'pix-estatico' ? ' (chave da empresa)' : p.provedor === 'mercadopago' ? ' (Mercado Pago)' : ''}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-algtrix-text">{formatarBRL(p.totalCentavos)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-algtrix-surface2 px-2.5 py-1 text-xs font-medium text-algtrix-text">
                      {ROTULO[p.status] ?? p.status}
                    </span>
                    {p.erro && <p className="mt-1 max-w-[220px] text-xs text-algtrix-risk">{p.erro}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {['aguardando_pagamento', 'cancelado', 'erro'].includes(p.status) && (
                      <button
                        type="button"
                        disabled={ocupado === p.id}
                        onClick={() => confirmar(p.id)}
                        className="whitespace-nowrap rounded-md bg-algtrix-cta px-3 py-2 text-xs font-semibold text-algtrix-ctaText disabled:opacity-50"
                      >
                        {p.status === 'erro' ? 'Gerar novamente' : 'Confirmar pagamento'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
