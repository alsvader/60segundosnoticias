import type { Category } from '@/payload-types'
import { getCategoryUrl } from '@/lib/url/canonical'
import type { CategoryCardData } from '@/components/editorial/category-card'

/**
 * colorTheme/icon are copied as-is - Payload's generated `Category` type
 * already narrows them to the same controlled key unions
 * (`CategoryThemeKey`/`CategoryIconKey`), so there is no arbitrary value
 * to guard against here; `CategoryCard`'s own `resolveCategoryThemeKey()`
 * still falls back safely if a category has neither set.
 */
export function mapCategoryToCategoryCardData(category: Category): CategoryCardData {
  return {
    name: category.name,
    description: category.description ?? undefined,
    href: getCategoryUrl(category.slug),
    colorTheme: category.colorTheme ?? undefined,
    icon: category.icon ?? undefined,
  }
}
