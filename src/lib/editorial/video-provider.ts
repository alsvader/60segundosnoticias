export type ExternalVideoProvider = 'youtube' | 'vimeo'

export type ExternalVideo = {
  provider: ExternalVideoProvider
  embedId: string
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'])
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

function extractYoutubeId(url: URL): string | undefined {
  if (url.hostname === 'youtu.be') {
    return url.pathname.replace(/^\//, '') || undefined
  }

  if (url.pathname === '/watch') {
    return url.searchParams.get('v') ?? undefined
  }

  const embedMatch = /^\/embed\/([^/]+)/.exec(url.pathname)
  if (embedMatch) return embedMatch[1]

  const shortsMatch = /^\/shorts\/([^/]+)/.exec(url.pathname)
  if (shortsMatch) return shortsMatch[1]

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
    const embedId = extractYoutubeId(url)
    return embedId ? { provider: 'youtube', embedId } : undefined
  }

  if (VIMEO_HOSTS.has(hostname)) {
    const embedId = extractVimeoId(url)
    return embedId ? { provider: 'vimeo', embedId } : undefined
  }

  return undefined
}
