import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google'
import { brand } from '@/config/brand'
import { product } from '@/config/product'
import { LeadModalProvider } from '@/components/LeadModalContext'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${product.name} - Encontre as empresas certas para o seu próximo negócio`,
    template: `%s | ${product.name}`,
  },
  description: product.shortDescription,
  openGraph: {
    title: `${product.name} - ${brand.tagline}`,
    description: product.shortDescription,
    url: brand.siteUrl,
    siteName: brand.name,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${product.name} - ${brand.tagline}`,
    description: product.shortDescription,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.shortDescription,
  brand: { '@type': 'Brand', name: brand.name },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body id="top" className="font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LeadModalProvider>{children}</LeadModalProvider>
      </body>
    </html>
  )
}
