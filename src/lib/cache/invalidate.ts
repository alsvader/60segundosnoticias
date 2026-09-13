import { revalidateTag } from 'next/cache'

import { CACHE_TAGS } from './tags'

/**
 * `revalidateTag(tag)` (single-argument) is deprecated in the installed
 * Next.js version (16.3.3) - confirmed against
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`.
 * The two-argument form requires a `profile`: `'max'` gives
 * stale-while-revalidate semantics (the next request after invalidation
 * can still see the old value while a background revalidation runs),
 * which does not match this project's requirement that a Publish leaves
 * content "accesible" immediately (§30.4). Every call here uses
 * `{ expire: 0 }`, which forces the next request for that tag to be a
 * blocking revalidate/cache miss instead of serving stale content.
 *
 * A failure here is caught and logged, never rethrown - an invalidation
 * failure SHALL NOT corrupt or block the Payload mutation that
 * triggered it (AC-ERR-003).
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch (error) {
    console.error(`[cache] revalidateTag failed for tag "${tag}"`, error)
  }
}

/**
 * `getPostBySlug()`/`getCategoryBySlug()`/`getPageBySlug()` are the only
 * DAL queries keyed by a single document's public slug rather than its
 * numeric id - the id isn't known until the query resolves, so it can't
 * be assigned as a Next.js cache `tags` option in advance. Each of these
 * three queries is instead tagged with `post`/`category`/`page` keyed by
 * the *slug argument it already has*, and the Payload hook that
 * invalidates it (which has both the id and the current/previous slug)
 * passes every known key so both the by-slug and any future by-id lookup
 * invalidate together.
 */
function revalidateKeyedTags(tagFn: (key: string | number) => string, keys: Array<string | number | null | undefined>): void {
  for (const key of keys) {
    if (key !== null && key !== undefined) {
      safeRevalidateTag(tagFn(key))
    }
  }
}

type InvalidatePostArgs = {
  /** Every known identifier for this Post: id, current slug, and previous slug when it changed. */
  keys: Array<string | number | null | undefined>
  /** Primary + additional category ids the Post currently (and, on a category change, previously) belongs to. */
  categoryIds: number[]
  /** Whether this Post is referenced by a manual Home relation (HeroNews.mainPost/secondaryPosts, FeaturedPosts.posts, VideoFeature.post) - checked by the caller, never assumed here. */
  affectsHome: boolean
}

/** Post publish/unpublish/update (§40.1, AC-CACHE-002). */
export function invalidatePost({ keys, categoryIds, affectsHome }: InvalidatePostArgs): void {
  revalidateKeyedTags(CACHE_TAGS.post, keys)
  safeRevalidateTag(CACHE_TAGS.posts)
  safeRevalidateTag(CACHE_TAGS.sitemap)
  safeRevalidateTag(CACHE_TAGS.llms)
  for (const categoryId of categoryIds) {
    safeRevalidateTag(CACHE_TAGS.category(categoryId))
  }
  if (affectsHome) {
    safeRevalidateTag(CACHE_TAGS.home)
  }
}

type InvalidateCategoryArgs = {
  /** Every known identifier for this Category: id, current slug, and previous slug when it changed. */
  keys: Array<string | number | null | undefined>
  affectsNavigation: boolean
  /** Posts whose canonical URL changed as a side effect of this Category's slug changing (§40.2). Empty when only non-slug fields changed. */
  affectedPostIds: number[]
}

/** Category field/slug change (§40.2, AC-CACHE-003). */
export function invalidateCategory({ keys, affectsNavigation, affectedPostIds }: InvalidateCategoryArgs): void {
  revalidateKeyedTags(CACHE_TAGS.category, keys)
  safeRevalidateTag(CACHE_TAGS.categories)
  safeRevalidateTag(CACHE_TAGS.sitemap)
  safeRevalidateTag(CACHE_TAGS.llms)
  if (affectsNavigation) {
    safeRevalidateTag(CACHE_TAGS.navigation)
  }
  if (affectedPostIds.length > 0) {
    safeRevalidateTag(CACHE_TAGS.posts)
  }
  for (const postId of affectedPostIds) {
    safeRevalidateTag(CACHE_TAGS.post(postId))
  }
}

type InvalidatePageArgs = {
  /** Every known identifier for this Page: id, current slug, and previous slug when it changed. */
  keys: Array<string | number | null | undefined>
  affectsNavigation: boolean
  affectsFooter: boolean
}

/** Page publish/unpublish/slug/title change. */
export function invalidatePage({ keys, affectsNavigation, affectsFooter }: InvalidatePageArgs): void {
  revalidateKeyedTags(CACHE_TAGS.page, keys)
  safeRevalidateTag(CACHE_TAGS.sitemap)
  safeRevalidateTag(CACHE_TAGS.llms)
  if (affectsNavigation) {
    safeRevalidateTag(CACHE_TAGS.navigation)
  }
  if (affectsFooter) {
    safeRevalidateTag(CACHE_TAGS.footer)
  }
}

/** Home change (§40.3): Home only, never a blanket rebuild. */
export function invalidateHome(): void {
  safeRevalidateTag(CACHE_TAGS.home)
}

/** Navigation change (§40.4, AC-CACHE-005): its own tag only. */
export function invalidateNavigation(): void {
  safeRevalidateTag(CACHE_TAGS.navigation)
}

/** Footer change (§40.4, AC-CACHE-005): its own tag only. */
export function invalidateFooter(): void {
  safeRevalidateTag(CACHE_TAGS.footer)
}

/** ArticleSidebar Global change: its own tag only (same discipline as Navigation/Footer, extended to a Global added after §40 was written). */
export function invalidateArticleSidebar(): void {
  safeRevalidateTag(CACHE_TAGS.articleSidebar)
}

type InvalidateSettingsArgs = {
  /**
   * Whether the changed field(s) are read by `/llms.txt` assembly
   * (`branding.siteName`/`tagline`, `seo.defaultMetaDescription`) -
   * checked by the caller. `sitemap.xml` does not read any SiteSettings
   * field (its URLs come from Categories/Pages/Posts and the env-sourced
   * site origin, Decisión 1), so a SiteSettings change never busts
   * `sitemap` regardless of which field changed.
   */
  affectsLlms: boolean
}

/** SiteSettings change (§40.4, AC-CACHE-005): own tag always, `llms` only when a field it actually reads changed. */
export function invalidateSettings({ affectsLlms }: InvalidateSettingsArgs): void {
  safeRevalidateTag(CACHE_TAGS.settings)
  if (affectsLlms) {
    safeRevalidateTag(CACHE_TAGS.llms)
  }
}
