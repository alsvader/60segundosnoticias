import type { CollectionAfterChangeHook } from 'payload'

import type { Post } from '../../../payload-types.ts'
import { createHistoricalRedirect } from '@/lib/redirects/create-historical-redirect'
import { getPostUrl } from '@/lib/url/canonical'

type CategoryRef = Post['primaryCategory']

function extractCategoryId(value: CategoryRef): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return value.id
  return undefined
}

/**
 * Genera un redirect histórico cuando cambia el `slug` y/o `primaryCategory`
 * de un Post que ya estaba publicado (§17.1, AC-REDIR-001/003) - solo para
 * contenido que haya sido públicamente alcanzable (`previousDoc._status
 * === 'published'`). Un cambio simultáneo de slug+categoría produce un
 * único redirect directo (viejo -> final), nunca dos saltos.
 */
export const createPostRedirect: CollectionAfterChangeHook<Post> = async ({ doc, previousDoc, req }) => {
  if (previousDoc?._status !== 'published') {
    return doc
  }

  const previousCategoryId = extractCategoryId(previousDoc.primaryCategory)
  const currentCategoryId = extractCategoryId(doc.primaryCategory)

  const slugChanged = previousDoc.slug !== doc.slug
  const categoryChanged = previousCategoryId !== currentCategoryId

  if (!slugChanged && !categoryChanged) {
    return doc
  }

  if (previousCategoryId === undefined || currentCategoryId === undefined) {
    return doc
  }

  const previousCategory = await req.payload.findByID({
    collection: 'categories',
    id: previousCategoryId,
    depth: 0,
    overrideAccess: true,
  })

  const currentCategory =
    currentCategoryId === previousCategoryId
      ? previousCategory
      : await req.payload.findByID({ collection: 'categories', id: currentCategoryId, depth: 0, overrideAccess: true })

  const oldUrl = getPostUrl(previousCategory.slug, previousDoc.slug)
  const newUrl = getPostUrl(currentCategory.slug, doc.slug)

  if (oldUrl === newUrl) {
    return doc
  }

  await createHistoricalRedirect({ req, from: oldUrl, to: newUrl })

  return doc
}
