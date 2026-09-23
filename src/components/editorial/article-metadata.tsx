import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type ArticleMetadataData = {
  authorName?: string | null
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
   * "fecha de publicación / tiempo de lectura" block without author, used
   * by the Article page's own metadata row.
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
        {data.publishedAtLabel || readingTimeLabel ? (
          <div className="flex flex-col gap-1">
            {data.publishedAtLabel ? (
              <p className="type-metadata text-[var(--ink-700)]">Publicado {data.publishedAtLabel}</p>
            ) : null}
            {readingTimeLabel ? <p className="type-metadata text-[var(--ink-700)]">{readingTimeLabel}</p> : null}
          </div>
        ) : null}
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
