import type { ElementType, ReactNode } from 'react'

import { resolveCategoryThemeKey } from '@/lib/editorial/category-theme'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  title: string
  eyebrow?: string
  action?: ReactNode
  /** Category theme key tinting the eyebrow/rule accent — omit for the neutral brand-red default. */
  theme?: string | null
  /** Semantic heading level for this context — callers control document hierarchy (AC-A11Y-005). */
  as?: ElementType
  className?: string
}

/**
 * Presentational only — no data access. Does not decide its own heading
 * level; the page composing it must pass the level appropriate to its
 * document outline.
 */
export function SectionHeader({
  title,
  eyebrow,
  action,
  theme,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  const catTheme = theme ? resolveCategoryThemeKey(theme) : undefined

  return (
    <div data-cat-theme={catTheme} className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow ? (
          <p
            className={cn(
              'type-label-uppercase text-xs',
              catTheme ? 'text-[color:var(--cat-accent)]' : 'text-[var(--brand-red-600)]',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading className="type-section-heading text-[var(--ink-950)]">{title}</Heading>
      </div>
      {action}
    </div>
  )
}
