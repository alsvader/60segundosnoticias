import 'server-only'

import { getPayload } from '@/lib/payload/get-payload'
import { canViewDraftRevision } from '@/lib/preview/authorize-draft-content'
import type { Home, Page, Post } from '@/payload-types'

/**
 * Lecturas *conscientes de Draft Mode*, para el render real de las páginas
 * (no para `/api/preview`, que resuelve por id vía
 * `resolve-preview-document.ts`). `draftMode().isEnabled` por sí solo solo
 * hace bypass de la cache (`fetch`/`unstable_cache`) - no le dice a
 * Payload que debe devolver la versión en Draft. Estas funciones sí lo
 * piden explícitamente (`draft: true`) y siguen dejando el `access.read`
 * ya existente de cada Collection como autoridad (`overrideAccess: false`
 * + `user` desde la sesión autenticada) - nunca un segundo boundary de
 * acceso paralelo.
 */

async function currentPreviewUser(headers: Headers) {
  const payload = await getPayload()
  const { user } = await payload.auth({ headers })
  return { payload, user }
}

export async function findDraftPostBySlug(headers: Headers, slug: string): Promise<Post | null> {
  const { payload, user } = await currentPreviewUser(headers)

  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    draft: true,
    overrideAccess: false,
    user,
    depth: 2,
    limit: 1,
  })

  const post = result.docs[0]
  if (!post || !canViewDraftRevision(post, user)) {
    return null
  }

  return post
}

export async function findDraftPageBySlug(headers: Headers, slug: string): Promise<Page | null> {
  const { payload, user } = await currentPreviewUser(headers)

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft: true,
    overrideAccess: false,
    user,
    depth: 1,
    limit: 1,
  })

  return result.docs[0] ?? null
}

export async function findDraftHome(headers: Headers): Promise<Home | null> {
  const { payload, user } = await currentPreviewUser(headers)

  return payload.findGlobal({
    slug: 'home',
    draft: true,
    overrideAccess: false,
    user,
    depth: 2,
  })
}
