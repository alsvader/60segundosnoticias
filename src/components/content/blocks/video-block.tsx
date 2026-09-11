import { VideoPlayer } from '@/components/content/video-player'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import { resolveExternalVideoUrl } from '@/lib/editorial/video-provider'
import type { VideoBlock } from '@/payload-types'

type VideoBlockViewProps = {
  block: VideoBlock
}

/**
 * `youtube`/`vimeo` reuse `resolveExternalVideoUrl()` unmodified (same
 * allowlist as Home's `VideoFeature`) — only a validated `{provider,
 * embedId}` ever becomes the `src` handed to Vidstack, never
 * `block.url` raw. `uploaded` passes the resolved Media file URL
 * directly. No manual play/iframe state here anymore — `VideoPlayer`
 * (Vidstack) owns that entirely.
 */
export function VideoBlockView({ block }: VideoBlockViewProps) {
  const poster = mapMediaToMediaData(block.poster, { preferredSize: 'desktop' })
  const title = block.caption ?? 'Video'

  let src: string | undefined
  let isPortrait = Boolean(block.portrait)
  if (block.provider === 'uploaded') {
    const video = mapMediaToMediaData(block.video, { preferredSize: 'desktop' })
    src = video?.url
  } else {
    const external = resolveExternalVideoUrl(block.url)
    src = external ? `${external.provider}/${external.embedId}` : undefined
    if (external?.isVertical) isPortrait = true
  }

  if (!src) return null

  return (
    <figure className="my-8">
      <VideoPlayer
        src={src}
        title={title}
        poster={poster ? { url: poster.url, alt: title, width: poster.width, height: poster.height } : undefined}
        className={isPortrait ? 'editorial-video-player--portrait mx-auto aspect-[9/16] max-w-[420px]' : undefined}
        aspectRatio={isPortrait ? '9/16' : undefined}
      />
      {block.caption ? <figcaption className="type-metadata mt-2 text-[var(--ink-700)]">{block.caption}</figcaption> : null}
    </figure>
  )
}
