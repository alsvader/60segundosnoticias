import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useId } from 'react'

import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import type { ResolvedLink } from '@/lib/url/resolve-link'
import { cn } from '@/lib/utils'

export type BannerVariant = 'editorial' | 'promotional' | 'dark'

/**
 * `full-bleed` (Home): the background spans the whole viewport and the
 * content sits in the site `Container`, like every other Home Section.
 * `contained` (Pages): the Page route already wraps every block in a
 * `Container`, so the same content renders as a rounded card instead of
 * nesting a second `Container` (double gutter, clipped background).
 */
export type BannerLayout = 'full-bleed' | 'contained'

export type BannerData = {
  title?: string | null
  description?: string | null
  image?: {
    src: string
    alt: string
    /** Intrinsic size: lets the image keep its own proportions instead of a cropped box. */
    width?: number
    height?: number
  } | null
  link?: ResolvedLink
  variant: BannerVariant
}

type BannerSectionProps = {
  banner: BannerData
  layout?: BannerLayout
  className?: string
}

type VariantStyles = {
  surface: string
  mark: string
  title: string
  description: string
  button: 'default' | 'secondary'
  /** The default `--ring` is brand red — invisible on the red/ink surfaces, so those use a paper ring. */
  focus?: string
}

/**
 * Only existing tokens (design.md D5). `editorial` uses paper-200 rather
 * than paper-100 so it doesn't dissolve into the page background.
 */
const VARIANT_STYLES: Record<BannerVariant, VariantStyles> = {
  editorial: {
    surface: 'texture-paper-grain border-[var(--border-default)] bg-[var(--paper-200)]',
    mark: 'bg-[var(--brand-red-500)]',
    title: 'text-[var(--ink-950)]',
    description: 'text-[var(--ink-700)]',
    button: 'default',
  },
  promotional: {
    surface: 'border-transparent bg-[var(--brand-red-500)]',
    mark: 'bg-[var(--paper-50)]',
    title: 'text-[var(--paper-50)]',
    description: 'text-[var(--paper-50)]',
    button: 'secondary',
    focus: 'focus-visible:ring-[var(--paper-50)]',
  },
  dark: {
    surface: 'border-transparent bg-[var(--ink-950)]',
    mark: 'bg-[var(--brand-red-500)]',
    title: 'text-[var(--paper-50)]',
    description: 'text-[var(--paper-200)]',
    button: 'default',
    focus: 'focus-visible:ring-[var(--paper-50)]',
  },
}

type BannerContentProps = {
  banner: BannerData
  titleId: string
  styles: VariantStyles
}

/**
 * Same content for both layouts. Composition follows the data, not an
 * Admin setting (design.md D3): no image → centered; image → two columns
 * from `lg`, stacked (text, CTA, image) below it. The image keeps its own
 * shape (no crop).
 */
function BannerContent({ banner, titleId, styles }: BannerContentProps) {
  const hasImage = Boolean(banner.image)

  return (
    <div className={cn('grid items-center gap-8', hasImage && 'lg:grid-cols-[3fr_2fr] lg:gap-12')}>
      <div
        className={cn(
          'flex flex-col gap-4',
          hasImage ? 'items-start' : 'mx-auto max-w-3xl items-center text-center',
        )}
      >
        <span aria-hidden="true" className={cn('h-1 w-12 rounded-full', styles.mark)} />
        {banner.title ? (
          <h2 id={titleId} className={cn('type-h2 uppercase', styles.title)}>
            {banner.title}
          </h2>
        ) : null}
        {banner.description ? (
          <p className={cn('type-lead max-w-prose', styles.description)}>{banner.description}</p>
        ) : null}
        {banner.link ? (
          <Button
            asChild
            size="lg"
            variant={styles.button}
            className={cn('type-label-uppercase mt-2 h-11 px-5 text-base', styles.focus)}
          >
            <Link
              href={banner.link.href}
              target={banner.link.openInNewTab ? '_blank' : undefined}
              rel={banner.link.external ? 'noopener noreferrer' : undefined}
            >
              {banner.link.label}
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        ) : null}
      </div>
      {banner.image ? (
        <ResponsiveMedia
          src={banner.image.src}
          alt={banner.image.alt}
          width={banner.image.width}
          height={banner.image.height}
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 576px, 100vw"
          // Natural proportions, never cropped. Bounded by the column (576px
          // on tablet) and 384px tall, so portrait images don't take over.
          className="h-auto max-h-96 w-auto max-w-full justify-self-start rounded-xl sm:max-w-xl lg:max-w-full lg:justify-self-end"
        />
      ) : null}
    </div>
  )
}

/**
 * Shared between Home (`BannerBlock`) and Pages — same visual contract
 * for both except the background width (see `BannerLayout`), so this
 * component is intentionally not nested under `sections/home/` or
 * `sections/pages/`. Presentational only — no Payload import, no data
 * fetching. An internal editorial CTA, never a paid-ad slot.
 */
export function BannerSection({ banner, layout = 'full-bleed', className }: BannerSectionProps) {
  const titleId = useId()
  const styles = VARIANT_STYLES[banner.variant]
  const labelledBy = banner.title ? titleId : undefined
  const content = <BannerContent banner={banner} titleId={titleId} styles={styles} />

  if (layout === 'contained') {
    return (
      <section aria-labelledby={labelledBy} className={cn('py-8 md:py-12', className)}>
        <div className={cn('overflow-hidden rounded-xl border p-6 sm:p-10', styles.surface)}>{content}</div>
      </section>
    )
  }

  return (
    <section aria-labelledby={labelledBy} className={cn('border-y py-12 md:py-16', styles.surface, className)}>
      <Container>{content}</Container>
    </section>
  )
}
