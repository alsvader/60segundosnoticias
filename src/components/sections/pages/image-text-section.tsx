import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import { cn } from '@/lib/utils'
import type { ImageTextBlock } from '@/payload-types'

type ImageTextSectionProps = {
  block: ImageTextBlock
}

export function ImageTextSection({ block }: ImageTextSectionProps) {
  const image = mapMediaToMediaData(block.image, { preferredSize: 'tablet', fallbackAlt: block.title ?? '' })
  const imagePosition = block.imagePosition ?? 'left'

  return (
    <section className="py-8 md:py-12">
      <div className={cn('grid gap-8 md:grid-cols-2 md:items-center', imagePosition === 'right' && 'md:[&>*:first-child]:order-2')}>
        {image ? <ResponsiveMedia src={image.url} alt={image.alt} aspectRatio="4/3" /> : null}
        <div className="flex flex-col gap-3">
          {block.eyebrow ? <p className="type-label-uppercase text-[var(--brand-red-500)]">{block.eyebrow}</p> : null}
          {block.title ? (
            <h2 className="type-section-heading font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
              {block.title}
            </h2>
          ) : null}
          {block.content ? <p className="type-body text-[var(--ink-700)]">{block.content}</p> : null}
        </div>
      </div>
    </section>
  )
}
