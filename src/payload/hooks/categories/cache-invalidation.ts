import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import type { Category } from '../../../payload-types.ts'
import { invalidateCategory } from '@/lib/cache/invalidate'
import { categoryAffectsNavigation } from '@/lib/cache/references'

/**
 * Posts publicados cuya `primaryCategory` es esta Category - solo se
 * consulta cuando el `slug` de la Category cambió, ya que es el único
 * caso en el que la URL canónica de esos Posts se ve afectada (§40.2,
 * AC-CACHE-003).
 */
async function findAffectedPublishedPostIds(req: PayloadRequest, categoryId: number): Promise<number[]> {
  const result = await req.payload.find({
    collection: 'posts',
    where: { and: [{ primaryCategory: { equals: categoryId } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })

  return result.docs.map((doc) => doc.id)
}

export const invalidateCategoryCache: CollectionAfterChangeHook<Category> = async ({ doc, previousDoc, req }) => {
  const slugChanged = Boolean(previousDoc) && previousDoc.slug !== doc.slug

  const affectedPostIds = slugChanged ? await findAffectedPublishedPostIds(req, doc.id) : []
  const affectsNavigation = slugChanged ? await categoryAffectsNavigation(req, doc.id) : false

  invalidateCategory({
    keys: [doc.id, doc.slug, slugChanged ? previousDoc.slug : undefined],
    affectsNavigation,
    affectedPostIds,
  })

  return doc
}

export const invalidateCategoryCacheOnDelete: CollectionAfterDeleteHook<Category> = async ({ doc, req }) => {
  invalidateCategory({
    keys: [doc.id, doc.slug],
    affectsNavigation: await categoryAffectsNavigation(req, doc.id),
    affectedPostIds: [],
  })

  return doc
}
