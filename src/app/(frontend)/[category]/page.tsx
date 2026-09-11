import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/editorial/breadcrumbs'
import { ArticleCard } from '@/components/editorial/article-card'
import { Container } from '@/components/layout/container'
import { Pagination } from '@/components/editorial/pagination'
import { CategoryHeader } from '@/components/content/category-header'
import { PageBlockRenderer } from '@/components/sections/pages/page-block-renderer'
import { getPostsByCategory } from '@/lib/data/posts'
import { resolveRootSlug } from '@/lib/content/resolve-root-slug'
import { getCategoryUrl } from '@/lib/url/canonical'
import { mapPostToArticleCardData } from '@/lib/view-models/article-card'

const CATEGORY_PAGE_SIZE = 12

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
  const resolved = await resolveRootSlug(slug)

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
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: category.name }]} />
      <CategoryHeader category={category} />
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.href} article={post} />
          ))}
        </div>
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
