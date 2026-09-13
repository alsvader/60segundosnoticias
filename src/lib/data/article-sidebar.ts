import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findGlobalPublished } from '@/lib/data/public-query'
import { getFeaturedPosts, getLatestPosts, getNewestPostPerCategory } from '@/lib/data/posts'

export async function getArticleSidebar() {
  return unstable_cache(async () => findGlobalPublished('articleSidebar', 1), ['getArticleSidebar'], {
    tags: [CACHE_TAGS.articleSidebar],
  })()
}

const MODE_LABELS: Record<string, string> = {
  latest: 'Últimos posts',
  'newest-per-category': 'Lo más nuevo por categoría',
  featured: 'Destacados',
}

export function getArticleSidebarHeading(mode: string, customHeading?: string | null) {
  return customHeading || MODE_LABELS[mode] || MODE_LABELS.latest
}

type GetArticleSidebarPostsArgs = {
  mode: string
  limit: number
  excludePostId: number
}

/**
 * Dispatches to the right DAL query for the configured `postsPanel.mode`
 * and excludes the current Post — since none of the underlying queries
 * (`getLatestPosts`/`getFeaturedPosts`/`getNewestPostPerCategory`) take an
 * "exclude" argument, this over-fetches by one and filters/slices here.
 */
export async function getArticleSidebarPosts({ mode, limit, excludePostId }: GetArticleSidebarPostsArgs) {
  const raw =
    mode === 'featured'
      ? await getFeaturedPosts({ limit: limit + 1 })
      : mode === 'newest-per-category'
        ? await getNewestPostPerCategory({ limit: limit + 1 })
        : await getLatestPosts({ limit: limit + 1 })

  return raw.filter((post) => post.id !== excludePostId).slice(0, limit)
}
