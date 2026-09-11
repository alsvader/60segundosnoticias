import { User } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import type { MediaData } from '@/lib/view-models/media'
import { cn } from '@/lib/utils'

export type ArticleMetadataData = {
  authorName?: string | null
  authorAvatar?: MediaData | null
  /** Pre-formatted date string — date formatting/locale is a data-layer concern (Phase 5). */
  publishedAtLabel?: string | null
  readingTimeMinutes?: number | null
}

type ArticleMetadataProps = {
  data: ArticleMetadataData
  /** Optional category slot (e.g. a `CategoryBadge`), rendered before the metadata line. */
  categorySlot?: ReactNode
  /**
   * `inline` (default): the original single-line "autor · fecha · lectura"
   * layout used by cards and the hero section. `detailed`: a two-line
   * byline with a circular author avatar, used by the Article page's own
   * metadata row.
   */
  variant?: 'inline' | 'detailed'
  className?: string
}

/**
 * Presentational only — no data access. Consumers pass already-resolved
 * strings; this component does not format dates or fetch author records.
 */
export function ArticleMetadata({ data, categorySlot, variant = 'inline', className }: ArticleMetadataProps) {
  if (variant === 'detailed') {
    const readingTimeLabel = formatReadingTime(data.readingTimeMinutes)

    return (
      <div className={cn('flex items-start gap-3', className)}>
        {categorySlot}
        {data.authorAvatar ? (
          <Image
            src={data.authorAvatar.url}
            alt={data.authorAvatar.alt}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--paper-200)] text-[var(--ink-700)]">
            <User className="size-5" aria-hidden />
          </div>
        )}
        <div className="flex flex-col gap-1">
          {data.publishedAtLabel || data.authorName ? (
            <p className="type-metadata text-[var(--ink-700)]">
              {data.publishedAtLabel ? `Publicado ${data.publishedAtLabel}` : null}
              {data.publishedAtLabel && data.authorName ? <br /> : null}
              {data.authorName ? (
                <>
                  Por <span className="font-bold">{data.authorName}</span>
                </>
              ) : null}
            </p>
          ) : null}
          {readingTimeLabel ? <p className="type-metadata text-[var(--ink-700)]">{readingTimeLabel}</p> : null}
        </div>
      </div>
    )
  }

  const parts = [data.authorName, data.publishedAtLabel, formatReadingTime(data.readingTimeMinutes)].filter(
    Boolean,
  )

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {categorySlot}
      {parts.length > 0 ? (
        <p className="type-metadata text-[var(--ink-700)]">{parts.join(' · ')}</p>
      ) : null}
    </div>
  )
}

function formatReadingTime(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return null
  return `${minutes} min de lectura`
}
