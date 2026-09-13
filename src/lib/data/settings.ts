import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findGlobalPublished } from '@/lib/data/public-query'

export async function getSettings() {
  return unstable_cache(async () => findGlobalPublished('siteSettings', 1), ['getSettings'], {
    tags: [CACHE_TAGS.settings],
  })()
}
