import { getCategoryUrl, getPageUrl } from '@/lib/url/canonical'

export type ResolvedLink = {
  href: string
  label: string
  external?: boolean
  openInNewTab?: boolean
}

/**
 * Structural shape shared by Navigation items and Footer links/legalLinks
 * (Payload's "reusable link model", Master Spec §27/§28) - matches both
 * without importing the Navigation/Footer generated types directly.
 */
export type LinkLike = {
  /** Optional to also accept an optional single CTA (HeroNews.cta, Banner.link) that may be left entirely unset. */
  label?: string | null
  type?: ('category' | 'page' | 'external') | null
  category?: { slug?: string | null } | number | null
  page?: { slug?: string | null } | number | null
  url?: string | null
  openInNewTab?: boolean | null
}

// Allowlist, not a denylist: only http(s) resolves, so `javascript:`, `data:`,
// etc. never do (AC-SEC-007) - safer than trying to enumerate unsafe schemes.
const SAFE_EXTERNAL_URL_PATTERN = /^https?:\/\//i

function isSafeExternalUrl(url: string): boolean {
  return SAFE_EXTERNAL_URL_PATTERN.test(url)
}

/**
 * Resolves one Navigation item or Footer link into a renderable link.
 * Returns undefined when the item is misconfigured (e.g. `type:
 * 'category'` with no category selected, or an unsafe external URL) -
 * callers should skip rendering it rather than link to nothing.
 */
export function resolveLink(item: LinkLike | null | undefined): ResolvedLink | undefined {
  // Covers both a genuinely absent item and an optional CTA/link group
  // (HeroNews.cta, Banner.link) left entirely unset by the Admin - a link
  // with no label isn't renderable regardless of type/url.
  if (!item || !item.label) return undefined

  if (item.type === 'category') {
    const category = item.category
    const slug = category && typeof category !== 'number' ? category.slug : undefined
    if (!slug) return undefined
    return { href: getCategoryUrl(slug), label: item.label, openInNewTab: item.openInNewTab ?? undefined }
  }

  if (item.type === 'page') {
    const page = item.page
    const slug = page && typeof page !== 'number' ? page.slug : undefined
    if (!slug) return undefined
    return { href: getPageUrl(slug), label: item.label, openInNewTab: item.openInNewTab ?? undefined }
  }

  if (!item.url || !isSafeExternalUrl(item.url)) {
    return undefined
  }

  return {
    href: item.url,
    label: item.label,
    external: true,
    openInNewTab: item.openInNewTab ?? undefined,
  }
}

/**
 * Resolves a flat list of links (Footer columns[].links[] / legalLinks[])
 * with no children level, dropping any misconfigured entries.
 */
export function resolveLinks(items: LinkLike[] | null | undefined): ResolvedLink[] {
  if (!items) return []
  return items.map((item) => resolveLink(item)).filter((link): link is ResolvedLink => Boolean(link))
}

export type ResolvedNavItem = ResolvedLink & { children?: ResolvedLink[] }

export type NavItemLike = LinkLike & { children?: LinkLike[] | null }

/**
 * Resolves a Navigation `items[]` array (one level of `children[]` -
 * the Master Spec's "Más" submenu, never nested further) into renderable
 * items. Misconfigured items are dropped rather than rendered broken.
 */
export function resolveNavItems(items: NavItemLike[] | null | undefined): ResolvedNavItem[] {
  if (!items) return []

  const results: ResolvedNavItem[] = []

  for (const item of items) {
    const resolved = resolveLink(item)
    if (!resolved) continue

    const children = (item.children ?? [])
      .map((child) => resolveLink(child))
      .filter((link): link is ResolvedLink => Boolean(link))

    results.push({ ...resolved, children: children.length > 0 ? children : undefined })
  }

  return results
}
