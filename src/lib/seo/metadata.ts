import 'server-only'

import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { getAbsoluteUrl } from '@/lib/url/canonical'
import { mapMediaToMediaData } from '@/lib/view-models/media'

/**
 * Centraliza `generateMetadata` para Home/Category/Article/Page (§41):
 * cadena de fallback SEO del documento -> contenido -> `SiteSettings.seo`,
 * y un único origen absoluto (`getAbsoluteUrl()`, Decisión 1) para
 * canonical/OpenGraph - nunca una URL construida ad hoc por página.
 */

type SeoOverride =
  | {
      metaTitle?: string | null
      metaDescription?: string | null
      metaImage?: (number | null) | Media
      canonicalURL?: string | null
      noIndex?: boolean | null
    }
  | null
  | undefined

export type SiteMetadataDefaults = {
  siteName: string
  defaultMetaTitle?: string | null
  defaultMetaDescription?: string | null
  defaultMetaImage?: (number | null) | Media
}

/** Payload Media URLs are relative in development (`/api/media/file/...`) and may be absolute in production (S3 public URL) - OG images (and JSON-LD images) always need an absolute URL regardless. */
export function toAbsoluteMediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : getAbsoluteUrl(url)
}

type BuildMetadataArgs = {
  seo?: SeoOverride
  fallbackTitle: string
  fallbackDescription?: string | null
  fallbackImage?: (number | null) | Media
  canonicalPath: string
  siteDefaults: SiteMetadataDefaults
}

type BuildArticleMetadataArgs = BuildMetadataArgs & {
  publishedTime?: string | null
  modifiedTime?: string | null
  authorName?: string | null
}

function resolveCore(args: BuildMetadataArgs) {
  const { seo, fallbackTitle, fallbackDescription, fallbackImage, canonicalPath, siteDefaults } = args

  const title = seo?.metaTitle || fallbackTitle || siteDefaults.defaultMetaTitle || siteDefaults.siteName
  const description = seo?.metaDescription || fallbackDescription || siteDefaults.defaultMetaDescription || undefined
  const mediaData = mapMediaToMediaData(seo?.metaImage ?? fallbackImage ?? siteDefaults.defaultMetaImage, {
    preferredSize: 'tablet',
    fallbackAlt: title,
  })
  const canonicalUrl = seo?.canonicalURL || getAbsoluteUrl(canonicalPath)
  const noIndex = seo?.noIndex ?? false

  return { title, description, mediaData, canonicalUrl, noIndex }
}

/** Home / Category / Page - OpenGraph `type: 'website'`. */
export function buildMetadata(args: BuildMetadataArgs): Metadata {
  const { title, description, mediaData, canonicalUrl, noIndex } = resolveCore(args)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: args.siteDefaults.siteName,
      locale: 'es_MX',
      images: mediaData
        ? [{ url: toAbsoluteMediaUrl(mediaData.url), width: mediaData.width, height: mediaData.height, alt: mediaData.alt }]
        : undefined,
    },
  }
}

/** Article - OpenGraph `type: 'article'` with published/modified time and author (§41.1, AC-SEO-001). */
export function buildArticleMetadata(args: BuildArticleMetadataArgs): Metadata {
  const { title, description, mediaData, canonicalUrl, noIndex } = resolveCore(args)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: args.siteDefaults.siteName,
      locale: 'es_MX',
      publishedTime: args.publishedTime ?? undefined,
      modifiedTime: args.modifiedTime ?? undefined,
      authors: args.authorName ? [args.authorName] : undefined,
      images: mediaData
        ? [{ url: toAbsoluteMediaUrl(mediaData.url), width: mediaData.width, height: mediaData.height, alt: mediaData.alt }]
        : undefined,
    },
  }
}
