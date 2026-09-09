export const CATEGORY_THEME_KEYS = [
  'red',
  'blue',
  'orange',
  'green',
  'pink',
  'purple',
  'cyan',
  'yellow',
  'teal',
  'indigo',
] as const

export type CategoryThemeKey = (typeof CATEGORY_THEME_KEYS)[number]
