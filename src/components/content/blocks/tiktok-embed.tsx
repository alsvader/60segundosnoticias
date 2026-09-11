'use client'

import { useState } from 'react'

import { EmbedLinkCard } from '@/components/content/blocks/embed-link-card'

type TikTokEmbedProps = {
  url: string
}

const VIDEO_ID_PATTERN = /\/video\/(\d+)/

function extractTikTokVideoId(url: string): string | null {
  const match = VIDEO_ID_PATTERN.exec(url)
  return match ? match[1] : null
}

/**
 * TikTok's Embed Player (`developers.tiktok.com/docs/en/embed-player`) — a
 * bare video iframe, unlike the oEmbed `blockquote.tiktok-embed` widget
 * `react-social-media-embed` uses, which always renders TikTok's full white
 * post card (avatar, caption, like/share counts) around the video. Only the
 * numeric video id (never the raw admin-supplied URL) is interpolated into
 * the iframe `src`.
 */
export function TikTokEmbed({ url }: TikTokEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const videoId = extractTikTokVideoId(url)

  if (!videoId) {
    return <EmbedLinkCard href={url} label="Ver video en TikTok" />
  }

  return (
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-lg" style={{ aspectRatio: '9 / 16' }}>
      {!loaded ? (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse rounded-lg border border-[var(--border-default)] bg-[var(--paper-100)]"
        />
      ) : null}
      <iframe
        src={`https://www.tiktok.com/player/v1/${videoId}`}
        title="Video de TikTok"
        allow="fullscreen"
        loading="lazy"
        className="relative h-full w-full rounded-lg"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
