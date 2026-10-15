'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { X } from '@phosphor-icons/react/dist/ssr/X'
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { ShieldCheck } from '@phosphor-icons/react/dist/ssr/ShieldCheck'
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash'
import { ShoppingCart } from '@phosphor-icons/react/dist/ssr/ShoppingCart'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr/CircleNotch'
import { QrCode } from '@phosphor-icons/react/dist/ssr/QrCode'
import { CreditCard } from '@phosphor-icons/react/dist/ssr/CreditCard'
import { formatarCnpj } from '@/lib/payments/pix-brcode'
import { COMPETENCIA, PORTES, SECOES, UFS, type PorteCodigo } from '@/lib/catalog'
import {
  contarEmpresas,
  cotar,
  DESCONTOS_CARRINHO,
  formatarBRL,
  formatarNumero,
  normalizarItem,
  precoPorQuantidade,
  nomeCidade,
  type ItemRecorte,
  type MunicipiosPorUf,
  type MunicipiosUf,
} from '@/lib/pricing-engine'
import { useCarrinho } from '@/hooks/useCarrinho'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const TODOS_PORTES = PORTES.map((p) => p.codigo) as PorteCodigo[]

/** Busca (e guarda em memória) as estatísticas por município das UFs pedidas. */
function useMunicipios(ufs: string[]): MunicipiosPorUf {
  const [dados, setDados] = useState<MunicipiosPorUf>({})
  const pedidos = useRef(new Set<string>())
  const chave = Array.from(new Set(ufs)).sort().join(',')
  useEffect(() => {
    for (const uf of chave.split(',').filter(Boolean)) {
      if (pedidos.current.has(uf)) continue
      pedidos.current.add(uf)
      fetch(`/api/municipios/${uf}`)
        .then((r) => (r.ok ? (r.json() as Promise<MunicipiosUf>) : undefined))
        .then((m) => m && setDados((atual) => ({ ...atual, [uf]: m })))
        .catch(() => pedidos.current.delete(uf))
    }
  }, [chave])
  return dados
}

export function ListaBuilder() {
  const [uf, setUf] = useState('SP')
  const [municipio, setMunicipio] = useState<string | null>(null)
  const [secoes, setSecoes] = useState<string[]>([])
  const [portes, setPortes] = useState<PorteCodigo[]>(TODOS_PORTES)
  const [incluirMei, setIncluirMei] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const carrinho = useCarrinho()
  const municipios = useMunicipios([uf, ...carrinho.itens.filter((i) => i.municipio).map((i) => i.uf)])
  const munUf = municipios[uf]
  const munSel = municipio ? munUf?.[municipio] : undefined
  const nomeMunicipio = munSel ? nomeCidade(munSel) : undefined

  const item: ItemRecorte = useMemo(
    () =>
      normalizarItem({
        uf,
        municipio: municipio ?? undefined,
        municipioNome: nomeMunicipio,
        secoes,
        portes,
        incluirMei,
      }),
    [uf, municipio, nomeMunicipio, secoes, portes, incluirMei],
  )
  const carregandoCidade = Boolean(municipio && !munUf)
  const empresas = contarEmpresas(item, munUf)
  const preco = precoPorQuantidade(empresas)
  const portesVazios = portes.length === 0 && !incluirMei
  const cotacao = useMemo(() => cotar(carrinho.itens, municipios), [carrinho.itens, municipios])
  const proximoDesconto = [...DESCONTOS_CARRINHO].reverse().find((d) => d.minItens > cotacao.itens.length)

  function alternarSecao(codigo: string) {
    setSecoes((atual) => (atual.includes(codigo) ? atual.filter((s) => s !== codigo) : [...atual, codigo]))
  }

  function alternarPorte(codigo: PorteCodigo) {
    setPortes((atual) => (atual.includes(codigo) ? atual.filter((p) => p !== codigo) : [...atual, codigo]))
  }

  function adicionar() {
    const r = carrinho.adicionar(item)
    setAviso(
      r === 'adicionado'
        ? 'Recorte adicionado ao carrinho.'
        : r === 'repetido'
          ? 'Esse recorte já está no carrinho.'
          : 'O carrinho atingiu o limite de itens.',
    )
    if (r === 'adicionado') {
      track(AnalyticsEvent.FilterUsed, { uf, municipio: municipio ?? '', secoes: secoes.join(','), empresas, context: 'builder' })
      // Leva o cliente direto ao carrinho e à forma de pagamento (no desktop o carrinho já está visível ao lado).
      if (window.matchMedia('(max-width: 1023px)').matches) {
        window.setTimeout(() => document.getElementById('carrinho')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
      }
    }
    window.setTimeout(() => setAviso(null), 3500)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      {/* Montagem do recorte */}
      <div className="rounded-lg border border-algtrix-border bg-algtrix-surface p-5 sm:p-8">
        <StepTitle n={1}>Escolha a região</StepTitle>
        <p className="mt-1 text-sm text-algtrix-muted">Estado inteiro ou uma cidade específica.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,240px)_1fr]">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-algtrix-dim">Estado</span>
            <select
              value={uf}
              onChange={(e) => {
                setUf(e.target.value)
                setMunicipio(null)
              }}
              className="field"
              aria-label="Estado"
            >
              {UFS.map((u) => (
                <option key={u.sigla} value={u.sigla}>
                  {u.nome} ({u.sigla})
                </option>
              ))}
            </select>
          </label>
          <BuscaCidade
            municipios={munUf}
            selecionado={municipio}
            onSelecionar={setMunicipio}
            filtro={{ secoes, portes, incluirMei, uf }}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
          <StepTitle n={2}>Escolha os segmentos</StepTitle>
          <button
            type="button"
            onClick={() => setSecoes([])}
            className="text-sm font-medium text-algtrix-accent hover:underline"
          >
            {secoes.length ? 'Limpar (todos os segmentos)' : 'Todos os segmentos selecionados'}
          </button>
        </div>
        <p className="mt-1 text-sm text-algtrix-muted">Sem seleção, a lista inclui todos os segmentos.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SECOES.map((s) => {
            const ativo = secoes.includes(s.codigo)
            const qtd = contarEmpresas(
              normalizarItem({ uf, municipio: municipio ?? undefined, secoes: [s.codigo], portes, incluirMei }),
              munUf,
            )
            return (
              <label
                key={s.codigo}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors',
                  ativo
                    ? 'border-algtrix-accent bg-algtrix-accentSoft text-algtrix-text'
                    : 'border-algtrix-border bg-algtrix-bg text-algtrix-muted hover:border-algtrix-borderStrong',
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={() => alternarSecao(s.codigo)}
                    className="h-4 w-4 accent-[var(--algtrix-accent)]"
                  />
                  {s.nome}
                </span>
                <span className="tabular shrink-0 font-mono text-xs text-algtrix-dim">{formatarNumero(qtd)}</span>
              </label>
            )
          })}
        </div>

        <div className="mt-9"><StepTitle n={3}>Porte das empresas</StepTitle></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PORTES.map((p) => (
            <label
              key={p.codigo}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm',
                portes.includes(p.codigo)
                  ? 'border-algtrix-accent bg-algtrix-accentSoft text-algtrix-text'
                  : 'border-algtrix-border bg-algtrix-bg text-algtrix-muted',
              )}
            >
              <input
                type="checkbox"
                checked={portes.includes(p.codigo)}
                onChange={() => alternarPorte(p.codigo)}
                className="h-4 w-4 accent-[var(--algtrix-accent)]"
              />
              {p.nome}
            </label>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-algtrix-border bg-algtrix-bg p-3 text-sm text-algtrix-muted">
          <input
            type="checkbox"
            checked={incluirMei}
            onChange={(e) => setIncluirMei(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--algtrix-accent)]"
          />
          <span>
            <strong className="text-algtrix-text">Incluir MEI</strong> (microempreendedor individual). Por padrão, a
            lista traz apenas empresas com estrutura comercial.
          </span>
        </label>

        {/* Resultado */}
        <div className="mt-8 rounded-lg border-2 border-algtrix-accent bg-algtrix-bg p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tabular font-mono text-3xl font-semibold text-algtrix-text">
                {carregandoCidade ? '...' : formatarNumero(empresas)}
              </p>
              <p className="text-sm text-algtrix-muted">
                empresas ativas em{' '}
                <strong className="text-algtrix-text">
                  {nomeMunicipio ? `${nomeMunicipio} (${uf})` : UFS.find((u) => u.sigla === uf)?.nome}
                </strong>{' '}
                · base atualizada
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-algtrix-text">{empresas ? formatarBRL(preco) : '-'}</p>
              <p className="text-sm text-algtrix-muted">valor do recorte</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!empresas || portesVazios || carregandoCidade}
            onClick={adicionar}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-algtrix-accent px-5 py-3.5 text-[15px] font-semibold text-algtrix-bg transition-colors hover:bg-algtrix-accentHover disabled:opacity-50"
          >
            <ShoppingCart size={18} weight="bold" />
            Adicionar ao carrinho
          </button>
          {aviso && <p className="mt-3 text-center text-sm font-medium text-algtrix-accent">{aviso}</p>}
          <p className="mt-3 text-center text-xs text-algtrix-dim">
            A amostra exibida no site é ilustrativa. Os dados reais são liberados somente após o pagamento.
          </p>
        </div>
      </div>

      {/* Carrinho e pagamento */}
      <aside id="carrinho" className="scroll-mt-24 lg:sticky lg:top-24">
        <Carrinho
          itens={carrinho.itens}
          carregado={carrinho.carregado}
          remover={carrinho.remover}
          cotacao={cotacao}
          proximoDesconto={proximoDesconto}
        />
      </aside>

      {cotacao.itens.length > 0 && (
        <a
          href="#carrinho"
          className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-md bg-algtrix-text px-4 py-3 text-sm font-semibold text-algtrix-bg shadow-card lg:hidden"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart size={18} /> {cotacao.itens.length} {cotacao.itens.length === 1 ? 'recorte' : 'recortes'}
          </span>
          <span>Ver carrinho · {formatarBRL(cotacao.totalCentavos)}</span>
        </a>
      )}
    </div>
  )
}

function Carrinho({
  itens,
  carregado,
  remover,
  cotacao,
  proximoDesconto,
}: {
  itens: ItemRecorte[]
  carregado: boolean
  remover: (i: number) => void
  cotacao: ReturnType<typeof cotar>
  proximoDesconto?: { minItens: number; percentual: number }
}) {
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [aceite, setAceite] = useState(false)
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix')
  const [lojaAtiva, setLojaAtiva] = useState<boolean | null>(null)
  const [loja, setLoja] = useState<{ cartao: boolean; pix: string | null; beneficiario: { nome: string; chave: string } | null } | null>(null)
  const [interesseOk, setInteresseOk] = useState(false)

  useEffect(() => {
    fetch('/api/loja/status', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ vendasAtivas: boolean; cartao: boolean; pix: string | null; beneficiario: { nome: string; chave: string } | null }>)
      .then((d) => {
        setLojaAtiva(d.vendasAtivas)
        setLoja(d)
        if (!d.cartao) setMetodo('pix')
      })
      .catch(() => setLojaAtiva(false))
  }, [])

  async function registrarInteresse(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/interesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome, itens }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Não foi possível registrar agora.')
      setInteresseOk(true)
      track(AnalyticsEvent.LeadCompleted, { origem: 'lista_espera', itens: cotacao.itens.length })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setEnviando(false)
    }
  }
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function pagar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    track(AnalyticsEvent.CheckoutStarted, { itens: cotacao.itens.length, total: cotacao.totalCentavos })
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome, documento, aceite, itens, metodo }),
      })
      const data = (await res.json()) as { checkoutUrl?: string; error?: string }
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error ?? 'Não foi possível iniciar o pagamento.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
      setEnviando(false)
    }
  }

  return (
    <div className="rounded-lg border border-algtrix-border bg-algtrix-bg p-5 shadow-soft sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-algtrix-text">
        <ShoppingCart size={20} /> Seu carrinho
      </h2>

      {!carregado ? null : cotacao.itens.length === 0 ? (
        <p className="mt-4 text-sm text-algtrix-muted">
          Monte um recorte ao lado e adicione ao carrinho. Recortes a partir de {formatarBRL(1990)}.
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-algtrix-border">
            {cotacao.itens.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-algtrix-text">{item.descricao}</p>
                  <p className="text-algtrix-dim">{formatarNumero(item.empresas)} empresas</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap font-semibold text-algtrix-text">{formatarBRL(item.precoCentavos)}</span>
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    className="rounded-md p-1 text-algtrix-dim hover:text-algtrix-risk"
                    aria-label="Remover item"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-1.5 border-t border-algtrix-border pt-3 text-sm">
            <div className="flex justify-between text-algtrix-muted">
              <dt>Subtotal</dt>
              <dd>{formatarBRL(cotacao.subtotalCentavos)}</dd>
            </div>
            {cotacao.descontoPercentual > 0 && (
              <div className="flex justify-between text-algtrix-accent">
                <dt>Desconto de {cotacao.descontoPercentual}% ({cotacao.itens.length} itens)</dt>
                <dd>-{formatarBRL(cotacao.descontoCentavos)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold text-algtrix-text">
              <dt>Total</dt>
              <dd>{formatarBRL(cotacao.totalCentavos)}</dd>
            </div>
          </dl>

          {proximoDesconto && (
            <p className="mt-3 rounded-md bg-algtrix-accentSoft px-3 py-2 text-xs font-medium text-algtrix-text">
              Adicione mais {proximoDesconto.minItens - cotacao.itens.length}{' '}
              {proximoDesconto.minItens - cotacao.itens.length === 1 ? 'recorte' : 'recortes'} e ganhe{' '}
              {proximoDesconto.percentual}% de desconto no total.
            </p>
          )}

          {lojaAtiva === false ? (
            interesseOk ? (
              <p className="mt-5 rounded-md bg-algtrix-accentSoft p-4 text-sm text-algtrix-text">
                Pronto. Avisaremos {email} assim que as compras online forem liberadas, com o valor deste carrinho.
              </p>
            ) : (
              <form onSubmit={registrarInteresse} className="mt-5 space-y-3">
                <p className="rounded-md border border-algtrix-amber/40 bg-algtrix-amber/10 p-3 text-sm text-algtrix-text">
                  As compras online estão em fase final de liberação. Deixe seu e-mail e avisaremos assim que puder
                  pagar com Pix ou cartão.
                </p>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="field"
                />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome (opcional)"
                  className="field"
                />
                {erro && <p className="text-sm font-medium text-algtrix-risk">{erro}</p>}
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-algtrix-accent px-5 py-3.5 text-[15px] font-semibold text-algtrix-bg hover:bg-algtrix-accentHover disabled:opacity-50"
                >
                  {enviando ? <CircleNotch size={18} className="animate-spin" /> : <CheckCircle size={18} weight="bold" />}
                  Quero ser avisado
                </button>
              </form>
            )
          ) : (
          <form onSubmit={pagar} className="mt-5 space-y-3">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-algtrix-text">Forma de pagamento</legend>
              <div className="grid gap-2">
                {(
                  [
                    { id: 'pix', titulo: 'Pix', detalhe: 'QR Code na tela. Liberação após a confirmação.', Icone: QrCode },
                    { id: 'cartao', titulo: 'Cartão de crédito', detalhe: 'Em até 12x, ambiente seguro do Mercado Pago.', Icone: CreditCard },
                  ] as const
                )
                  .filter((m) => m.id !== 'cartao' || loja?.cartao !== false)
                  .map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-md border p-3.5 text-sm transition-colors',
                        metodo === m.id
                          ? 'border-algtrix-accent bg-algtrix-accentSoft ring-1 ring-algtrix-accent'
                          : 'border-algtrix-borderStrong bg-algtrix-bg hover:border-algtrix-accent/60',
                      )}
                    >
                      <input
                        type="radio"
                        name="metodo"
                        value={m.id}
                        checked={metodo === m.id}
                        onChange={() => setMetodo(m.id)}
                        className="sr-only"
                      />
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-algtrix-bg text-algtrix-accent ring-1 ring-algtrix-border">
                        <m.Icone size={18} weight="duotone" />
                      </span>
                      <span>
                        <span className="block font-semibold text-algtrix-text">{m.titulo}</span>
                        <span className="mt-0.5 block text-xs text-algtrix-muted">{m.detalhe}</span>
                      </span>
                    </label>
                  ))}
              </div>
              {metodo === 'pix' && loja?.beneficiario && (
                <p className="mt-2 text-xs text-algtrix-dim">
                  Pix para {loja.beneficiario.nome} · CNPJ {formatarCnpj(loja.beneficiario.chave)}
                </p>
              )}
            </fieldset>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail (receberá o link de download)"
              className="field"
            />
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome (opcional)"
              className="field"
            />
            <input
              type="text"
              inputMode="numeric"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="CPF ou CNPJ (opcional, para nota fiscal)"
              className="field"
            />
            <label className="flex items-start gap-2 text-xs text-algtrix-muted">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 accent-[var(--algtrix-accent)]"
              />
              <span>
                Li e aceito os <a href={brand.legalLinks.terms} className="underline">termos de uso</a> (licença de
                uso interno, não transferível) e a{' '}
                <a href={brand.legalLinks.privacyPolicy} className="underline">política de privacidade</a>.
              </span>
            </label>
            {erro && <p className="text-sm font-medium text-algtrix-risk">{erro}</p>}
            <button
              type="submit"
              disabled={enviando || !aceite}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-algtrix-accent px-5 py-3.5 text-[15px] font-semibold text-algtrix-bg hover:bg-algtrix-accentHover disabled:opacity-50"
            >
              {enviando ? <CircleNotch size={18} className="animate-spin" /> : <CheckCircle size={18} weight="bold" />}
              {metodo === 'pix' ? `Gerar Pix de ${formatarBRL(cotacao.totalCentavos)}` : `Pagar ${formatarBRL(cotacao.totalCentavos)} com cartão`}
            </button>
          </form>
          )}
          <ul className="mt-4 space-y-1.5 text-xs text-algtrix-muted">
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-algtrix-accent" /> {loja?.pix === 'estatico' && !loja?.cartao ? 'Pix direto para a conta da empresa' : 'Pagamento processado pelo Mercado Pago'}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-algtrix-accent" /> Download liberado automaticamente após a confirmação
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-algtrix-accent" /> Arquivos em CSV, Excel e PDF, com a data da base
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

function semAcento(t: string) {
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

/** Campo de busca de cidade com sugestões e quantidade de empresas de cada uma. */
function BuscaCidade({
  municipios,
  selecionado,
  onSelecionar,
  filtro,
}: {
  municipios: MunicipiosUf | undefined
  selecionado: string | null
  onSelecionar: (codigo: string | null) => void
  filtro: Pick<ItemRecorte, 'uf' | 'secoes' | 'portes' | 'incluirMei'>
}) {
  const [texto, setTexto] = useState('')
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  const lista = useMemo(() => {
    if (!municipios) return []
    const termo = semAcento(texto.trim())
    return Object.entries(municipios)
      .map(([codigo, m]) => ({
        codigo,
        nome: nomeCidade(m),
        busca: semAcento(m.n),
        qtd: contarEmpresas(normalizarItem({ ...filtro, municipio: codigo }), municipios),
      }))
      .filter((m) => !termo || m.busca.includes(termo))
      .sort((a, b) => {
        if (termo) {
          const ai = a.busca.startsWith(termo) ? 0 : 1
          const bi = b.busca.startsWith(termo) ? 0 : 1
          if (ai !== bi) return ai - bi
        }
        return b.qtd - a.qtd
      })
      .slice(0, 8)
  }, [municipios, texto, filtro])

  function escolher(codigo: string) {
    onSelecionar(codigo)
    setTexto('')
    setAberto(false)
  }

  const munSelecionado = selecionado ? municipios?.[selecionado] : undefined
  const nomeSelecionado = munSelecionado ? nomeCidade(munSelecionado) : undefined

  return (
    <div className="flex flex-col gap-1" ref={caixa}>
      <span className="text-xs font-medium text-algtrix-dim">Cidade (opcional)</span>
      {selecionado ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-algtrix-accent bg-algtrix-accentSoft px-3 py-3 text-[15px] text-algtrix-text">
          <span className="flex items-center gap-2">
            <MapPin size={16} weight="fill" className="text-algtrix-accent" />
            {nomeSelecionado ?? 'Carregando...'}
          </span>
          <button
            type="button"
            onClick={() => onSelecionar(null)}
            className="rounded p-0.5 text-algtrix-dim hover:text-algtrix-text"
            aria-label="Remover cidade e usar o estado inteiro"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-algtrix-dim" />
          <input
            type="text"
            value={texto}
            placeholder={municipios ? 'Todo o estado. Digite para buscar uma cidade' : 'Carregando cidades...'}
            disabled={!municipios}
            onFocus={() => setAberto(true)}
            onChange={(e) => {
              setTexto(e.target.value)
              setAberto(true)
              setAtivo(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setAtivo((a) => Math.min(a + 1, lista.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setAtivo((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter' && lista[ativo]) {
                e.preventDefault()
                escolher(lista[ativo].codigo)
              } else if (e.key === 'Escape') setAberto(false)
            }}
            role="combobox"
            aria-expanded={aberto}
            aria-controls="lista-cidades"
            aria-autocomplete="list"
            className="field pl-9"
          />
          {aberto && lista.length > 0 && (
            <ul
              id="lista-cidades"
              role="listbox"
              className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border border-algtrix-border bg-algtrix-bg py-1 shadow-card"
            >
              {!texto && (
                <li className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-algtrix-dim">
                  Cidades com mais empresas
                </li>
              )}
              {lista.map((m, i) => (
                <li
                  key={m.codigo}
                  role="option"
                  aria-selected={i === ativo}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    escolher(m.codigo)
                  }}
                  onMouseEnter={() => setAtivo(i)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm',
                    i === ativo ? 'bg-algtrix-accentSoft text-algtrix-text' : 'text-algtrix-muted',
                  )}
                >
                  <span>{m.nome}</span>
                  <span className="tabular shrink-0 font-mono text-xs text-algtrix-dim">{formatarNumero(m.qtd)}</span>
                </li>
              ))}
            </ul>
          )}
          {aberto && texto && lista.length === 0 && (
            <p className="absolute z-20 mt-1 w-full rounded-md border border-algtrix-border bg-algtrix-bg px-3 py-2 text-sm text-algtrix-muted shadow-card">
              Nenhuma cidade encontrada neste estado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold text-algtrix-text">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-algtrix-text font-mono text-xs font-semibold text-white">
        {n}
      </span>
      {children}
    </h2>
  )
}
