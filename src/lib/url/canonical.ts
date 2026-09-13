/**
 * The only functions that SHALL construct these canonical paths. No
 * component builds an editorial URL by concatenating strings itself.
 * Implementing the actual `/[category]`, `/[category]/[post]` and
 * `/[slug]` routes is Phase 7 - these helpers exist so that phase (and
 * Navigation/Footer link resolution now) never invents URL construction
 * ad hoc.
 *
 * Deliberately NOT `server-only`: Fase 8's redirect-creation hooks
 * (`src/payload/hooks/*` /cache-invalidation.ts and the redirect-lifecycle
 * hooks) import the pure path builders below, and those hooks are also
 * loaded by `payload.config.ts` under the standalone Payload CLI
 * (`payload run`/`migrate`/`generate:types`), which runs outside the
 * Next.js bundler - the same reason `src/lib/env/payload.ts` exists as a
 * guard-free duplicate of the app-wide `env` module. `getSiteOrigin()`
 * below reads `process.env` directly for the same reason, instead of the
 * `server-only`-guarded `@/lib/env`.
 */

export function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  const collapsed = withLeadingSlash.replace(/\/+/g, '/')

  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1)
  }

  return collapsed
}

export function getCategoryUrl(categorySlug: string): string {
  return normalizePath(`/${categorySlug}`)
}

export function getPostUrl(primaryCategorySlug: string, postSlug: string): string {
  return normalizePath(`/${primaryCategorySlug}/${postSlug}`)
}

export function getPageUrl(pageSlug: string): string {
  return normalizePath(`/${pageSlug}`)
}

/**
 * The only function that SHALL resolve the absolute site origin (Fase 8,
 * design.md Decisión 1) - metadata/OpenGraph/JSON-LD/sitemap/robots/
 * llms.txt/ShareActions all derive their absolute URLs from this or
 * `getAbsoluteUrl()`, never from `process.env` read independently.
 *
 * Reads `process.env.NEXT_PUBLIC_SITE_URL` directly rather than the
 * `server-only`-guarded `@/lib/env` module (see the file-level comment
 * above for why). Missing/invalid SHALL fail explicitly in production
 * rather than silently resolving public URLs against `localhost`;
 * development keeps a `localhost` fallback so local work doesn't require
 * setting it.
 */
export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL es requerido en producción para construir URLs absolutas (canonical, OpenGraph, JSON-LD, sitemap, robots, llms.txt).',
    )
  }

  return 'http://localhost:3000'
}

/** Combines `getSiteOrigin()` with a canonical path into a single absolute URL. */
export function getAbsoluteUrl(path: string): string {
  return new URL(normalizePath(path), getSiteOrigin()).toString()
}
