import type { Media } from '@/payload-types'

export type MediaSizeName = 'thumbnail' | 'card' | 'tablet' | 'desktop' | 'hero'

export type MediaData = {
  id: number
  url: string
  alt: string
  width?: number
  height?: number
  caption?: string
  credits?: string
}

type MapMediaOptions = {
  /** Which generated size to prefer - never 'hero' for card/list contexts (AC-MEDIA-004). */
  preferredSize?: MediaSizeName
  /** Used only if the Media document itself has no `alt` set. */
  fallbackAlt?: string
}

/**
 * Normalizes a Payload Media relationship (populated object, bare ID, or
 * absent) into the frontend-safe MediaData contract. Returns undefined
 * when there is nothing to render - callers must handle that themselves
 * (ArticleCardData.image is optional for exactly this reason).
 */
export function mapMediaToMediaData(
  media: Media | number | null | undefined,
  options: MapMediaOptions = {},
): MediaData | undefined {
  if (!media || typeof media === 'number') {
    return undefined
  }

  const { preferredSize = 'card', fallbackAlt = '' } = options
  const preferred = media.sizes?.[preferredSize]
  const url = preferred?.url ?? media.url

  if (!url) {
    return undefined
  }

  return {
    id: media.id,
    url,
    alt: media.alt || fallbackAlt,
    width: preferred?.width ?? media.width ?? undefined,
    height: preferred?.height ?? media.height ?? undefined,
    caption: media.caption ?? undefined,
    credits: media.credits ?? undefined,
  }
}
