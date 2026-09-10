import 'server-only'

import { findGlobalPublished } from '@/lib/data/public-query'

export async function getNavigation() {
  return findGlobalPublished('navigation', 1)
}
