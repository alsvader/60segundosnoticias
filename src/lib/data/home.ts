import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findGlobalPublished } from '@/lib/data/public-query'

/**
 * Depth 2: Home blocks reference Posts/Categories directly (depth 1), and
 * those Posts need their own `primaryCategory`/`featuredImage`/`author`
 * populated (depth 2) for `mapPostToArticleCardData` to produce a valid href.
 */
export async function getHome() {
  return unstable_cache(async () => findGlobalPublished('home', 2), ['getHome'], {
    tags: [CACHE_TAGS.home],
  })()
}
