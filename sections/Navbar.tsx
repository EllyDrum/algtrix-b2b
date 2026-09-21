'use client'

import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const LINKS = [
  { href: '#produto', label: 'Produto' },
  { href: '#demonstracao', label: 'Como funciona' },
  { href: '#dados', label: 'Dados' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-sentinel')
    if (!target) return
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
        'sticky top-0 z-40 h-[72px] border-b transition-[background-color,border-color,backdrop-filter] duration-[250ms]',
        scrolled
          ? 'border-algtrix-border bg-algtrix-bg/85 backdrop-blur-md shadow-[0_1px_12px_rgba(24,18,43,0.06)]'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-pageWide items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="flex items-center">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-algtrix-muted transition-colors hover:text-algtrix-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ButtonLink
          href="#oferta"
          size="md"
          onClick={() => track(AnalyticsEvent.HeroCta, { placement: 'navbar' })}
        >
          Quero acessar a base
        </ButtonLink>
      </div>
    </header>
  )
}
