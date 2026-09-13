import type { PayloadRequest } from 'payload'

/**
 * Cheap "is this document referenced from a place whose cached rendering
 * would go stale" checks, used by the invalidation hooks so a Post/Page
 * edit only busts Home/Navigation/Footer's own cache tag when it actually
 * embeds data from that document - never unconditionally. Reads via
 * `req.payload` with `overrideAccess: true`: this is internal
 * cache-bookkeeping inside a trusted Payload hook, never data returned to
 * a client, so it does not touch the public DAL boundary
 * (`overrideAccess: false`) at all.
 */

type LinkLike = {
  type?: string | null
  category?: number | { id: number } | null
  page?: number | { id: number } | null
  children?: LinkLike[] | null
}

function extractId(value: number | { id: number } | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) return value.id
  return undefined
}

function linksReferenceCategory(items: LinkLike[] | null | undefined, categoryId: number): boolean {
  if (!items) return false
  return items.some(
    (item) => (item.type === 'category' && extractId(item.category) === categoryId) || linksReferenceCategory(item.children, categoryId),
  )
}

function linksReferencePage(items: LinkLike[] | null | undefined, pageId: number): boolean {
  if (!items) return false
  return items.some((item) => (item.type === 'page' && extractId(item.page) === pageId) || linksReferencePage(item.children, pageId))
}

/** Only a Category's `slug` feeds Navigation's rendered href (`resolveLink()` -> `getCategoryUrl()`) - other field changes never need this check. */
export async function categoryAffectsNavigation(req: PayloadRequest, categoryId: number): Promise<boolean> {
  const navigation = await req.payload.findGlobal({ slug: 'navigation', depth: 0, overrideAccess: true })
  return linksReferenceCategory(navigation?.items as LinkLike[] | undefined, categoryId)
}

/** Only a Page's `slug` feeds Navigation's rendered href - same reasoning as `categoryAffectsNavigation`. */
export async function pageAffectsNavigation(req: PayloadRequest, pageId: number): Promise<boolean> {
  const navigation = await req.payload.findGlobal({ slug: 'navigation', depth: 0, overrideAccess: true })
  return linksReferencePage(navigation?.items as LinkLike[] | undefined, pageId)
}

export async function pageAffectsFooter(req: PayloadRequest, pageId: number): Promise<boolean> {
  const footer = await req.payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true })
  const columns = (footer?.columns ?? []) as Array<{ links?: LinkLike[] | null }>
  const inColumns = columns.some((column) => linksReferencePage(column.links, pageId))
  const inLegal = linksReferencePage(footer?.legalLinks as LinkLike[] | undefined, pageId)
  return inColumns || inLegal
}

type HomeBlock = Record<string, unknown> & { blockType?: string }

function blockReferencesPost(block: HomeBlock, postId: number): boolean {
  if (block.blockType === 'heroNews') {
    const main = extractId(block.mainPost as number | { id: number } | null)
    const secondary = (block.secondaryPosts as Array<number | { id: number }> | null | undefined) ?? []
    return main === postId || secondary.some((post) => extractId(post) === postId)
  }
  if (block.blockType === 'featuredPosts') {
    const posts = (block.posts as Array<number | { id: number }> | null | undefined) ?? []
    return posts.some((post) => extractId(post) === postId)
  }
  if (block.blockType === 'videoFeature') {
    return extractId(block.post as number | { id: number } | null) === postId
  }
  return false
}

/** Whether `postId` is referenced by a manual Home relation (HeroNews.mainPost/secondaryPosts, FeaturedPosts.posts, VideoFeature.post). */
export async function postAffectsHome(req: PayloadRequest, postId: number): Promise<boolean> {
  const home = await req.payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true })
  const layout = (home?.layout ?? []) as HomeBlock[]
  return layout.some((block) => blockReferencesPost(block, postId))
}
