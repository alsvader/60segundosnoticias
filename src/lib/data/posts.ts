import 'server-only'

import type { Where } from 'payload'

import { findPublished } from '@/lib/data/public-query'

type GetLatestPostsArgs = {
  limit?: number
  categoryId?: number
}

/**
 * `categoryId` (added in Phase 6 for the Home `LatestPosts` block) filters
 * to Posts whose `primaryCategory` matches - `getPostBySlug()` is still
 * deliberately not implemented; its only consumer is the Article page,
 * Phase 7.
 */
export async function getLatestPosts({ limit = 6, categoryId }: GetLatestPostsArgs = {}) {
  const result = await findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: categoryId ? { primaryCategory: { equals: categoryId } } : undefined,
    // Exclude mode (a `false` value returns every other field) - list/card
    // consumers never need the full Lexical document.
    select: { content: false },
  })

  return result.docs
}

type GetPostsByCategoryArgs = {
  categoryId: number
  limit?: number
}

/**
 * Inclusive category membership (Phase 6 Home `PostsByCategory` block):
 * a Post belongs to `categoryId` whether it is the `primaryCategory` or
 * merely listed in `additionalCategories`, matching the membership rule
 * the future Category page (Phase 7) is expected to use (AC-FE-CAT-003).
 */
export async function getPostsByCategory({ categoryId, limit = 6 }: GetPostsByCategoryArgs) {
  const membership: Where = {
    or: [{ primaryCategory: { equals: categoryId } }, { additionalCategories: { contains: categoryId } }],
  }

  const result = await findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: membership,
    select: { content: false },
  })

  return result.docs
}
