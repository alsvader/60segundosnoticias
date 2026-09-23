import 'server-only'

import type { ArticleCardData } from '@/components/editorial/article-card'
import type { CategoryCardData } from '@/components/editorial/category-card'
import type { BannerData } from '@/components/sections/banner-section'
import { getLatestPosts, getPostsByCategory } from '@/lib/data/posts'
import type { ExternalVideoProvider } from '@/lib/editorial/video-provider'
import { resolveExternalVideoUrl } from '@/lib/editorial/video-provider'
import { getCategoryUrl } from '@/lib/url/canonical'
import { resolveLink, type ResolvedLink } from '@/lib/url/resolve-link'
import { mapPostToArticleCardData } from '@/lib/view-models/article-card'
import { mapCategoryToCategoryCardData } from '@/lib/view-models/category-card'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import type { Category, Home, Post } from '@/payload-types'

export type ResolvedEditorialIntro = {
  type: 'editorial-intro'
  key: string
  headlinePrimary: string
  headlineAccent: string
  description: string
  backgroundImage: { src: string; alt: string }
  foregroundImage: { src: string; alt: string }
  cta: ResolvedLink
}

export type ResolvedHeroNews = {
  type: 'hero-news'
  key: string
  eyebrow?: string
  headline: string
  description?: string
  cta?: ResolvedLink
  mainPost: ArticleCardData
  secondaryPosts: ArticleCardData[]
}

export type ResolvedCategoryExplorer = {
  type: 'category-explorer'
  key: string
  title?: string
  categories: CategoryCardData[]
  viewAllLabel?: string
}

export type ResolvedLatestPosts = {
  type: 'latest-posts'
  key: string
  title?: string
  layout: 'grid' | 'list' | 'mixed'
  posts: ArticleCardData[]
}

export type ResolvedPostsByCategory = {
  type: 'posts-by-category'
  key: string
  title?: string
  layout: 'grid' | 'horizontal' | 'featured-grid'
  posts: ArticleCardData[]
  viewAll?: { label: string; href: string }
}

export type ResolvedFeaturedPosts = {
  type: 'featured-posts'
  key: string
  title?: string
  layout: 'grid' | 'carousel' | 'editorial'
  posts: ArticleCardData[]
}

export type ResolvedVideoMedia =
  | { kind: 'post'; post: ArticleCardData }
  | { kind: 'embed'; provider: ExternalVideoProvider; embedId: string }

export type ResolvedVideoFeature = {
  type: 'video-feature'
  key: string
  title?: string
  headline?: string
  description?: string
  thumbnail?: { src: string; alt: string }
  media: ResolvedVideoMedia
}

export type ResolvedBanner = {
  type: 'banner'
  key: string
  banner: BannerData
}

export type ResolvedHomeBlock =
  | ResolvedEditorialIntro
  | ResolvedHeroNews
  | ResolvedCategoryExplorer
  | ResolvedLatestPosts
  | ResolvedPostsByCategory
  | ResolvedFeaturedPosts
  | ResolvedVideoFeature
  | ResolvedBanner

type RawHomeBlock = NonNullable<Home['layout']>[number]

/**
 * Payload's relationship population falls back to the bare numeric ID
 * whenever the related document cannot be populated - including when it
 * fails the related collection's own access control (e.g. a Draft Post
 * under `overrideAccess: false`). Verified against
 * `node_modules/payload/dist/fields/hooks/afterRead/relationshipPopulationPromise.js`
 * (v3.87.1): "ids are visible regardless of access controls". Treating a
 * bare ID as absent is the same convention `mapPostToArticleCardData`
 * already uses for `primaryCategory`.
 */
function isPopulated<T>(value: T | number | null | undefined): value is T {
  return typeof value === 'object' && value !== null
}

function toArticleCards(posts: Post[]): ArticleCardData[] {
  return posts.map((post) => mapPostToArticleCardData(post)).filter((card): card is ArticleCardData => Boolean(card))
}

function resolveEditorialIntro(block: RawHomeBlock & { blockType: 'editorialIntro' }, index: number) {
  // 'desktop' for the full-bleed background composition, 'tablet' for the
  // smaller foreground graphic beside the text - never 'hero' for either
  // (AC-MEDIA-004 forbids only the reverse: cards loading 'hero').
  const background = mapMediaToMediaData(block.backgroundImage, {
    preferredSize: 'desktop',
    fallbackAlt: block.headlinePrimary,
  })
  const foreground = mapMediaToMediaData(block.foregroundImage, {
    preferredSize: 'tablet',
    fallbackAlt: block.headlinePrimary,
  })

  // Both images and the CTA are structural to this block's single approved
  // composition (§19.2) - unlike a list block missing a few items, a
  // half-composed EditorialIntro isn't a degraded-but-useful state, so the
  // whole block is hidden rather than rendered incomplete. Each rejection
  // is logged - previously this failed silently (opacity of the bug: an
  // Admin-entered `ctaLink: '/'` made the entire block disappear with no
  // diagnostic signal anywhere).
  if (!background || !foreground) {
    console.warn(
      `resolveHomeBlocks: EditorialIntro block ${block.id ?? index} is missing backgroundImage or foregroundImage, skipping.`,
    )
    return undefined
  }

  // `cta` is the same reusable Navigation/Footer link-item model
  // (linkFields) - Category/Page/External, resolved the same way.
  const cta = resolveLink(block.cta)
  if (!cta) {
    console.warn(`resolveHomeBlocks: EditorialIntro block ${block.id ?? index} has an unresolvable cta, skipping.`)
    return undefined
  }

  return {
    type: 'editorial-intro',
    key: block.id ?? `editorial-intro-${index}`,
    headlinePrimary: block.headlinePrimary,
    headlineAccent: block.headlineAccent,
    description: block.description,
    backgroundImage: { src: background.url, alt: background.alt },
    foregroundImage: { src: foreground.url, alt: foreground.alt },
    cta,
  } satisfies ResolvedEditorialIntro
}

async function resolveHeroNews(block: RawHomeBlock & { blockType: 'heroNews' }, index: number) {
  let mainPost: Post | undefined
  let secondaryPosts: Post[]

  if (block.contentMode === 'manual') {
    mainPost = isPopulated<Post>(block.mainPost) ? block.mainPost : undefined
    secondaryPosts = (block.secondaryPosts ?? []).filter((post): post is Post => isPopulated<Post>(post))
  } else {
    const sourceCategoryId = isPopulated<Category>(block.sourceCategory) ? block.sourceCategory.id : undefined
    const limit = block.limit ?? 4
    const posts = sourceCategoryId
      ? (await getPostsByCategory({ categoryId: sourceCategoryId, limit })).docs
      : await getLatestPosts({ limit })
    mainPost = posts[0]
    secondaryPosts = posts.slice(1)
  }

  if (!mainPost) return undefined

  // Larger than the 'card' size every other list/grid consumer uses -
  // the Hero is the single most prominent image on Home (AC-MEDIA-004
  // only forbids the reverse: cards must never load the 'hero' size).
  const mainCard = mapPostToArticleCardData(mainPost, { imagePreferredSize: 'tablet' })
  if (!mainCard) return undefined

  // Optional - resolveLink() naturally returns undefined for an empty/unset
  // `cta` group (no `type` matches, `url` empty), same reusable model as
  // Navigation/Footer.
  const cta = resolveLink(block.cta)

  return {
    type: 'hero-news',
    key: block.id ?? `hero-news-${index}`,
    eyebrow: block.eyebrow ?? undefined,
    headline: block.headline,
    description: block.description ?? undefined,
    cta,
    mainPost: mainCard,
    secondaryPosts: toArticleCards(secondaryPosts).slice(0, 3),
  } satisfies ResolvedHeroNews
}

function resolveCategoryExplorer(block: RawHomeBlock & { blockType: 'categoryExplorer' }, index: number) {
  const categories = (block.categories ?? [])
    .filter((category): category is Category => isPopulated<Category>(category))
    .map(mapCategoryToCategoryCardData)

  if (categories.length === 0) return undefined

  return {
    type: 'category-explorer',
    key: block.id ?? `category-explorer-${index}`,
    title: block.title ?? undefined,
    categories,
    viewAllLabel: block.showViewAll ? block.viewAllLabel ?? undefined : undefined,
  } satisfies ResolvedCategoryExplorer
}

async function resolveLatestPosts(block: RawHomeBlock & { blockType: 'latestPosts' }, index: number) {
  const categoryId = isPopulated<Category>(block.category) ? block.category.id : undefined
  const posts = await getLatestPosts({ limit: block.limit ?? 6, categoryId })
  const cards = toArticleCards(posts)

  if (cards.length === 0) return undefined

  return {
    type: 'latest-posts',
    key: block.id ?? `latest-posts-${index}`,
    title: block.title ?? undefined,
    layout: block.layout,
    posts: cards,
  } satisfies ResolvedLatestPosts
}

async function resolvePostsByCategory(block: RawHomeBlock & { blockType: 'postsByCategory' }, index: number) {
  const category = isPopulated<Category>(block.category) ? block.category : undefined
  if (!category) return undefined

  const { docs: posts } = await getPostsByCategory({ categoryId: category.id, limit: block.limit ?? 6 })
  const cards = toArticleCards(posts)

  if (cards.length === 0) return undefined

  return {
    type: 'posts-by-category',
    key: block.id ?? `posts-by-category-${index}`,
    title: block.title ?? undefined,
    layout: block.layout,
    posts: cards,
    viewAll: block.showViewAll
      ? { label: `Ver todas las noticias de ${category.name}`, href: getCategoryUrl(category.slug) }
      : undefined,
  } satisfies ResolvedPostsByCategory
}

function resolveFeaturedPosts(block: RawHomeBlock & { blockType: 'featuredPosts' }, index: number) {
  const posts = (block.posts ?? []).filter((post): post is Post => isPopulated<Post>(post))
  const cards = toArticleCards(posts)

  if (cards.length === 0) return undefined

  return {
    type: 'featured-posts',
    key: block.id ?? `featured-posts-${index}`,
    title: block.title ?? undefined,
    layout: block.layout,
    posts: cards,
  } satisfies ResolvedFeaturedPosts
}

function resolveVideoFeature(block: RawHomeBlock & { blockType: 'videoFeature' }, index: number) {
  let media: ResolvedVideoMedia | undefined

  if (block.source === 'post' && isPopulated<Post>(block.post)) {
    const post = mapPostToArticleCardData(block.post)
    if (post) media = { kind: 'post', post }
  } else if (block.source === 'external') {
    const external = resolveExternalVideoUrl(block.videoURL)
    if (external) media = { kind: 'embed', provider: external.provider, embedId: external.embedId }
  }

  if (!media) return undefined

  const thumbnail = mapMediaToMediaData(block.thumbnail, {
    preferredSize: 'tablet',
    fallbackAlt: block.headline ?? block.title ?? '',
  })

  return {
    type: 'video-feature',
    key: block.id ?? `video-feature-${index}`,
    title: block.title ?? undefined,
    headline: block.headline ?? undefined,
    description: block.description ?? undefined,
    thumbnail: thumbnail ? { src: thumbnail.url, alt: thumbnail.alt } : undefined,
    media,
  } satisfies ResolvedVideoFeature
}

function resolveBanner(block: RawHomeBlock & { blockType: 'banner' }, index: number) {
  const image = mapMediaToMediaData(block.image, { preferredSize: 'tablet', fallbackAlt: block.title ?? '' })
  const link = resolveLink(block.link)

  return {
    type: 'banner',
    key: block.id ?? `banner-${index}`,
    banner: {
      title: block.title,
      description: block.description,
      image: image ? { src: image.url, alt: image.alt, width: image.width, height: image.height } : undefined,
      link,
      variant: block.variant ?? 'editorial',
    },
  } satisfies ResolvedBanner
}

async function resolveBlock(block: RawHomeBlock, index: number): Promise<ResolvedHomeBlock | undefined> {
  switch (block.blockType) {
    case 'editorialIntro':
      return resolveEditorialIntro(block, index)
    case 'heroNews':
      return resolveHeroNews(block, index)
    case 'categoryExplorer':
      return resolveCategoryExplorer(block, index)
    case 'latestPosts':
      return resolveLatestPosts(block, index)
    case 'postsByCategory':
      return resolvePostsByCategory(block, index)
    case 'featuredPosts':
      return resolveFeaturedPosts(block, index)
    case 'videoFeature':
      return resolveVideoFeature(block, index)
    case 'banner':
      return resolveBanner(block, index)
    default: {
      const unknownBlockType = (block as { blockType?: string }).blockType
      console.warn(`resolveHomeBlocks: unknown Home block type "${unknownBlockType}", skipping.`)
      return undefined
    }
  }
}

/**
 * Payload Block -> Resolver -> View Model -> (Renderer -> Section). Never
 * throws on a single malformed/unresolvable block - it is simply omitted,
 * so `HomeBlockRenderer` only ever sees renderable blocks.
 */
export async function resolveHomeBlocks(layout: Home['layout']): Promise<ResolvedHomeBlock[]> {
  if (!layout) return []

  const resolved = await Promise.all(layout.map((block, index) => resolveBlock(block, index)))

  return resolved.filter((block): block is ResolvedHomeBlock => Boolean(block))
}
