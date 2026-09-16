import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'

import Image from 'next/image'
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'

import { cn } from '@/lib/utils'

type VideoPlayerProps = {
  /** Already resolved by the caller: `youtube/{id}`, `vimeo/{id}`, or a direct file URL — never a raw, unvalidated URL (see `resolveExternalVideoUrl()`). */
  src: string
  title: string
  poster?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  className?: string
  /** Forwarded to Vidstack's `MediaPlayer` — e.g. `"9/16"` for a portrait video. Unset keeps Vidstack's own default (16/9). */
  aspectRatio?: string
}

/**
 * Shared Vidstack wrapper for both the Article/Page `VideoBlock` and
 * Home's `VideoFeature` (embed case) — one player, one theme, instead of
 * duplicating the hand-rolled iframe/play-button pattern in two places.
 * Vidstack's own package already carries `'use client'` at its entry, so
 * this component (and its callers) don't need the directive themselves;
 * play/pause/fullscreen state lives entirely inside Vidstack, not in our
 * own `useState`. `autoPlay`/`muted` are never set — both default to
 * `false` in Vidstack, matching "never autoplay with audio" (AC-BLOCK-VID-003).
 */
export function VideoPlayer({ src, title, poster, className, aspectRatio }: VideoPlayerProps) {
  return (
    <MediaPlayer
      className={cn('editorial-video-player w-full overflow-hidden rounded-xl', className)}
      src={src}
      title={title}
      aspectRatio={aspectRatio}
      playsInline
      crossOrigin
    >
      <MediaProvider>
        {poster ? (
          <Poster asChild alt={poster.alt}>
            <Image
              src={poster.url}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              unoptimized
              className="object-cover"
              alt={poster.alt}
            />
          </Poster>
        ) : null}
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}
