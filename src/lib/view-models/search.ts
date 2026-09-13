import type { ArticleCardData } from '@/components/editorial/article-card'
import type { Search } from '@/payload-types'
import { formatShortDate } from '@/lib/format/date'
import { getPageUrl, getPostUrl } from '@/lib/url/canonical'

/**
 * Frontend-safe Search result contract - reuses `ArticleCardData` as-is
 * (every field beyond `title`/`href` is already optional, which already
 * fits a Page result missing image/category/metadata) rather than
 * introducing a parallel type. Presentational components never see the
 * raw `Search` Payload document.
 */
export type SearchResult = ArticleCardData & {
  type: 'post' | 'page'
}

export type SearchResultPage = {
  results: SearchResult[]
  page: number
  totalPages: number
  totalDocs: number
  query: string
}

function mapSearchDocToResult(doc: Search): SearchResult | undefined {
  if (!doc.slug) {
    return undefined
  }

  if (doc.doc.relationTo === 'posts') {
    if (!doc.categorySlug) {
      return undefined
    }
    return {
      type: 'post',
      title: doc.title ?? '',
      excerpt: doc.excerpt ?? undefined,
      href: getPostUrl(doc.categorySlug, doc.slug),
      category: doc.categoryName ? { name: doc.categoryName } : undefined,
      metadata: doc.publishedAt ? { publishedAtLabel: formatShortDate(doc.publishedAt) } : undefined,
    }
  }

  return {
    type: 'page',
    title: doc.title ?? '',
    excerpt: doc.excerpt ?? undefined,
    href: getPageUrl(doc.slug),
  }
}

type SearchContentResult = {
  docs: Search[]
  page: number
  totalDocs: number
  totalPages: number
  query: string
}

export function mapSearchContentResult(result: SearchContentResult): SearchResultPage {
  const results = result.docs.reduce<SearchResult[]>((accumulator, doc) => {
    const mapped = mapSearchDocToResult(doc)
    if (mapped) {
      accumulator.push(mapped)
    }
    return accumulator
  }, [])

  return {
    results,
    page: result.page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    query: result.query,
  }
}
