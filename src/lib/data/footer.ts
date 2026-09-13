import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findGlobalPublished } from '@/lib/data/public-query'

export async function getFooter() {
  return unstable_cache(async () => findGlobalPublished('footer', 1), ['getFooter'], {
    tags: [CACHE_TAGS.footer],
  })()
}
