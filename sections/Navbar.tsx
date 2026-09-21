'use client'

import { useEffect, useState } from 'react'
import { brand } from '@/config/brand'
import { product } from '@/config/product'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { AnalyticsEvent } from '@/config/analytics'

const LINKS = [
  { href: '#produto', label: 'Produto' },
  { href: '#demonstracao', label: 'Como funciona' },
  { href: '#oferta', label: 'Preço' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-sentinel')
    if (!target) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setScrolled(!entry.isIntersecting)
    }, { threshold: 0 })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-[68px] border-b transition-colors duration-200',
        scrolled ? 'border-border bg-white/95 backdrop-blur' : 'border-transparent bg-white/0',
      )}
    >
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="text-[15px] font-bold tracking-tight text-brand-primary">{brand.name}</span>
          <span className="rounded-full bg-brand-primary/8 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
            {product.name}
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-ink-secondary hover:text-ink-primary">
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
