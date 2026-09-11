import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import { cn } from '@/lib/utils'
import type { HeroBlock } from '@/payload-types'

type PageHeroSectionProps = {
  block: HeroBlock
}

export function PageHeroSection({ block }: PageHeroSectionProps) {
  const image = mapMediaToMediaData(block.image, { preferredSize: 'hero', fallbackAlt: block.title })
  const alignment = block.alignment ?? 'left'

  return (
    <section className="py-8 md:py-12">
      <div className={cn('flex flex-col gap-4', alignment === 'center' ? 'items-center text-center' : 'items-start')}>
        {block.eyebrow ? (
          <p className="type-label-uppercase text-[var(--brand-red-500)]">{block.eyebrow}</p>
        ) : null}
        <h2 className="type-h1-article font-[var(--font-display)] font-bold text-[var(--ink-950)]">{block.title}</h2>
        {block.description ? <p className="type-lead max-w-prose text-[var(--ink-700)]">{block.description}</p> : null}
        {image ? <ResponsiveMedia src={image.url} alt={image.alt} aspectRatio="16/9" className="mt-4 w-full" priority /> : null}
      </div>
    </section>
  )
}
