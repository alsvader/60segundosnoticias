export const CATEGORY_ICON_KEYS = ['newspaper', 'video', 'plane', 'star', 'popcorn', 'dots'] as const

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number]
