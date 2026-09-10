import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

export type BreadcrumbItem = {
  label: string
  /** Omit `href` on the last (current) item. */
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Presentational only — receives its items via props. Does not resolve
 * routes or fetch category/page data itself.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="type-metadata rounded-sm text-[var(--ink-700)] outline-none hover:text-[var(--ink-950)] focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="type-metadata text-[var(--ink-950)]">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden="true" className="size-3.5 text-[var(--border-strong)]" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
