import type { CollectionAfterChangeHook } from 'payload'

import type { Category } from '../../../payload-types.ts'
import { createHistoricalRedirect } from '@/lib/redirects/create-historical-redirect'
import { getCategoryUrl, getPostUrl } from '@/lib/url/canonical'

/**
 * Genera un redirect histórico para la URL de la propia Category cuando
 * cambia su `slug`, y cascadea un redirect por cada Post publicado cuya
 * `primaryCategory` es esa Category (§30.10, AC-REDIR-002) - Categories no
 * tienen `_status`, así que cualquier cambio de slug ya es un cambio
 * público. Secuencial (no `Promise.all`): cada llamada a
 * `createHistoricalRedirect` lee y escribe la misma Collection `Redirects`.
 */
export const createCategoryRedirect: CollectionAfterChangeHook<Category> = async ({ doc, previousDoc, req }) => {
  if (!previousDoc || previousDoc.slug === doc.slug) {
    return doc
  }

  await createHistoricalRedirect({
    req,
    from: getCategoryUrl(previousDoc.slug),
    to: getCategoryUrl(doc.slug),
  })

  const affectedPosts = await req.payload.find({
    collection: 'posts',
    where: { and: [{ primaryCategory: { equals: doc.id } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })

  for (const post of affectedPosts.docs) {
    await createHistoricalRedirect({
      req,
      from: getPostUrl(previousDoc.slug, post.slug),
      to: getPostUrl(doc.slug, post.slug),
    })
  }

  return doc
}
