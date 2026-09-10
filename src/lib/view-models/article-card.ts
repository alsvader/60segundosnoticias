import type { Post } from '@/payload-types'
import type { ArticleCardData } from '@/components/editorial/article-card'
import { formatShortDate } from '@/lib/format/date'
import { getPostUrl } from '@/lib/url/canonical'
import type { MediaSizeName } from '@/lib/view-models/media'
import { mapUserToAuthorSummary } from '@/lib/view-models/author'
import { mapMediaToMediaData } from '@/lib/view-models/media'

type MapPostToArticleCardDataOptions = {
  /** Defaults to 'card' - override for a context that isn't a list/grid card (e.g. the Home Hero's main story). */
  imagePreferredSize?: MediaSizeName
}

/**
 * Requires `post.primaryCategory` to be populated (query depth >= 1) -
 * the canonical Post URL is /<primaryCategorySlug>/<postSlug>, so a Post
 * whose primary category didn't come back populated can't be mapped to
 * a valid href. Returns undefined rather than construct a broken link.
 */
export function mapPostToArticleCardData(
  post: Post,
  options: MapPostToArticleCardDataOptions = {},
): ArticleCardData | undefined {
  const primaryCategory = post.primaryCategory

  if (!primaryCategory || typeof primaryCategory === 'number') {
    return undefined
  }

  const image = mapMediaToMediaData(post.featuredImage, {
    preferredSize: options.imagePreferredSize ?? 'card',
    fallbackAlt: post.title,
  })
  const author = mapUserToAuthorSummary(post.author)

  return {
    title: post.title,
    excerpt: post.excerpt ?? undefined,
    href: getPostUrl(primaryCategory.slug, post.slug),
    image: image ? { src: image.url, alt: image.alt } : undefined,
    category: {
      name: primaryCategory.name,
      colorTheme: primaryCategory.colorTheme ?? undefined,
      icon: primaryCategory.icon ?? undefined,
    },
    metadata: {
      authorName: author?.displayName,
      publishedAtLabel: post.publishedAt ? formatShortDate(post.publishedAt) : undefined,
      readingTimeMinutes: post.readingTimeMinutes ?? undefined,
    },
  }
}
