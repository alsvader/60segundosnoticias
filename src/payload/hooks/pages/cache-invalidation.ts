import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '../../../payload-types.ts'
import { invalidatePage } from '@/lib/cache/invalidate'
import { pageAffectsFooter, pageAffectsNavigation } from '@/lib/cache/references'

/**
 * Invalidates cache tags affected by a Page publish/unpublish/slug/title
 * change. A save that never made the Page published (a draft-only edit on
 * a Page that has never been published) invalidates nothing.
 */
export const invalidatePageCache: CollectionAfterChangeHook<Page> = async ({ doc, previousDoc, req }) => {
  const wasPublished = previousDoc?._status === 'published'
  const isPublished = doc._status === 'published'

  if (!wasPublished && !isPublished) {
    return doc
  }

  const slugChanged = Boolean(previousDoc) && previousDoc.slug !== doc.slug

  invalidatePage({
    keys: [doc.id, doc.slug, slugChanged ? previousDoc.slug : undefined],
    affectsNavigation: slugChanged ? await pageAffectsNavigation(req, doc.id) : false,
    affectsFooter: slugChanged ? await pageAffectsFooter(req, doc.id) : false,
  })

  return doc
}

export const invalidatePageCacheOnDelete: CollectionAfterDeleteHook<Page> = async ({ doc, req }) => {
  if (doc?._status !== 'published') {
    return doc
  }

  invalidatePage({
    keys: [doc.id, doc.slug],
    affectsNavigation: await pageAffectsNavigation(req, doc.id),
    affectsFooter: await pageAffectsFooter(req, doc.id),
  })

  return doc
}
