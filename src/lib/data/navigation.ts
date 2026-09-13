import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findGlobalPublished } from '@/lib/data/public-query'

export async function getNavigation() {
  return unstable_cache(async () => findGlobalPublished('navigation', 1), ['getNavigation'], {
    tags: [CACHE_TAGS.navigation],
  })()
}
