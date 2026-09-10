/**
 * The only functions that SHALL construct these canonical paths. No
 * component builds an editorial URL by concatenating strings itself.
 * Implementing the actual `/[category]`, `/[category]/[post]` and
 * `/[slug]` routes is Phase 7 - these helpers exist so that phase (and
 * Navigation/Footer link resolution now) never invents URL construction
 * ad hoc.
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
