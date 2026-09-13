import { toAbsoluteMediaUrl } from '@/lib/seo/metadata'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import type { AuthorSummary } from '@/lib/view-models/author'
import type { SiteSetting } from '@/payload-types'

/**
 * The only place JSON-LD is rendered. `JSON.stringify` + escaping `<`
 * before `dangerouslySetInnerHTML` is the correct way to embed JSON-LD in
 * React/Next - a `<script>` with plain text children would be HTML-escaped
 * by React, corrupting the JSON. Editorial text (titles, excerpts, author
 * bios) is untrusted enough that a literal `</script>` inside it would
 * otherwise break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

/** Single source for publisher/Organization identity (AC-SEO-008) - never re-derived independently per page. */
export function resolveOrganizationInfo(settings: SiteSetting): { name: string; logoUrl?: string } {
  const name = settings.organization?.organizationName || settings.branding?.siteName || '60 Segundos Noticias'
  const logo = mapMediaToMediaData(settings.organization?.organizationLogo ?? settings.branding?.logo, {
    preferredSize: 'card',
    fallbackAlt: name,
  })

  return { name, logoUrl: logo ? toAbsoluteMediaUrl(logo.url) : undefined }
}

type OrganizationInput = {
  name: string
  url: string
  logoUrl?: string
}

/** §41.5 Organization - publisher identity, always sourced from `SiteSettings.organization` (AC-SEO-008), never hardcoded per page. */
export function buildOrganizationJsonLd({ name, url, logoUrl }: OrganizationInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logoUrl ? { logo: logoUrl } : {}),
  }
}

/** §41.5 WebSite - Home only. */
export function buildWebsiteJsonLd({ name, url }: { name: string; url: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  }
}

type BreadcrumbItem = { name: string; url?: string }

/** §41.5 BreadcrumbList - Article and Category, matching the breadcrumbs already rendered in both. */
export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  }
}

type PublisherInput = {
  name: string
  logoUrl?: string
}

type NewsArticleInput = {
  headline: string
  description?: string
  url: string
  imageUrl?: string
  datePublished?: string | null
  dateModified?: string | null
  /**
   * Only the existing public `AuthorSummary` allowlist
   * (`displayName`/`slug`/`avatar`/`bio`) - never the raw `User`/
   * `Post.author` relation, so `email`/`role`/`active` can never leak here.
   */
  author?: AuthorSummary
  publisher: PublisherInput
}

/** §41.5 NewsArticle (AC-SEO-006) - the schema.org type this product actually is, not a generic `Article`. */
export function buildNewsArticleJsonLd(input: NewsArticleInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    author: input.author ? { '@type': 'Person', name: input.author.displayName } : undefined,
    publisher: {
      '@type': 'Organization',
      name: input.publisher.name,
      ...(input.publisher.logoUrl ? { logo: { '@type': 'ImageObject', url: input.publisher.logoUrl } } : {}),
    },
  }
}
