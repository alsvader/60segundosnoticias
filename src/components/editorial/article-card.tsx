import Link from 'next/link'

import { ArticleMetadata, type ArticleMetadataData } from '@/components/editorial/article-metadata'
import { CategoryBadge } from '@/components/editorial/category-badge'
import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'
import { cn } from '@/lib/utils'

/**
 * Frontend-facing contract for `ArticleCard`. Deliberately not `Post` from
 * `payload-types.ts` — the Data Access Layer/View Models (Phase 5) are
 * responsible for producing this shape from a real Post. See
 * design-system-shadcn/design.md D4.
 */
export type ArticleCardData = {
  title: string
  excerpt?: string | null
  href: string
  image?: {
    src: string
    alt: string
  } | null
  category?: {
    name: string
    colorTheme?: string | null
    icon?: CategoryIconKey | null
  } | null
  metadata?: ArticleMetadataData
}

type ArticleCardVariant = 'default' | 'compact'

type ArticleCardProps = {
  article: ArticleCardData
  variant?: ArticleCardVariant
  className?: string
}

/**
 * Presentational only — no Payload import, no Local API, no fetch. Variants
 * are expressed on this single component, never as a separate component
 * (AC-COMP-001..004).
 */
export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const isCompact = variant === 'compact'

  return (
    <Link
      href={article.href}
      className={cn(
        'group flex gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--paper-50)] overflow-hidden',
        'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        isCompact ? 'flex-row items-center p-3' : 'flex-col p-0',
        className,
      )}
    >
      {article.image ? (
        <ResponsiveMedia
          src={article.image.src}
          alt={article.image.alt}
          aspectRatio="16/9"
          className={cn(
            'transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:scale-[1.02]',
            isCompact ? 'w-28 shrink-0 rounded-lg' : 'w-full',
          )}
        />
      ) : null}
      <div className={cn('flex flex-col gap-2', isCompact ? '' : 'p-4')}>
        {article.category ? (
          <CategoryBadge
            name={article.category.name}
            colorTheme={article.category.colorTheme}
            icon={article.category.icon}
            variant="compact"
          />
        ) : null}
        <h3 className={cn('font-[var(--font-display)] font-semibold text-[var(--ink-950)]', isCompact ? 'text-base' : 'type-h3')}>
          {article.title}
        </h3>
        {!isCompact && article.excerpt ? (
          <p className="type-body text-[var(--ink-700)] line-clamp-2">{article.excerpt}</p>
        ) : null}
        {article.metadata ? <ArticleMetadata data={article.metadata} /> : null}
      </div>
    </Link>
  )
}
