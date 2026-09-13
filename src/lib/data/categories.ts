import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findPublished } from '@/lib/data/public-query'

export async function getCategoriesForNavigation() {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'categories',
        where: { showInNavigation: { equals: true } },
        sort: 'order',
        depth: 0,
      })

      return result.docs
    },
    ['getCategoriesForNavigation'],
    { tags: [CACHE_TAGS.categories] },
  )()
}

/**
 * Every Category, regardless of `showInNavigation` — for consumers that
 * enumerate all categories (e.g. the Article sidebar's "newest per
 * category" mode), not just the nav-visible subset.
 */
export async function getAllCategories() {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'categories',
        sort: 'order',
        depth: 0,
      })

      return result.docs
    },
    ['getAllCategories'],
    { tags: [CACHE_TAGS.categories] },
  )()
}

type GetCategoryBySlugArgs = {
  slug: string
}

/**
 * Categories have no draft/publish workflow (`read: () => true`, always
 * public) - `findPublished()` is still used for the shared
 * `overrideAccess: false` boundary, not because Categories need a
 * `_status` filter.
 *
 * Fase 8: cacheado con `unstable_cache`, tag `category:{slug}` - el `id`
 * real no se conoce hasta que la consulta resuelve, así que no puede ser
 * un tag de antemano; `invalidateCategory()` invalida por `id` y por
 * `slug` a la vez.
 */
export async function getCategoryBySlug({ slug }: GetCategoryBySlugArgs) {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'categories',
        depth: 0,
        limit: 1,
        where: { slug: { equals: slug } },
      })

      return result.docs[0] ?? null
    },
    ['getCategoryBySlug', slug],
    { tags: [CACHE_TAGS.category(slug)] },
  )()
}
