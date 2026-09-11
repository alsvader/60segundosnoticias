import { BannerSection } from '@/components/sections/banner-section'
import { CTASection } from '@/components/sections/pages/cta-section'
import { FAQSection } from '@/components/sections/pages/faq-section'
import { GallerySection } from '@/components/sections/pages/gallery-section'
import { ImageTextSection } from '@/components/sections/pages/image-text-section'
import { PageHeroSection } from '@/components/sections/pages/page-hero-section'
import { RichTextSection } from '@/components/sections/pages/rich-text-section'
import { VideoSection } from '@/components/sections/pages/video-section'
import { mapMediaToMediaData } from '@/lib/view-models/media'
import { resolveLink } from '@/lib/url/resolve-link'
import type { Page } from '@/payload-types'

type PageBlockRendererProps = {
  blocks: NonNullable<Page['layout']>
}

/**
 * Exhaustive switch over the 8 Page Blocks (page-content-rendering),
 * same posture as `HomeBlockRenderer`: an unrecognized `blockType` is
 * logged and skipped, never breaks the rest of the Page (§61). Blocks
 * arrive already populated at query depth (`getPageBySlug`), so — unlike
 * Home — no async per-block resolver step is needed here; `banner` is the
 * only one normalized inline, to match the `BannerData` contract
 * `BannerSection` already expects.
 */
export function PageBlockRenderer({ blocks }: PageBlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'hero':
            return <PageHeroSection key={block.id ?? index} block={block} />
          case 'richText':
            return <RichTextSection key={block.id ?? index} block={block} />
          case 'imageText':
            return <ImageTextSection key={block.id ?? index} block={block} />
          case 'galleryBlock':
            return <GallerySection key={block.id ?? index} block={block} />
          case 'videoBlock':
            return <VideoSection key={block.id ?? index} block={block} />
          case 'cta':
            return <CTASection key={block.id ?? index} block={block} />
          case 'faq':
            return <FAQSection key={block.id ?? index} block={block} />
          case 'banner': {
            const image = mapMediaToMediaData(block.image, { preferredSize: 'tablet', fallbackAlt: block.title ?? '' })
            return (
              <BannerSection
                key={block.id ?? index}
                banner={{
                  title: block.title,
                  description: block.description,
                  image: image ? { src: image.url, alt: image.alt } : undefined,
                  link: resolveLink(block.link),
                  variant: block.variant ?? 'editorial',
                }}
              />
            )
          }
          default: {
            const unknown: never = block
            console.warn('PageBlockRenderer: skipping unresolvable block', unknown)
            return null
          }
        }
      })}
    </>
  )
}
