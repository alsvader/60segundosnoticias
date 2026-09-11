import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'
import type { CategoryThemeKey } from '@/lib/constants/category-theme-keys'
import { formatLongDate } from '@/lib/format/date'
import { getCategoryUrl, getPostUrl } from '@/lib/url/canonical'
import { mapUserToAuthorSummary, type AuthorSummary } from '@/lib/view-models/author'
import { mapMediaToMediaData, type MediaData } from '@/lib/view-models/media'
import type { Post } from '@/payload-types'

export type TagSummary = {
  id: number
  name: string
}

export type ArticleDetailData = {
  title: string
  href: string
  excerpt?: string
  featuredImage?: MediaData
  primaryCategory: {
    name: string
    href: string
    colorTheme?: CategoryThemeKey
    icon?: CategoryIconKey
  }
  tags: TagSummary[]
  author?: AuthorSummary
  source?: string
  photoCredits?: string
  publishedAtLabel?: string
  updatedAtLabel?: string
  readingTimeMinutes?: number
  content: Post['content']
}

// Payload bumps `updatedAt` on every save, including the same request that
// first publishes a Post (`assignPublishedAt`) - a gap below this
// threshold means "no real edit since publish", not a meaningful update.
const MEANINGFUL_UPDATE_THRESHOLD_MS = 1000

/**
 * Requires `post.primaryCategory` populated (query depth >= 1), same
 * constraint as `mapPostToArticleCardData` - the canonical URL and
 * breadcrumb both need it. Returns undefined rather than build a broken
 * page.
 */
export function mapPostToArticleDetailData(post: Post): ArticleDetailData | undefined {
  const primaryCategory = post.primaryCategory
  if (!primaryCategory || typeof primaryCategory === 'number') {
    return undefined
  }

  const featuredImage = mapMediaToMediaData(post.featuredImage, {
    preferredSize: 'hero',
    fallbackAlt: post.title,
  })

  const tags = (post.tags ?? []).filter((tag): tag is Exclude<typeof tag, number> => typeof tag !== 'number')

  const publishedAtLabel = post.publishedAt ? formatLongDate(post.publishedAt) : undefined
  const hasMeaningfulUpdate =
    post.publishedAt &&
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > MEANINGFUL_UPDATE_THRESHOLD_MS
  const updatedAtLabel = hasMeaningfulUpdate ? formatLongDate(post.updatedAt) : undefined

  return {
    title: post.title,
    href: getPostUrl(primaryCategory.slug, post.slug),
    excerpt: post.excerpt ?? undefined,
    featuredImage,
    primaryCategory: {
      name: primaryCategory.name,
      href: getCategoryUrl(primaryCategory.slug),
      colorTheme: primaryCategory.colorTheme ?? undefined,
      icon: primaryCategory.icon ?? undefined,
    },
    tags: tags.map((tag) => ({ id: tag.id, name: tag.name })),
    author: mapUserToAuthorSummary(post.author),
    source: post.source ?? undefined,
    photoCredits: post.photoCredits ?? undefined,
    publishedAtLabel,
    updatedAtLabel,
    readingTimeMinutes: post.readingTimeMinutes ?? undefined,
    content: post.content,
  }
}
