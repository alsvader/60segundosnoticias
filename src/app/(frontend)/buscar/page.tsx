import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/editorial/article-card'
import { Container } from '@/components/layout/container'
import { Pagination } from '@/components/editorial/pagination'
import { SearchForm } from '@/components/site/search-form'
import { searchContent } from '@/lib/data/search'
import { mapSearchContentResult } from '@/lib/view-models/search'

const SEARCH_PAGE_SIZE = 12

type BuscarPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>
}

/**
 * Fase 9 (§36 del Master Spec): `/buscar` nunca es un destino indexable -
 * cada resultado ya está representado por su Article/Page canónico.
 */
export async function generateMetadata({ searchParams }: BuscarPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  return {
    title: query ? `Resultados para "${query}"` : 'Buscar',
    robots: { index: false, follow: false },
  }
}

function buildResultHref(query: string, targetPage: number): string {
  const params = new URLSearchParams({ q: query })
  if (targetPage > 1) {
    params.set('page', String(targetPage))
  }
  return `/buscar?${params.toString()}`
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const { q, page: pageParam } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  let page = 1
  if (pageParam !== undefined) {
    const parsed = Number(pageParam)
    if (!Number.isInteger(parsed) || parsed < 1) {
      notFound()
    }
    page = parsed
  }

  const searchForm = <SearchForm idPrefix="buscar-page" landmarkLabel="Búsqueda en la página de resultados" defaultValue={query} />

  if (!query) {
    return (
      <Container className="flex flex-col gap-8 py-8 md:py-12">
        <h1 className="type-h1-article font-[var(--font-display)] font-bold text-[var(--ink-950)]">Buscar</h1>
        {searchForm}
        <p className="type-body text-[var(--ink-700)]">Escribe un término para buscar noticias y páginas del sitio.</p>
      </Container>
    )
  }

  const result = await searchContent({ query, page, limit: SEARCH_PAGE_SIZE })
  const { results, totalDocs, totalPages } = mapSearchContentResult(result)

  if (page > 1 && page > totalPages) {
    notFound()
  }

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <h1 className="type-h1-article font-[var(--font-display)] font-bold text-[var(--ink-950)]">Buscar</h1>
      {searchForm}
      <p className="type-body text-[var(--ink-700)]">
        Resultados para &quot;{query}&quot; — {totalDocs} {totalDocs === 1 ? 'resultado' : 'resultados'}
      </p>
      {results.length > 0 ? (
        <>
          {/* Mismo hallazgo/patrón que la grilla de Category (Fase 11,
              tests/e2e/a11y.spec.ts): `ArticleCard` usa <h3> asumiendo un
              <h2> de sección ya presente. */}
          <h2 className="sr-only">Resultados de búsqueda</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <ArticleCard key={result.href} article={result} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="type-body text-[var(--ink-700)]">
            No encontramos resultados para &quot;{query}&quot;. Revisa la ortografía o intenta con otro término.
          </p>
          <Link
            href="/"
            className="type-label-uppercase rounded-sm text-[var(--brand-red-600)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver últimas noticias
          </Link>
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} getHref={(targetPage) => buildResultHref(query, targetPage)} />
    </Container>
  )
}
