'use client'

import { useEffect, useRef, useState } from 'react'

interface UseExitIntentOptions {
  /** Não disparar antes deste tempo mínimo na página (ms). */
  minTimeOnPageMs?: number
  /** Desativa completamente o gatilho (ex.: em mobile, por design). */
  disabled?: boolean
}

/**
 * Detecta intenção de saída em desktop (mouse cruzando o topo da
 * janela) sem usar scroll listeners. Dispara no máximo uma vez por
 * sessão. Em mobile, o gatilho fica desabilitado por padrão (a
 * especificação pede que mecanismos invasivos não sejam usados lá).
 */
export function useExitIntent({ minTimeOnPageMs = 8000, disabled = false }: UseExitIntentOptions = {}) {
  const [triggered, setTriggered] = useState(false)
  const enteredAt = useRef(Date.now())
  const alreadyShown = useRef(false)

  useEffect(() => {
    if (disabled) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return // mobile/touch: não ativar

    function handleMouseLeave(event: MouseEvent) {
      if (alreadyShown.current) return
      if (Date.now() - enteredAt.current < minTimeOnPageMs) return
      if (event.clientY > 0) return // só dispara ao sair pelo topo da viewport

      alreadyShown.current = true
      setTriggered(true)
    }

    document.addEventListener('mouseout', handleMouseLeave)
    return () => document.removeEventListener('mouseout', handleMouseLeave)
  }, [disabled, minTimeOnPageMs])

  return { triggered, dismiss: () => setTriggered(false) }
}
