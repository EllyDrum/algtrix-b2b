'use client'

import { useCallback, useEffect, useState } from 'react'
import { chaveItem, MAX_ITENS_CARRINHO, normalizarItem, type ItemRecorte } from '@/lib/pricing-engine'

const CHAVE = 'algtrix-carrinho-v1'

function ler(): ItemRecorte[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    const lista = bruto ? (JSON.parse(bruto) as ItemRecorte[]) : []
    return Array.isArray(lista) ? lista.map(normalizarItem) : []
  } catch {
    return []
  }
}

function gravar(itens: ItemRecorte[]) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens))
  } catch {
    // armazenamento indisponível (modo privado): o carrinho vale só nesta visita
  }
}

/** Carrinho de recortes guardado no navegador do visitante. */
export function useCarrinho() {
  const [itens, setItens] = useState<ItemRecorte[]>([])
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    setItens(ler())
    setCarregado(true)
  }, [])

  const atualizar = useCallback((proximo: ItemRecorte[]) => {
    setItens(proximo)
    gravar(proximo)
  }, [])

  const adicionar = useCallback(
    (item: ItemRecorte): 'adicionado' | 'repetido' | 'cheio' => {
      const novo = normalizarItem(item)
      if (itens.some((i) => chaveItem(i) === chaveItem(novo))) return 'repetido'
      if (itens.length >= MAX_ITENS_CARRINHO) return 'cheio'
      atualizar([...itens, novo])
      return 'adicionado'
    },
    [itens, atualizar],
  )

  const remover = useCallback((indice: number) => atualizar(itens.filter((_, i) => i !== indice)), [itens, atualizar])
  const limpar = useCallback(() => atualizar([]), [atualizar])

  return { itens, carregado, adicionar, remover, limpar }
}
