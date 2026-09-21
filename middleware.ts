import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Este projeto não usa o componente <Image> do Next.js nem a API de
 * otimização de imagens (não há imagens remotas no site). Por isso, o
 * endpoint /_next/image é bloqueado proativamente aqui.
 *
 * Motivo: a versão do Next.js usada nesta primeira entrega (14.2.35)
 * está dentro da faixa afetada pela vulnerabilidade crítica de RCE não
 * autenticado em imagens AVIF na API de otimização de imagens
 * (GHSA-2xp9-vwfh-vxw4), corrigida apenas a partir da linha 16.3.x.
 * Como o endpoint nunca é utilizado por este projeto, bloqueá-lo remove
 * a superfície de ataque sem depender de uma migração maior de versão
 * (Next 14 → 16) nesta primeira entrega.
 *
 * Recomenda-se reavaliar esta mitigação ao planejar uma futura
 * atualização para uma versão do Next.js corrigida nativamente.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/_next/image')) {
    return new NextResponse(null, { status: 404 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/_next/image',
}
