import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { buildContentSecurityPolicy } from '@/lib/security/headers'

/**
 * Único responsable de `Content-Security-Policy` en rutas públicas -
 * `next.config.ts` deliberadamente ya no la incluye (ver
 * `src/lib/security/headers.ts::buildSecurityHeaders`). Se recalcula en
 * cada petición porque depende de `S3_PUBLIC_URL`, una variable
 * exclusivamente de runtime que `next.config.ts` congelaría en el build
 * de `output: standalone` (openspec/changes/s3-next-image-compatibility,
 * design.md). Mismo patrón de rutas que ya excluye Admin/API de la CSP
 * pública - ningún cambio de comportamiento de enrutamiento, solo de
 * cuándo se evalúa el valor.
 */
export function proxy(_request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy())
  return response
}

export const config = {
  matcher: '/((?!admin|api).*)',
}
