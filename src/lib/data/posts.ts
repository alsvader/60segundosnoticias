import 'server-only'

import type { Where } from 'payload'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
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
 *
 * Fase 8: cacheado con `unstable_cache`, tag `posts` - cualquier
 * publish/update de Post invalida esta lista, sin importar `categoryId`
 * (ver `specs/cache-revalidation/spec.md`).
 */
export async function getLatestPosts({ limit = 6, categoryId }: GetLatestPostsArgs = {}) {
  return unstable_cache(
    async () => {
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
    },
    ['getLatestPosts', String(limit), String(categoryId ?? '')],
    { tags: [CACHE_TAGS.posts] },
  )()
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
 *
 * Fase 8: cacheado con `unstable_cache`, tags `posts` + `category:{id}` -
 * cualquier cambio de la Category (incluido su `slug`, que puede requerir
 * poblar el `primaryCategory` embebido con datos nuevos) invalida este
 * listado, además de cualquier publish/update de Post.
 */
export async function getPostsByCategory({ categoryId, limit = 6, page }: GetPostsByCategoryArgs) {
  return unstable_cache(
    async () => {
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
    },
    ['getPostsByCategory', String(categoryId), String(limit), String(page ?? '')],
    { tags: [CACHE_TAGS.posts, CACHE_TAGS.category(categoryId)] },
  )()
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
 *
 * Fase 8: cacheado con `unstable_cache`, tag `post:{slug}` (más `posts` -
 * el `id` real no se conoce hasta que la consulta resuelve, así que no
 * puede ser un tag de antemano; `invalidatePost()` invalida por `id` y por
 * `slug` a la vez, ver `src/lib/cache/invalidate.ts`).
 */
export async function getPostBySlug({ slug }: GetPostBySlugArgs) {
  return unstable_cache(
    async () => {
      return findOnePublished({
        collection: 'posts',
        depth: 2,
        where: { slug: { equals: slug } },
      })
    },
    ['getPostBySlug', slug],
    { tags: [CACHE_TAGS.post(slug), CACHE_TAGS.posts] },
  )()
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
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'posts',
        depth: 1,
        limit,
        sort: '-publishedAt',
        where: { featured: { equals: true } },
        select: { content: false },
      })

      return result.docs
    },
    ['getFeaturedPosts', String(limit)],
    { tags: [CACHE_TAGS.posts] },
  )()
}

type GetNewestPostPerCategoryArgs = {
  limit?: number
}

/**
 * One post (the most recent) per category, combined and re-sorted by
 * publish date. N+1 queries (one per category) — acceptable at this
 * category count (~5).
 *
 * Fase 8: cacheado como una sola unidad (tag `posts`) - no se cachea cada
 * sub-consulta por categoría por separado, ya que el resultado combinado
 * es lo único que un consumidor pide.
 */
export async function getNewestPostPerCategory({ limit = 5 }: GetNewestPostPerCategoryArgs = {}) {
  return unstable_cache(
    async () => {
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
    },
    ['getNewestPostPerCategory', String(limit)],
    { tags: [CACHE_TAGS.posts] },
  )()
}

export type SitemapPostEntry = {
  slug: string
  primaryCategorySlug: string
  updatedAt: string
}

/**
 * Proyección estrecha para `app/sitemap.ts` (§42): todos los Posts
 * publicados, solo `slug`/`primaryCategory.slug`/`updatedAt` - nunca
 * `content` ni ningún otro campo. Tag `sitemap` únicamente: cada hook de
 * invalidación de Post/Category ya revalida ese tag explícitamente
 * (`src/lib/cache/invalidate.ts`).
 */
export async function getPublishedPostsForSitemap(): Promise<SitemapPostEntry[]> {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'posts',
        depth: 1,
        limit: 0,
        select: { slug: true, primaryCategory: true, updatedAt: true },
      })

      const entries: SitemapPostEntry[] = []
      for (const post of result.docs) {
        const category = post.primaryCategory
        if (category && typeof category === 'object') {
          entries.push({ slug: post.slug, primaryCategorySlug: category.slug, updatedAt: post.updatedAt })
        }
      }

      return entries
    },
    ['getPublishedPostsForSitemap'],
    { tags: [CACHE_TAGS.sitemap] },
  )()
}

export type LlmsPostEntry = {
  title: string
  excerpt?: string
  slug: string
  primaryCategorySlug: string
}

/**
 * Proyección estrecha para `/llms.txt` (§41.6): Posts publicados recientes,
 * acotados a `limit`, con `title`/`excerpt`/`slug`/`primaryCategory.slug` -
 * nunca `content`. Tag `llms` - cada hook de invalidación de Post/Category
 * ya revalida ese tag explícitamente.
 */
export async function getPublishedPostsForLlms({ limit = 25 }: { limit?: number } = {}): Promise<LlmsPostEntry[]> {
  return unstable_cache(
    async () => {
      const result = await findPublished({
        collection: 'posts',
        depth: 1,
        limit,
        sort: '-publishedAt',
        select: { title: true, excerpt: true, slug: true, primaryCategory: true },
      })

      const entries: LlmsPostEntry[] = []
      for (const post of result.docs) {
        const category = post.primaryCategory
        if (category && typeof category === 'object') {
          entries.push({
            title: post.title,
            excerpt: post.excerpt ?? undefined,
            slug: post.slug,
            primaryCategorySlug: category.slug,
          })
        }
      }

      return entries
    },
    ['getPublishedPostsForLlms', String(limit)],
    { tags: [CACHE_TAGS.llms] },
  )()
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
  return unstable_cache(
    async () => {
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
    },
    ['getRelatedPosts', String(postId), String(primaryCategoryId), String(limit)],
    { tags: [CACHE_TAGS.posts, CACHE_TAGS.category(primaryCategoryId)] },
  )()
}
