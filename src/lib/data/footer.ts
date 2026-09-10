import 'server-only'

import { findGlobalPublished } from '@/lib/data/public-query'

export async function getFooter() {
  return findGlobalPublished('footer', 1)
}
