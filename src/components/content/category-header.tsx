import { CategoryIcon } from '@/components/editorial/category-icon-map'
import { resolveCategoryThemeKey } from '@/lib/editorial/category-theme'
import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'

export type CategoryHeaderData = {
  name: string
  description?: string | null
  colorTheme?: string | null
  icon?: CategoryIconKey | null
}

type CategoryHeaderProps = {
  category: CategoryHeaderData
}

/**
 * Owns the Category page's single `<h1>` (category-page, "Un único H1" —
 * AC-A11Y-005). Description is optional and degrades gracefully.
 */
export function CategoryHeader({ category }: CategoryHeaderProps) {
  const theme = resolveCategoryThemeKey(category.colorTheme)

  return (
    <header data-cat-theme={theme} className="flex flex-col items-center gap-3 py-8 text-center">
      <CategoryIcon icon={category.icon} className="size-10 text-[color:var(--cat-strong)]" />
      <h1 className="type-h1-article font-[var(--font-display)] font-bold text-[var(--ink-950)]">{category.name}</h1>
      {category.description ? (
        <p className="type-lead max-w-prose text-[var(--ink-700)]">{category.description}</p>
      ) : null}
      <span aria-hidden="true" className="h-0.5 w-12 rounded-full bg-[var(--cat-accent)]" />
    </header>
  )
}
