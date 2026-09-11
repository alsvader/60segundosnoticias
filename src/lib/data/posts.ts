import 'server-only'

import type { Where } from 'payload'

import { getAllCategories } from '@/lib/data/categories'
import { findOnePublished, findPublished } from '@/lib/data/public-query'

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
  page?: number
}

/**
 * Inclusive category membership (Phase 6 Home `PostsByCategory` block,
 * reused as-is by the Phase 7 Category page): a Post belongs to
 * `categoryId` whether it is the `primaryCategory` or merely listed in
 * `additionalCategories` (AC-FE-CAT-003).
 *
 * Returns the full Payload paginated result (not just `docs`) so the
 * Category page can read `totalDocs`/`totalPages` for its own pagination
 * without a second query - callers that only need the array (the Home
 * `PostsByCategory`/`HeroNews` resolvers) read `.docs`.
 */
export async function getPostsByCategory({ categoryId, limit = 6, page }: GetPostsByCategoryArgs) {
  const membership: Where = {
    or: [{ primaryCategory: { equals: categoryId } }, { additionalCategories: { contains: categoryId } }],
  }

  return findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    page,
    sort: '-publishedAt',
    where: membership,
    select: { content: false },
  })
}

type GetPostBySlugArgs = {
  slug: string
}

/**
 * The single Article detail query (Phase 7): unlike every other public
 * Posts query in this DAL, it deliberately loads `content` in full - see
 * `getRelatedPosts()`/`getPostsByCategory()`/`getLatestPosts()` for the
 * list-side counterpart that always excludes it. `depth: 2` reaches
 * `primaryCategory`/`additionalCategories`/`tags`/`featuredImage`/`author`
 * as populated objects, and one level further for `author.avatar` and any
 * Media relationship nested inside an Article Content Block.
 */
export async function getPostBySlug({ slug }: GetPostBySlugArgs) {
  return findOnePublished({
    collection: 'posts',
    depth: 2,
    where: { slug: { equals: slug } },
  })
}

type GetFeaturedPostsArgs = {
  limit?: number
}

/**
 * `Posts.featured` (indexed checkbox) has existed since Phase 3 but had no
 * frontend consumer until the Article sidebar's "Destacados" mode — the
 * Home `FeaturedPosts` block uses a manually-curated relationship instead,
 * unrelated to this flag.
 */
export async function getFeaturedPosts({ limit = 6 }: GetFeaturedPostsArgs = {}) {
  const result = await findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: { featured: { equals: true } },
    select: { content: false },
  })

  return result.docs
}

type GetNewestPostPerCategoryArgs = {
  limit?: number
}

/**
 * One post (the most recent) per category, combined and re-sorted by
 * publish date. N+1 queries (one per category) — acceptable at this
 * category count (~5) and consistent with the rest of the DAL's
 * no-caching, fetch-fresh posture.
 */
export async function getNewestPostPerCategory({ limit = 5 }: GetNewestPostPerCategoryArgs = {}) {
  const categories = await getAllCategories()

  const results = await Promise.all(
    categories.map((category) =>
      findPublished({
        collection: 'posts',
        depth: 1,
        limit: 1,
        sort: '-publishedAt',
        where: { primaryCategory: { equals: category.id } },
        select: { content: false },
      }),
    ),
  )

  const posts = results.flatMap((result) => result.docs)
  posts.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return bTime - aTime
  })

  return posts.slice(0, limit)
}

type GetRelatedPostsArgs = {
  postId: number
  primaryCategoryId: number
  limit?: number
}

/**
 * V1 Related Posts algorithm, exactly as specified (Master Spec §34.2) -
 * same `primaryCategory` only, no `additionalCategories`/`tags` signal, no
 * manual configuration. Excludes the current Post, published only, newest
 * first, no `content` (same list-query discipline as every other listing
 * function here).
 */
export async function getRelatedPosts({ postId, primaryCategoryId, limit = 4 }: GetRelatedPostsArgs) {
  const result = await findPublished({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: {
      and: [{ primaryCategory: { equals: primaryCategoryId } }, { id: { not_equals: postId } }],
    },
    select: { content: false },
  })

  return result.docs
}
