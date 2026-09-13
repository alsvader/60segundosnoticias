/**
 * Conceptual cache tags from Master Spec §40, extended with the two new
 * Fase 8 outputs (`sitemap`, `llms`). Every public DAL query wraps in
 * `unstable_cache` tagged from this module - never an ad hoc string
 * elsewhere - so the invalidation matrix in
 * `specs/cache-revalidation/spec.md` stays the single source of truth.
 */
export const CACHE_TAGS = {
  post: (id: number | string) => `post:${id}`,
  category: (id: number | string) => `category:${id}`,
  page: (id: number | string) => `page:${id}`,
  posts: 'posts',
  /** List-level tag for queries over *all* Categories (nav-visible subset or otherwise) - not named in the Master Spec's conceptual tags, added for the same reason `posts` exists: a query that isn't scoped to one category id still needs an invalidation target. */
  categories: 'categories',
  home: 'home',
  navigation: 'navigation',
  footer: 'footer',
  settings: 'settings',
  /** The `ArticleSidebar` Global (Phase 7) - not named in the Master Spec's §40 conceptual tags (added after that section was written), but it is administrable content and needs the same invalidation discipline as Navigation/Footer/Settings. */
  articleSidebar: 'article-sidebar',
  sitemap: 'sitemap',
  llms: 'llms',
} as const
