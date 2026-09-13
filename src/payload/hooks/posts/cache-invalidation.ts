import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Post } from '../../../payload-types.ts'
import { invalidatePost } from '@/lib/cache/invalidate'
import { postAffectsHome } from '@/lib/cache/references'

type CategoryRef = number | { id: number } | null | undefined

function extractCategoryId(value: CategoryRef): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) return value.id
  return undefined
}

function collectCategoryIds(doc: Pick<Partial<Post>, 'primaryCategory' | 'additionalCategories'>): number[] {
  const ids = new Set<number>()

  const primary = extractCategoryId(doc.primaryCategory as CategoryRef)
  if (primary !== undefined) ids.add(primary)

  for (const category of doc.additionalCategories ?? []) {
    const id = extractCategoryId(category as CategoryRef)
    if (id !== undefined) ids.add(id)
  }

  return [...ids]
}

/**
 * Invalidates cache tags affected by a Post publish/unpublish/update
 * (§40.1, AC-CACHE-002). A save that never made the Post published (a
 * draft-only edit on a Post that has never been published) invalidates
 * nothing - the public DAL only ever reads `_status: 'published'`
 * documents, so nothing public changed.
 */
export const invalidatePostCache: CollectionAfterChangeHook<Post> = async ({ doc, previousDoc, req }) => {
  const wasPublished = previousDoc?._status === 'published'
  const isPublished = doc._status === 'published'

  if (!wasPublished && !isPublished) {
    return doc
  }

  const categoryIds = new Set<number>([
    ...collectCategoryIds(doc),
    ...(previousDoc ? collectCategoryIds(previousDoc) : []),
  ])

  const affectsHome = await postAffectsHome(req, doc.id)

  invalidatePost({
    keys: [doc.id, doc.slug, previousDoc && previousDoc.slug !== doc.slug ? previousDoc.slug : undefined],
    categoryIds: [...categoryIds],
    affectsHome,
  })

  return doc
}

export const invalidatePostCacheOnDelete: CollectionAfterDeleteHook<Post> = async ({ doc, req }) => {
  if (doc?._status !== 'published') {
    return doc
  }

  const affectsHome = await postAffectsHome(req, doc.id)

  invalidatePost({
    keys: [doc.id, doc.slug],
    categoryIds: collectCategoryIds(doc),
    affectsHome,
  })

  return doc
}
