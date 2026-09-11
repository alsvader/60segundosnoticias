export type ExternalVideoProvider = 'youtube' | 'vimeo'

export type ExternalVideo = {
  provider: ExternalVideoProvider
  embedId: string
  /** `true` only for a detected YouTube Shorts URL — Vimeo has no URL-based orientation signal. */
  isVertical?: boolean
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'])
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

function extractYoutubeId(url: URL): { embedId: string; isShort: boolean } | undefined {
  if (url.hostname === 'youtu.be') {
    const embedId = url.pathname.replace(/^\//, '')
    return embedId ? { embedId, isShort: false } : undefined
  }

  if (url.pathname === '/watch') {
    const embedId = url.searchParams.get('v')
    return embedId ? { embedId, isShort: false } : undefined
  }

  const embedMatch = /^\/embed\/([^/]+)/.exec(url.pathname)
  if (embedMatch) return { embedId: embedMatch[1], isShort: false }

  const shortsMatch = /^\/shorts\/([^/]+)/.exec(url.pathname)
  if (shortsMatch) return { embedId: shortsMatch[1], isShort: true }

  return undefined
}

function extractVimeoId(url: URL): string | undefined {
  const match = /\/(?:video\/)?(\d+)/.exec(url.pathname)
  return match?.[1]
}

/**
 * Home `VideoFeatureBlock.source: 'external'` (Phase 6) SHALL only accept
 * YouTube/Vimeo URLs, validated server-side by hostname - never an
 * arbitrary iframe/embed (AC-EMBED-001, AC-HOME-013). Deliberately not
 * reused from `src/payload/blocks/article/VideoBlock.ts`, which is only
 * an admin-selected provider field with no URL parser of its own.
 */
export function resolveExternalVideoUrl(rawUrl: string | null | undefined): ExternalVideo | undefined {
  if (!rawUrl) return undefined

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return undefined
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined

  const hostname = url.hostname.toLowerCase()

  if (YOUTUBE_HOSTS.has(hostname)) {
    const result = extractYoutubeId(url)
    return result ? { provider: 'youtube', embedId: result.embedId, isVertical: result.isShort } : undefined
  }

  if (VIMEO_HOSTS.has(hostname)) {
    const embedId = extractVimeoId(url)
    return embedId ? { provider: 'vimeo', embedId } : undefined
  }

  return undefined
}
