import Link from 'next/link'

import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { Button } from '@/components/ui/button'
import type { ResolvedLink } from '@/lib/url/resolve-link'
import { cn } from '@/lib/utils'

export type BannerVariant = 'editorial' | 'promotional' | 'dark'

export type BannerData = {
  title?: string | null
  description?: string | null
  image?: {
    src: string
    alt: string
  } | null
  link?: ResolvedLink
  variant: BannerVariant
}

type BannerSectionProps = {
  banner: BannerData
  className?: string
}

const VARIANT_STYLES: Record<BannerVariant, string> = {
  editorial: 'bg-[var(--paper-100)] text-[var(--ink-950)]',
  promotional: 'bg-[var(--brand-red-500)] text-[var(--paper-50)]',
  dark: 'bg-[var(--ink-950)] text-[var(--paper-50)]',
}

/**
 * Shared between Home (`BannerBlock`) and, from Fase 7 onward, Pages —
 * same visual contract for both, so this component is intentionally not
 * nested under `sections/home/` or `sections/pages/`. Presentational
 * only — no Payload import, no data fetching.
 */
export function BannerSection({ banner, className }: BannerSectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 overflow-hidden rounded-xl border border-[var(--border-default)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10',
        VARIANT_STYLES[banner.variant],
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        {banner.title ? <h2 className="type-h3 font-[var(--font-display)] font-semibold">{banner.title}</h2> : null}
        {banner.description ? <p className="type-body max-w-prose">{banner.description}</p> : null}
        {banner.link ? (
          <Button asChild variant={banner.variant === 'editorial' ? 'default' : 'outline'} className="w-fit">
            <Link
              href={banner.link.href}
              target={banner.link.openInNewTab ? '_blank' : undefined}
              rel={banner.link.external ? 'noopener noreferrer' : undefined}
            >
              {banner.link.label}
            </Link>
          </Button>
        ) : null}
      </div>
      {banner.image ? (
        <ResponsiveMedia
          src={banner.image.src}
          alt={banner.image.alt}
          aspectRatio="16/9"
          className="w-full shrink-0 rounded-lg sm:w-64"
        />
      ) : null}
    </div>
  )
}
