import 'server-only'

import { findOnePublished } from '@/lib/data/public-query'

type GetPageBySlugArgs = {
  slug: string
}

/**
 * The only public Page query (Phase 7): resolves a Generic Page by slug,
 * published only. `depth: 1` is enough to populate direct relationships
 * inside `layout` blocks (e.g. `Hero.image`, `Banner.link.category`).
 */
export async function getPageBySlug({ slug }: GetPageBySlugArgs) {
  return findOnePublished({
    collection: 'pages',
    depth: 1,
    where: { slug: { equals: slug } },
  })
}
