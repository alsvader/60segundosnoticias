import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { findOnePublished, findPublished } from '@/lib/data/public-query'

type GetPageBySlugArgs = {
  slug: string
}

/**
 * The only public Page query (Phase 7): resolves a Generic Page by slug,
 * published only. `depth: 1` is enough to populate direct relationships
 * inside `layout` blocks (e.g. `Hero.image`, `Banner.link.category`).
 *
 * Fase 8: cacheado con `unstable_cache`, tag `page:{slug}` - el `id` real
 * no se conoce hasta que la consulta resuelve, así que no puede ser un tag
 * de antemano; `invalidatePage()` invalida por `id` y por `slug` a la vez.
 */
export async function getPageBySlug({ slug }: GetPageBySlugArgs) {
  return unstable_cache(
    async () => {
      return findOnePublished({
        collection: 'pages',
        depth: 1,
        where: { slug: { equals: slug } },
      })
    },
    ['getPageBySlug', slug],
    { tags: [CACHE_TAGS.page(slug)] },
  )()
}

export type LlmsPageEntry = {
  title: string
  slug: string
}

/** Proyección estrecha para `/llms.txt` (§41.6): todas las Pages publicadas, solo `title`/`slug`. Tag `llms`. */
export async function getPublishedPagesForLlms(): Promise<LlmsPageEntry[]> {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'pages',
        depth: 0,
        limit: 0,
        select: { title: true, slug: true },
      })

      return result.docs.map((page) => ({ title: page.title, slug: page.slug }))
    },
    ['getPublishedPagesForLlms'],
    { tags: [CACHE_TAGS.llms] },
  )()
}

export type SitemapPageEntry = {
  slug: string
  updatedAt: string
}

/** Proyección estrecha para `app/sitemap.ts` (§42): todas las Pages publicadas, solo `slug`/`updatedAt`. Tag `sitemap` - cada hook de invalidación de Page ya revalida ese tag explícitamente. */
export async function getPublishedPagesForSitemap(): Promise<SitemapPageEntry[]> {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'pages',
        depth: 0,
        limit: 0,
        select: { slug: true, updatedAt: true },
      })

      return result.docs.map((page) => ({ slug: page.slug, updatedAt: page.updatedAt }))
    },
    ['getPublishedPagesForSitemap'],
    { tags: [CACHE_TAGS.sitemap] },
  )()
}
