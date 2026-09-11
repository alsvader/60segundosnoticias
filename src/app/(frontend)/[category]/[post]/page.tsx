import { notFound, permanentRedirect } from 'next/navigation'

import { ArticleAside } from '@/components/content/article-aside'
import { ArticleHeader } from '@/components/content/article-header'
import { AuthorCard } from '@/components/content/author-card'
import { LexicalRenderer } from '@/components/content/lexical-renderer'
import { RelatedPosts } from '@/components/content/related-posts'
import { ShareActions } from '@/components/content/share-actions'
import { ArticleMetadata } from '@/components/editorial/article-metadata'
import { Container } from '@/components/layout/container'
import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { getArticleSidebar, getArticleSidebarHeading, getArticleSidebarPosts } from '@/lib/data/article-sidebar'
import { getPostBySlug, getRelatedPosts } from '@/lib/data/posts'
import { getPostUrl } from '@/lib/url/canonical'
import { mapPostToArticleCardData } from '@/lib/view-models/article-card'
import { mapPostToArticleDetailData } from '@/lib/view-models/article'

type ArticlePageProps = {
  params: Promise<{ category: string; post: string }>
}

/**
 * `/<category>/<post>` (article-page): canonical resolution first, then
 * composition in the exact §34 order (breadcrumb/category/H1/excerpt →
 * metadata+share → featured image → content → tags → share → author →
 * related). The categoría-incorrecta redirect is a live, computed
 * correction (`permanentRedirect`) — never a `Redirects` collection write,
 * which stays Fase 8.
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category: requestedCategorySlug, post: postSlug } = await params

  const post = await getPostBySlug({ slug: postSlug })
  if (!post) {
    notFound()
  }

  const article = mapPostToArticleDetailData(post)
  if (!article) {
    notFound()
  }

  const primaryCategory =
    post.primaryCategory && typeof post.primaryCategory === 'object' ? post.primaryCategory : undefined
  if (!primaryCategory) {
    notFound()
  }

  if (requestedCategorySlug !== primaryCategory.slug) {
    permanentRedirect(getPostUrl(primaryCategory.slug, post.slug))
  }

  const relatedPosts = (
    await getRelatedPosts({
      postId: post.id,
      primaryCategoryId: primaryCategory.id,
    })
  )
    .map((relatedPost) => mapPostToArticleCardData(relatedPost))
    .filter((card) => card !== undefined)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const canonicalUrl = new URL(article.href, siteUrl).toString()

  const sidebar = await getArticleSidebar()
  const sidebarPosts = sidebar.postsPanel?.enabled
    ? (
        await getArticleSidebarPosts({
          mode: sidebar.postsPanel.mode ?? 'latest',
          limit: sidebar.postsPanel.limit ?? 5,
          excludePostId: post.id,
        })
      )
        .map((sidebarPost) => mapPostToArticleCardData(sidebarPost))
        .filter((card) => card !== undefined)
    : []

  return (
    <Container as="article" className="flex flex-col gap-8 py-8 md:py-12">
      <ArticleHeader
        article={article}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: article.primaryCategory.name, href: article.primaryCategory.href },
          { label: article.title },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <ArticleMetadata
          variant="detailed"
          data={{
            authorName: article.author?.displayName,
            authorAvatar: article.author?.avatar,
            publishedAtLabel: article.publishedAtLabel,
            readingTimeMinutes: article.readingTimeMinutes,
          }}
        />
        <ShareActions url={canonicalUrl} title={article.title} />
      </div>

      {article.featuredImage ? (
        <figure>
          <ResponsiveMedia src={article.featuredImage.url} alt={article.featuredImage.alt} aspectRatio="16/9" priority />
          {article.featuredImage.caption || article.photoCredits ? (
            <figcaption className="type-metadata mt-2 text-[var(--ink-700)]">
              {article.featuredImage.caption}
              {article.photoCredits ? <span className="text-[var(--ink-500)]"> · {article.photoCredits}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {sidebarPosts.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="min-w-0">
            <LexicalRenderer content={article.content} />
            {article.source ? (
              <p className="type-body mt-6 font-bold text-[var(--ink-700)]">Fuente: {article.source}</p>
            ) : null}
          </div>
          <ArticleAside
            heading={getArticleSidebarHeading(sidebar.postsPanel?.mode ?? 'latest', sidebar.postsPanel?.heading)}
            posts={sidebarPosts}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[70ch]">
          <LexicalRenderer content={article.content} />
          {article.source ? (
            <p className="type-body mt-6 font-bold text-[var(--ink-700)]">Fuente: {article.source}</p>
          ) : null}
        </div>
      )}

      {article.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="type-metadata rounded-full bg-[var(--paper-100)] px-3 py-1 text-[var(--ink-700)]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <ShareActions url={canonicalUrl} title={article.title} />

      {article.author ? <AuthorCard author={article.author} /> : null}

      <RelatedPosts posts={relatedPosts} />
    </Container>
  )
}
