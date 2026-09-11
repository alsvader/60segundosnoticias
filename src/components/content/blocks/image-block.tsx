import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import { cn } from '@/lib/utils'
import type { ImageBlock } from '@/payload-types'

const SIZE_CLASSES: Record<NonNullable<ImageBlock['size']>, string> = {
  small: 'mx-auto max-w-[320px]',
  medium: 'mx-auto max-w-[560px]',
  large: '',
  // Same max-width as the article's own content column (the `mx-auto
  // w-full max-w-[70ch]` div wrapping LexicalRenderer) — the figure already
  // sits inside that column, so this matches `large` in practice rather
  // than breaking out past it.
  full: 'mx-auto w-full max-w-[70ch]',
}

type ImageBlockViewProps = {
  block: ImageBlock
}

/**
 * `size` is restricted to small/medium/large/full at the schema level
 * (AC-BLOCK-IMG-001) - no arbitrary CSS/margins/classes ever come from
 * Payload (AC-BLOCK-IMG-002), only this fixed class map. Renders at the
 * image's natural aspect ratio (via `media.width`/`height`) instead of
 * forcing a 16:9 crop.
 */
export function ImageBlockView({ block }: ImageBlockViewProps) {
  const media = mapMediaToMediaData(block.image, { preferredSize: 'desktop' })
  if (!media) return null

  const caption = block.caption ?? media.caption
  const credits = block.credits ?? media.credits
  const size = block.size ?? 'large'

  return (
    <figure className={cn('my-8', SIZE_CLASSES[size])}>
      <ResponsiveMedia src={media.url} alt={media.alt} width={media.width} height={media.height} />
      {caption || credits ? (
        <figcaption className="type-metadata mt-2 text-[var(--ink-700)]">
          {caption}
          {credits ? <span className="text-[var(--ink-500)]"> · {credits}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
