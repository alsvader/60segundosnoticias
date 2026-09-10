import Link from 'next/link'

import { CategoryIcon } from '@/components/editorial/category-icon-map'
import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'
import { resolveCategoryThemeKey } from '@/lib/editorial/category-theme'
import { cn } from '@/lib/utils'

export type CategoryCardData = {
  name: string
  description?: string | null
  href: string
  colorTheme?: string | null
  icon?: CategoryIconKey | null
}

type CategoryCardProps = {
  category: CategoryCardData
  className?: string
}

/**
 * Presentational only — receives fully-resolved data via props, never
 * fetches Categories itself. See design-system-shadcn/specs/editorial-components.
 */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const theme = resolveCategoryThemeKey(category.colorTheme)

  return (
    <Link
      href={category.href}
      data-cat-theme={theme}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--paper-50)] px-5 py-6 text-center',
        'transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:-translate-y-[3px]',
        'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      {/* --cat-strong, not the raw accent: blue/orange/green/yellow fail the 3:1 non-text
          minimum against paper-50 at full saturation (see docs/DESIGN-SYSTEM.md). */}
      <CategoryIcon icon={category.icon} className="size-9 text-[color:var(--cat-strong)]" />
      <span className="type-label-uppercase text-sm text-[var(--ink-950)]">{category.name}</span>
      {category.description ? (
        <p className="type-metadata text-[var(--ink-700)]">{category.description}</p>
      ) : null}
      {/* Decorative color-identity accent, not required to read/operate the card — the raw
          saturated accent is fine here (WCAG 1.4.11 non-text contrast doesn't apply to
          purely decorative elements). */}
      <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-[var(--cat-accent)]" />
    </Link>
  )
}
