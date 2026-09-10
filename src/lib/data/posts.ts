import 'server-only'

import { findPublished } from '@/lib/data/public-query'

type GetLatestPostsArgs = {
  limit?: number
}

/**
 * Only public Post query with a real Phase 5 consumer (verifying
 * mapPostToArticleCardData against real data). `getPostBySlug()` and
 * `getPostsByCategory()` are deliberately not implemented yet - their
 * consumers are the Article and Category pages, both Phase 7.
 */
export async function getLatestPosts({ limit = 6 }: GetLatestPostsArgs = {}) {
  const result = await findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    // Exclude mode (a `false` value returns every other field) - list/card
    // consumers never need the full Lexical document.
    select: { content: false },
  })

  return result.docs
}
