import { GalleryBlockView } from '@/components/content/blocks/gallery-block'
import type { GalleryBlock } from '@/payload-types'

type GallerySectionProps = {
  block: GalleryBlock
}

/**
 * `Gallery` (Page) and `GalleryBlock` (Article) share the exact same
 * Payload schema (`page-blocks`, `page-content-rendering`) - this reuses
 * the same presentational component rather than a second implementation.
 */
export function GallerySection({ block }: GallerySectionProps) {
  return (
    <section className="py-8 md:py-12">
      <GalleryBlockView block={block} />
    </section>
  )
}
