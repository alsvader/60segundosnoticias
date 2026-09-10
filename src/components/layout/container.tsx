import type { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ContainerProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
} & Omit<ComponentProps<T>, 'as' | 'children' | 'className'>

/**
 * Site canvas primitive: centers content up to `--container-max` (~1400px)
 * with responsive gutters (16px mobile / 28px tablet / 44px desktop).
 */
export function Container<T extends ElementType = 'div'>({
  as,
  children,
  className,
  ...props
}: ContainerProps<T>) {
  const Comp = as ?? 'div'

  return (
    <Comp
      className={cn('mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]', className)}
      {...props}
    >
      {children}
    </Comp>
  )
}
