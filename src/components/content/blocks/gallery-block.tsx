import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import type { GalleryBlock } from '@/payload-types'

type GalleryBlockViewProps = {
  block: GalleryBlock
}

/**
 * `carousel` reuses the exact native `overflow-x-auto` + CSS scroll-snap
 * pattern already established in Fase 6 (`FeaturedPostsSection`/
 * `PostsByCategorySection`) - keyboard/touch accessible without a
 * carousel library (AC-BLOCK-GAL-002).
 */
export function GalleryBlockView({ block }: GalleryBlockViewProps) {
  const images = block.images
    .map((item) => ({ media: mapMediaToMediaData(item.image, { preferredSize: 'desktop' }), caption: item.caption }))
    .filter((item): item is { media: NonNullable<typeof item.media>; caption: string | null | undefined } =>
      Boolean(item.media),
    )

  if (images.length === 0) return null

  if (block.layout === 'carousel') {
    return (
      <div className="my-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {images.map(({ media, caption }) => (
          <figure key={media.id} className="w-72 shrink-0 snap-start">
            <ResponsiveMedia src={media.url} alt={media.alt} aspectRatio="4/3" />
            {caption ? <figcaption className="type-metadata mt-2 text-[var(--ink-700)]">{caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {images.map(({ media, caption }) => (
        <figure key={media.id}>
          <ResponsiveMedia src={media.url} alt={media.alt} aspectRatio="1/1" />
          {caption ? <figcaption className="type-metadata mt-2 text-[var(--ink-700)]">{caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}
