import { cva, type VariantProps } from 'class-variance-authority'

import { CategoryIcon } from '@/components/editorial/category-icon-map'
import type { CategoryIconKey } from '@/lib/constants/category-icon-keys'
import { resolveCategoryThemeKey } from '@/lib/editorial/category-theme'
import { cn } from '@/lib/utils'

// default/compact use the soft surface pair (never the raw saturated accent) so every
// theme — including pink, whose accent can't reach 4.5:1 against either accent-fg option
// at this text size — stays compliant without a per-theme exception. overlay keeps a
// bolder look for legibility over photography, using --cat-overlay-bg (a darkened,
// always-safe-contrast tint) with fixed paper-50 text rather than the raw accent.
// See docs/DESIGN-SYSTEM.md for the verified contrast table.
const categoryBadgeVariants = cva('type-label-uppercase inline-flex items-center gap-1.5 transition-colors duration-[var(--motion-fast)]', {
  variants: {
    variant: {
      default: 'rounded-full bg-[var(--cat-soft)] px-3 py-1 text-xs text-[color:var(--cat-soft-fg)]',
      compact: 'rounded-full bg-[var(--cat-soft)] px-2 py-0.5 text-[0.6875rem] text-[color:var(--cat-soft-fg)]',
      overlay: 'rounded-md bg-[var(--cat-overlay-bg)] px-2.5 py-1 text-xs text-[var(--paper-50)] backdrop-blur-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type CategoryBadgeProps = {
  name: string
  colorTheme?: string | null
  icon?: CategoryIconKey | null
  className?: string
} & VariantProps<typeof categoryBadgeVariants>

export function CategoryBadge({ name, colorTheme, icon, variant, className }: CategoryBadgeProps) {
  const theme = resolveCategoryThemeKey(colorTheme)

  return (
    <span data-cat-theme={theme} className={cn(categoryBadgeVariants({ variant }), className)}>
      <CategoryIcon icon={icon} className="size-3.5 shrink-0" />
      {name}
    </span>
  )
}
