import 'server-only'

import { findPublished } from '@/lib/data/public-query'

/**
 * Only public Category query with a real Phase 5 consumer (verifying
 * mapCategoryToCategoryCardData against real data). `getCategoryBySlug()`
 * is deliberately not implemented yet - its consumer is the Category
 * page, Phase 7.
 */
export async function getCategoriesForNavigation() {
  const result = await findPublished({
    collection: 'categories',
    where: { showInNavigation: { equals: true } },
    sort: 'order',
    depth: 0,
  })

  return result.docs
}
