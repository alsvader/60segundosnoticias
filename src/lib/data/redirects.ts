import 'server-only'

import { normalizePath } from '@/lib/url/canonical'
import { getPayload } from '@/lib/payload/get-payload'

export type ActiveRedirect = {
  to: string
  statusCode: '301' | '302'
}

/**
 * Lookup interno acotado para la resolución de Redirects en runtime
 * (Decisión 2 del usuario, aprobada explícitamente): `Redirects.access.read`
 * permanece `isAdmin`-only (sin cambios), y esta función usa
 * `overrideAccess: true` como una excepción explícita y aislada, fuera del
 * boundary público del DAL (`overrideAccess: false` en
 * `src/lib/data/public-query.ts`, sin escape hatch). Nunca expone el
 * documento completo de Redirect, nunca se generaliza a otra consulta, y
 * solo se invoca desde los dos miss paths existentes (`resolveRootSlug()`
 * y la búsqueda de Post por slug) después de que la resolución normal ya
 * falló - ver `specs/redirects/spec.md`.
 */
export async function findActiveRedirectByPath(path: string): Promise<ActiveRedirect | null> {
  const payload = await getPayload()
  const normalized = normalizePath(path)

  const result = await payload.find({
    collection: 'redirects',
    where: { and: [{ from: { equals: normalized } }, { active: { equals: true } }] },
    depth: 0,
    limit: 1,
    select: { to: true, statusCode: true },
    overrideAccess: true,
  })

  const doc = result.docs[0]
  if (!doc) {
    return null
  }

  return { to: doc.to, statusCode: doc.statusCode ?? '301' }
}
