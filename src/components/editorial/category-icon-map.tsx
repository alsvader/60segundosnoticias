import { Dot, MoreHorizontal, Newspaper, Plane, Popcorn, Star, Video, type LucideIcon } from 'lucide-react'

import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'

/**
 * Only place in the codebase that imports both a Payload-facing constant
 * (`CategoryIconKey`) and Lucide. `category-icon-keys.ts` itself stays
 * framework-neutral for the Payload config/CLI — see design.md D3.
 */
export const CATEGORY_ICON_COMPONENTS: Record<CategoryIconKey, LucideIcon> = {
  newspaper: Newspaper,
  video: Video,
  plane: Plane,
  star: Star,
  popcorn: Popcorn,
  dots: MoreHorizontal,
}

type CategoryIconProps = {
  icon: CategoryIconKey | null | undefined
  className?: string
}

export function CategoryIcon({ icon, className }: CategoryIconProps) {
  const Icon = (icon && CATEGORY_ICON_COMPONENTS[icon]) || Dot

  return <Icon className={className} aria-hidden="true" />
}
