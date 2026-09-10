import { CATEGORY_THEME_KEYS, type CategoryThemeKey } from '@/lib/constants/category-theme-keys'

/**
 * Fallback used when a category has no `colorTheme` set or an unrecognized
 * value reaches the frontend. Never falls back to an arbitrary color.
 */
export const DEFAULT_CATEGORY_THEME_KEY: CategoryThemeKey = 'purple'

const CATEGORY_THEME_KEY_SET = new Set<string>(CATEGORY_THEME_KEYS)

export function resolveCategoryThemeKey(value: string | null | undefined): CategoryThemeKey {
  if (value && CATEGORY_THEME_KEY_SET.has(value)) {
    return value as CategoryThemeKey
  }

  return DEFAULT_CATEGORY_THEME_KEY
}
