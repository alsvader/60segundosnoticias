import 'server-only'

import type { Category, Page } from '@/payload-types'
import { getCategoryBySlug } from '@/lib/data/categories'
import { getPageBySlug } from '@/lib/data/pages'
import { findActiveRedirectByPath } from '@/lib/data/redirects'
import { findDraftPageBySlug } from '@/lib/preview/draft-documents'

export type ResolvedRootSlug =
  | { type: 'category'; category: Category }
  | { type: 'page'; page: Page }
  | { type: 'redirect'; to: string; statusCode: '301' | '302' }
  | { type: 'not-found' }

type ResolveRootSlugOptions = {
  /**
   * Cuando Draft Mode está habilitado, se pasan los `headers` de la
   * solicitud para resolver la Page vía `findDraftPageBySlug()` (con
   * `draft: true`, autorización delegada al `access.read` de Pages) en vez
   * del lookup público - Draft Mode por sí solo no le dice a Payload que
   * debe devolver la versión en Draft. Categories no tienen `versions`, así
   * que nunca cambian de comportamiento aquí.
   */
  draftHeaders?: Headers
}

/**
 * Root `/<slug>` resolver (Phase 7, design.md Decision 1; Redirects lookup
 * added Fase 8): Category first (always public, no draft filtering), then
 * a Page (published, or Draft-aware when `draftHeaders` is passed), then -
 * only once both have already missed - a `Redirects` lookup (§32.2's own
 * ordering: "Redirect? -> yes/no -> 404"). A currently valid Category/Page
 * is never eclipsed by a historical redirect, because the lookup only
 * runs after both misses. Sequential, not `Promise.all` - the namespace is
 * already mutually exclusive (`slug-namespace-integrity`, Phase 2), so at
 * most one of the two calls ever resolves and the extra round trips only
 * happen on the miss path.
 */
export async function resolveRootSlug(slug: string, options?: ResolveRootSlugOptions): Promise<ResolvedRootSlug> {
  const category = await getCategoryBySlug({ slug })
  if (category) {
    return { type: 'category', category }
  }

  const page = options?.draftHeaders ? await findDraftPageBySlug(options.draftHeaders, slug) : await getPageBySlug({ slug })
  if (page) {
    return { type: 'page', page }
  }

  const redirect = await findActiveRedirectByPath(`/${slug}`)
  if (redirect) {
    return { type: 'redirect', to: redirect.to, statusCode: redirect.statusCode }
  }

  return { type: 'not-found' }
}
