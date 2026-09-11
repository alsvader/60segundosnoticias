import 'server-only'

import type { Category, Page } from '@/payload-types'
import { getCategoryBySlug } from '@/lib/data/categories'
import { getPageBySlug } from '@/lib/data/pages'

export type ResolvedRootSlug =
  | { type: 'category'; category: Category }
  | { type: 'page'; page: Page }
  | { type: 'not-found' }

/**
 * Root `/<slug>` resolver (Phase 7, design.md Decision 1): Category first
 * (always public, no draft filtering), then a published Page. Sequential,
 * not `Promise.all` - the namespace is already mutually exclusive
 * (`slug-namespace-integrity`, Phase 2), so at most one of the two calls
 * ever resolves and the extra round trip only happens on the miss path.
 */
export async function resolveRootSlug(slug: string): Promise<ResolvedRootSlug> {
  const category = await getCategoryBySlug({ slug })
  if (category) {
    return { type: 'category', category }
  }

  const page = await getPageBySlug({ slug })
  if (page) {
    return { type: 'page', page }
  }

  return { type: 'not-found' }
}
