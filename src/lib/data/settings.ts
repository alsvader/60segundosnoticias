import 'server-only'

import { findGlobalPublished } from '@/lib/data/public-query'

export async function getSettings() {
  return findGlobalPublished('siteSettings', 1)
}
