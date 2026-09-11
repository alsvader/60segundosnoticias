import 'server-only'

import { findPublished } from '@/lib/data/public-query'

export async function getCategoriesForNavigation() {
  const result = await findPublished({
    collection: 'categories',
    where: { showInNavigation: { equals: true } },
    sort: 'order',
    depth: 0,
  })

  return result.docs
}

/**
 * Every Category, regardless of `showInNavigation` — for consumers that
 * enumerate all categories (e.g. the Article sidebar's "newest per
 * category" mode), not just the nav-visible subset.
 */
export async function getAllCategories() {
  const result = await findPublished({
    collection: 'categories',
    sort: 'order',
    depth: 0,
  })

  return result.docs
}

type GetCategoryBySlugArgs = {
  slug: string
}

/**
 * Categories have no draft/publish workflow (`read: () => true`, always
 * public) - `findPublished()` is still used for the shared
 * `overrideAccess: false` boundary, not because Categories need a
 * `_status` filter.
 */
export async function getCategoryBySlug({ slug }: GetCategoryBySlugArgs) {
  const result = await findPublished({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return result.docs[0] ?? null
}
