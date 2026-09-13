import type { Payload } from 'payload'

import type { Category, Page, Post, Tag } from '@/payload-types'

import { extractLexicalText } from '../hooks/lib/lexical-text.ts'
import { extractPageSearchText } from './extract-page-search-text.ts'

/** Keeps the Search index record compact - a bound length for the derived
 *  plain-text field, not a byte-perfect representation of the source content. */
const MAX_SEARCH_TEXT_LENGTH = 2000

const boundedText = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized.length > MAX_SEARCH_TEXT_LENGTH ? `${normalized.slice(0, MAX_SEARCH_TEXT_LENGTH)}…` : normalized
}

/**
 * `beforeSync`/reindex may hand us `primaryCategory`/`tags` already
 * populated (a normal editorial save, depth >= 1) or as bare ids (the
 * plugin's own reindex path always fetches source docs at `depth: 0`) -
 * resolve either shape rather than assuming one.
 */
const resolveCategory = async (
  payload: Payload,
  primaryCategory: Post['primaryCategory'],
): Promise<Category | null> => {
  if (!primaryCategory) {
    return null
  }
  if (typeof primaryCategory === 'object') {
    return primaryCategory
  }
  try {
    return await payload.findByID({ collection: 'categories', id: primaryCategory, depth: 0 })
  } catch {
    return null
  }
}

const resolveTagNames = async (payload: Payload, tags: Post['tags']): Promise<string[]> => {
  if (!tags || tags.length === 0) {
    return []
  }
  const populated = tags.filter((tag): tag is Tag => typeof tag === 'object')
  const idsToResolve = tags.filter((tag): tag is number => typeof tag === 'number')
  if (idsToResolve.length === 0) {
    return populated.map((tag) => tag.name)
  }
  const { docs } = await payload.find({
    collection: 'tags',
    where: { id: { in: idsToResolve } },
    limit: idsToResolve.length,
    depth: 0,
  })
  return [...populated.map((tag) => tag.name), ...docs.map((tag) => tag.name)]
}

export type SearchDocFields = {
  title: string
  excerpt: string
  searchText: string
  slug: string
  categorySlug: string
  categoryName: string
  publishedAt: string | null
}

export const buildPostSearchDoc = async (payload: Payload, post: Post): Promise<SearchDocFields> => {
  const [category, tagNames] = await Promise.all([
    resolveCategory(payload, post.primaryCategory),
    resolveTagNames(payload, post.tags),
  ])
  const bodyText = extractLexicalText(post.content)

  return {
    title: post.title,
    excerpt: post.excerpt ?? '',
    searchText: boundedText([bodyText, tagNames.join(' '), category?.name ?? ''].filter(Boolean).join(' ')),
    slug: post.slug,
    categorySlug: category?.slug ?? '',
    categoryName: category?.name ?? '',
    publishedAt: post.publishedAt ?? null,
  }
}

export const buildPageSearchDoc = (page: Page): SearchDocFields => ({
  title: page.title,
  excerpt: page.seo?.metaDescription ?? '',
  searchText: boundedText(extractPageSearchText(page.layout)),
  slug: page.slug,
  categorySlug: '',
  categoryName: '',
  publishedAt: null,
})
