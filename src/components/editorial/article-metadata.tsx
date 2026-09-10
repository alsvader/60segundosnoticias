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
  className?: string
}

/**
 * Presentational only — no data access. Consumers pass already-resolved
 * strings; this component does not format dates or fetch author records.
 */
export function ArticleMetadata({ data, categorySlot, className }: ArticleMetadataProps) {
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
