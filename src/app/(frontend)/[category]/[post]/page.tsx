import { cache } from 'react'
import { draftMode } from 'next/headers'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { ArticleAside } from '@/components/content/article-aside'
import { ArticleHeader } from '@/components/content/article-header'
import { LexicalRenderer } from '@/components/content/lexical-renderer'
import { RelatedPosts } from '@/components/content/related-posts'
import { ShareActions } from '@/components/content/share-actions'
import { ArticleMetadata } from '@/components/editorial/article-metadata'
import { Container } from '@/components/layout/container'
import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { getArticleSidebar, getArticleSidebarHeading, getArticleSidebarPosts } from '@/lib/data/article-sidebar'
import { getPostBySlug, getRelatedPosts } from '@/lib/data/posts'
import { findActiveRedirectByPath } from '@/lib/data/redirects'
import { getSettings } from '@/lib/data/settings'
import { findDraftPostBySlug } from '@/lib/preview/draft-documents'
import { applyStoredRedirect } from '@/lib/redirects/apply-redirect'
import { buildBreadcrumbListJsonLd, buildNewsArticleJsonLd, JsonLd, resolveOrganizationInfo } from '@/lib/seo/json-ld'
import { buildArticleMetadata, toAbsoluteMediaUrl, type SiteMetadataDefaults } from '@/lib/seo/metadata'
import { getAbsoluteUrl, getPostUrl } from '@/lib/url/canonical'
import { mapPostToArticleCardData } from '@/lib/view-models/article-card'
import { mapPostToArticleDetailData } from '@/lib/view-models/article'

type ArticlePageProps = {
  params: Promise<{ category: string; post: string }>
}

/**
 * Dedupe por request entre `generateMetadata` y el render de la página -
 * un argumento primitivo (`slug`), no un objeto literal, para que `cache()`
 * memoice de forma confiable. Draft Mode habilita el bypass de cache, pero
 * no le dice a Payload que debe devolver la versión en Draft - eso se pide
 * explícitamente aquí (`findDraftPostBySlug`). Sin esta rama, Preview
 * redirigiría correctamente pero renderizaría igual el contenido
 * publicado (hallazgo real durante la verificación en vivo, sección 16).
 */
const loadPost = cache(async (slug: string) => {
  const { isEnabled } = await draftMode()
  if (isEnabled) {
    const draft = await findDraftPostBySlug(await headers(), slug)
    if (draft) return draft
  }
  return getPostBySlug({ slug })
})

/**
 * Metadata de Article (§41.1, AC-SEO-001/002/006): siempre usa la
 * `primaryCategory` real del Post para el canonical, nunca la categoría
 * solicitada en la URL - la misma garantía que ya aplica `permanentRedirect`
 * en el render de la página.
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category: requestedCategorySlug, post: postSlug } = await params

  const post = await loadPost(postSlug)
  if (!post) {
    const redirect = await findActiveRedirectByPath(`/${requestedCategorySlug}/${postSlug}`)
    if (redirect) {
      applyStoredRedirect(redirect.to, redirect.statusCode)
    }
    notFound()
  }

  const primaryCategory = post.primaryCategory && typeof post.primaryCategory === 'object' ? post.primaryCategory : undefined
  if (!primaryCategory) {
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

  const author = post.author && typeof post.author === 'object' ? post.author : undefined

  return buildArticleMetadata({
    seo: post.seo,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    fallbackImage: post.featuredImage,
    canonicalPath: getPostUrl(primaryCategory.slug, post.slug),
    siteDefaults,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authorName: author?.displayName,
  })
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

  const post = await loadPost(postSlug)
  if (!post) {
    const redirect = await findActiveRedirectByPath(`/${requestedCategorySlug}/${postSlug}`)
    if (redirect) {
      applyStoredRedirect(redirect.to, redirect.statusCode)
    }
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

  const canonicalUrl = getAbsoluteUrl(article.href)
  const settings = await getSettings()
  const organization = resolveOrganizationInfo(settings)

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
      <JsonLd
        data={buildNewsArticleJsonLd({
          headline: article.title,
          description: article.excerpt,
          url: canonicalUrl,
          imageUrl: article.featuredImage ? toAbsoluteMediaUrl(article.featuredImage.url) : undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: article.author,
          publisher: organization,
        })}
      />
      <JsonLd
        data={buildBreadcrumbListJsonLd([
          { name: 'Inicio', url: getAbsoluteUrl('/') },
          { name: article.primaryCategory.name, url: getAbsoluteUrl(article.primaryCategory.href) },
          { name: article.title },
        ])}
      />
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

      <RelatedPosts posts={relatedPosts} />
    </Container>
  )
}
