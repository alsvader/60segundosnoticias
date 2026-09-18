import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { getAllCategories } from '@/lib/data/categories'
import { getPublishedPagesForSitemap } from '@/lib/data/pages'
import { getPublishedPostsForSitemap } from '@/lib/data/posts'
import { getAbsoluteUrl, getCategoryUrl, getPageUrl, getPostUrl } from '@/lib/url/canonical'

/**
 * §42: Home + Categories + Pages publicadas + Posts publicados
 * (`primaryCategory`, nunca `additionalCategories` ni `Redirects.from`
 * históricos). Envuelto en una sola `unstable_cache` con tag `sitemap` -
 * cada fuente (Post/Category/Page) ya revalida ese tag explícitamente
 * desde sus propios hooks de invalidación.
 */
/**
 * Fase 11 (openspec/changes/runtime-public-rendering): sin esto, `next
 * build` intenta generar `/sitemap.xml` de forma estática por defecto,
 * ejecutando `getSitemapEntries()` (y por tanto una consulta real a
 * Payload) en build time - falla si no hay Postgres alcanzable (Fase 10,
 * `production-docker-image`). `unstable_cache` abajo sigue cacheando el
 * resultado en el Data Cache entre requests; esto solo cambia que la ruta
 * se evalúe en tiempo de solicitud en vez de en build time.
 */
export const dynamic = 'force-dynamic'

const getSitemapEntries = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const [categories, posts, pages] = await Promise.all([
      getAllCategories(),
      getPublishedPostsForSitemap(),
      getPublishedPagesForSitemap(),
    ])

    const entries: MetadataRoute.Sitemap = [{ url: getAbsoluteUrl('/') }]

    for (const category of categories) {
      entries.push({ url: getAbsoluteUrl(getCategoryUrl(category.slug)), lastModified: category.updatedAt })
    }

    for (const page of pages) {
      entries.push({ url: getAbsoluteUrl(getPageUrl(page.slug)), lastModified: page.updatedAt })
    }

    for (const post of posts) {
      entries.push({
        url: getAbsoluteUrl(getPostUrl(post.primaryCategorySlug, post.slug)),
        lastModified: post.updatedAt,
      })
    }

    return entries
  },
  ['sitemap'],
  { tags: [CACHE_TAGS.sitemap] },
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries()
}
