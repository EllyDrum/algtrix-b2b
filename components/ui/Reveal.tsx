'use client'

import { motion, useReducedMotion } from 'motion/react'

/**
 * Wrapper de scroll-reveal leve (whileInView), sem ScrollTrigger.
 * Usado para dar entrada suave a blocos de conteúdo. A justificativa da
 * animação é sempre "hierarquia": guiar o olhar para o próximo bloco
 * relevante do funil.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
