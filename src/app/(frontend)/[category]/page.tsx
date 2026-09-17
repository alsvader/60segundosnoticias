import { cache } from 'react'
import { draftMode, headers } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/editorial/breadcrumbs'
import { ArticleCard } from '@/components/editorial/article-card'
import { Container } from '@/components/layout/container'
import { Pagination } from '@/components/editorial/pagination'
import { CategoryHeader } from '@/components/content/category-header'
import { PageBlockRenderer } from '@/components/sections/pages/page-block-renderer'
import { getPostsByCategory } from '@/lib/data/posts'
import { getSettings } from '@/lib/data/settings'
import { resolveRootSlug } from '@/lib/content/resolve-root-slug'
import { applyStoredRedirect } from '@/lib/redirects/apply-redirect'
import { buildBreadcrumbListJsonLd, JsonLd } from '@/lib/seo/json-ld'
import { buildMetadata, type SiteMetadataDefaults } from '@/lib/seo/metadata'
import { getAbsoluteUrl, getCategoryUrl, getPageUrl } from '@/lib/url/canonical'
import { mapPostToArticleCardData } from '@/lib/view-models/article-card'

const CATEGORY_PAGE_SIZE = 12

/**
 * Dedupe por request - generateMetadata y el componente de página
 * resuelven el mismo slug; sin esto se ejecutarían dos búsquedas
 * (Category y, en el miss, Page) por solicitud en vez de una. Con Draft
 * Mode habilitado, la Page se resuelve vía `findDraftPageBySlug()` (ver
 * `resolveRootSlug()`) en vez del lookup público - Draft Mode por sí solo
 * no le dice a Payload que debe devolver la versión en Draft.
 */
const getResolvedRootSlug = cache(async (slug: string) => {
  const { isEnabled } = await draftMode()
  return resolveRootSlug(slug, isEnabled ? { draftHeaders: await headers() } : undefined)
})

/**
 * Metadata de Category (fallback `"{name} | 60 Segundos"`, AC-SEO-003) o de
 * Page genérica (fallback a título + Hero.description/image cuando el
 * primer block es un Hero, AC-SEO-004). Sin resolución válida, replica el
 * `notFound()` del componente de página para que Next reemplace también la
 * metadata, no solo el render.
 */
export async function generateMetadata({ params }: RootSlugPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const resolved = await getResolvedRootSlug(slug)

  if (resolved.type === 'redirect') {
    applyStoredRedirect(resolved.to, resolved.statusCode)
  }

  if (resolved.type === 'not-found') {
    notFound()
  }

  const settings = await getSettings()
  const siteName = settings.branding?.siteName || '60 Segundos Noticias'
  const siteDefaults: SiteMetadataDefaults = {
    siteName,
    defaultMetaTitle: settings.seo?.defaultMetaTitle,
    defaultMetaDescription: settings.seo?.defaultMetaDescription,
    defaultMetaImage: settings.seo?.defaultMetaImage,
  }

  if (resolved.type === 'category') {
    const { category } = resolved
    return buildMetadata({
      seo: category.seo,
      fallbackTitle: `${category.name} | 60 Segundos`,
      fallbackDescription: category.description,
      fallbackImage: category.image,
      canonicalPath: getCategoryUrl(category.slug),
      siteDefaults,
    })
  }

  const { page } = resolved
  const heroBlock = page.layout?.find((block) => block.blockType === 'hero')

  return buildMetadata({
    seo: page.seo,
    fallbackTitle: page.title,
    fallbackDescription: heroBlock?.description,
    fallbackImage: heroBlock?.image,
    canonicalPath: getPageUrl(page.slug),
    siteDefaults,
  })
}

type RootSlugPageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

/**
 * `/<slug>` (root-content-routing): Category first, then published Page,
 * else 404 — mirrors `resolveRootSlug()`. Lives in a folder literally
 * named `[category]`, not `[slug]`: Next.js App Router requires every
 * dynamic segment at the same route position to share one parameter name,
 * and `[category]/[post]` (the Article route) already claims this
 * position — confirmed by hitting "You cannot use different slug names
 * for the same dynamic path" with a separate `[slug]/` folder. The
 * resolver inside still treats the value as a generic root slug (Category
 * or Page), regardless of the folder's name. Category's own `<h1>` and
 * page composition live here (category-page); Page composition delegates
 * to `PageBlockRenderer` (page-content-rendering). A Page with no `Hero`
 * block still gets exactly one `<h1>` via the same visually-hidden pattern
 * Home already uses, so "one H1" holds regardless of which blocks an
 * Admin configures.
 */
export default async function RootSlugPage({ params, searchParams }: RootSlugPageProps) {
  const { category: slug } = await params
  const resolved = await getResolvedRootSlug(slug)

  if (resolved.type === 'redirect') {
    applyStoredRedirect(resolved.to, resolved.statusCode)
  }

  if (resolved.type === 'not-found') {
    notFound()
  }

  if (resolved.type === 'page') {
    return (
      <Container className="flex flex-col gap-4 py-8 md:py-12">
        <h1 className="sr-only">{resolved.page.title}</h1>
        <PageBlockRenderer blocks={resolved.page.layout ?? []} />
      </Container>
    )
  }

  const { page: pageParam } = await searchParams
  const category = resolved.category

  let page = 1
  if (pageParam !== undefined) {
    const parsed = Number(pageParam)
    if (!Number.isInteger(parsed) || parsed < 1) {
      notFound()
    }
    page = parsed
  }

  const result = await getPostsByCategory({ categoryId: category.id, limit: CATEGORY_PAGE_SIZE, page })

  if (page > 1 && page > result.totalPages) {
    notFound()
  }

  const posts = result.docs.map((post) => mapPostToArticleCardData(post)).filter((card) => card !== undefined)

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <JsonLd
        data={buildBreadcrumbListJsonLd([
          { name: 'Inicio', url: getAbsoluteUrl('/') },
          { name: category.name, url: getAbsoluteUrl(getCategoryUrl(category.slug)) },
        ])}
      />
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: category.name }]} />
      <CategoryHeader category={category} />
      {posts.length > 0 ? (
        <>
          {/* `ArticleCard` siempre usa <h3> (asume un <h2> de sección ya
              presente, como el que aportan las Home sections vía
              `SectionHeader`) - esta grilla no tiene una sección visible
              propia, así que necesita su propio <h2>, oculto visualmente,
              para no saltar de <h1> a <h3> (hallazgo real de
              tests/e2e/a11y.spec.ts, Fase 11). */}
          <h2 className="sr-only">Noticias de {category.name}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.href} article={post} />
            ))}
          </div>
        </>
      ) : (
        <p className="type-body text-center text-[var(--ink-700)]">Todavía no hay contenido publicado en esta categoría.</p>
      )}
      <Pagination
        currentPage={page}
        totalPages={result.totalPages}
        getHref={(targetPage) => (targetPage <= 1 ? getCategoryUrl(category.slug) : `${getCategoryUrl(category.slug)}?page=${targetPage}`)}
      />
    </Container>
  )
}
