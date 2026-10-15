'use client'

import { useEffect, useState } from 'react'
import { List } from '@phosphor-icons/react/dist/ssr/List'
import { X } from '@phosphor-icons/react/dist/ssr/X'
import { Logo } from '@/components/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#demonstracao', label: 'Demonstração' },
  { href: '/#dados', label: 'Dados' },
  { href: '/#oferta', label: 'Preços' },
  { href: '/#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-sentinel')
    if (!target) {
      setScrolled(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setScrolled(!entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200',
        scrolled || aberto
          ? 'border-algtrix-border bg-white/90 shadow-[0_1px_12px_rgba(24,18,43,0.05)] backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-pageWide items-center justify-between gap-6 px-5 sm:px-8">
        <a href="/" className="flex items-center" aria-label="Página inicial">
          <Logo />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-algtrix-muted transition-colors hover:text-algtrix-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href="/montar-lista"
            size="md"
            className="hidden sm:inline-flex"
            onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'navbar' })}
          >
            Montar minha lista
          </ButtonLink>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-algtrix-text lg:hidden"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
          >
            {aberto ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="border-t border-algtrix-border bg-white px-5 py-4 lg:hidden" aria-label="Principal (celular)">
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setAberto(false)}
                  className="block py-3 text-[15px] font-medium text-algtrix-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href="/montar-lista" size="lg" className="mt-3 w-full">
            Montar minha lista
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}
