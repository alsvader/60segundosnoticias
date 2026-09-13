import 'server-only'

import { getPayload } from '@/lib/payload/get-payload'
import { canViewDraftRevision } from '@/lib/preview/authorize-draft-content'
import type { Home, Page, Post } from '@/payload-types'

export type ResolvedPreviewDocument =
  | { type: 'post'; doc: Post }
  | { type: 'page'; doc: Page }
  | { type: 'home'; doc: Home }
  | { type: 'not-found' }

const ALLOWED_PREVIEW_COLLECTIONS = new Set(['posts', 'pages', 'home'])

/**
 * Función de resolución de documento de preview explícitamente separada
 * (`public-query.ts`'s propio docstring ya anticipaba esto: "Un futuro
 * acceso confiable de preview/admin (Fase 8) SHALL usar una función
 * distinta y explícitamente nombrada"). Autentica al usuario actual desde
 * las cookies de la solicitud (`payload.auth()`) y deja que el `access.read`
 * YA EXISTENTE de cada Collection decida qué puede ver ese usuario -
 * `overrideAccess: false` siempre, nunca `true`. Categories quedan fuera
 * deliberadamente (`ALLOWED_PREVIEW_COLLECTIONS`): no tienen `versions`, no
 * hay nada que previsualizar.
 *
 * Para Posts, `canViewDraftRevision()` agrega una verificación explícita
 * de defensa en profundidad sobre el resultado - ver su propio docstring.
 */
export async function resolvePreviewDocument(
  headers: Headers,
  collectionParam: string | null,
  idParam: string | null,
): Promise<ResolvedPreviewDocument> {
  if (!collectionParam || !ALLOWED_PREVIEW_COLLECTIONS.has(collectionParam)) {
    return { type: 'not-found' }
  }

  const payload = await getPayload()
  const { user } = await payload.auth({ headers })

  if (collectionParam === 'home') {
    const doc = await payload.findGlobal({
      slug: 'home',
      draft: true,
      overrideAccess: false,
      user,
      depth: 2,
    })

    return doc ? { type: 'home', doc } : { type: 'not-found' }
  }

  if (!idParam) {
    return { type: 'not-found' }
  }

  if (collectionParam === 'posts') {
    const doc = await payload.findByID({
      collection: 'posts',
      id: idParam,
      draft: true,
      overrideAccess: false,
      user,
      depth: 2,
      disableErrors: true,
    })

    if (!doc || !canViewDraftRevision(doc, user)) {
      return { type: 'not-found' }
    }

    return { type: 'post', doc }
  }

  const doc = await payload.findByID({
    collection: 'pages',
    id: idParam,
    draft: true,
    overrideAccess: false,
    user,
    depth: 1,
    disableErrors: true,
  })

  return doc ? { type: 'page', doc } : { type: 'not-found' }
}
