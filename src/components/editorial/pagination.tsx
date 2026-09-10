import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
  /** Builds the href for a given page number — routing stays with the caller. */
  getHref: (page: number) => string
  className?: string
}

/**
 * Presentational only — the caller supplies current/total page and an href
 * builder; this component does not compute pagination state itself.
 */
export function Pagination({ currentPage, totalPages, getHref, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav aria-label="Paginación" className={cn('flex items-center justify-center gap-3', className)}>
      {hasPrevious ? (
        <Button asChild variant="outline" size="icon" aria-label="Página anterior">
          <Link href={getHref(currentPage - 1)}>
            <ChevronLeft />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Página anterior">
          <ChevronLeft />
        </Button>
      )}
      <span className="type-metadata text-[var(--ink-700)]">
        Página {currentPage} de {totalPages}
      </span>
      {hasNext ? (
        <Button asChild variant="outline" size="icon" aria-label="Página siguiente">
          <Link href={getHref(currentPage + 1)}>
            <ChevronRight />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Página siguiente">
          <ChevronRight />
        </Button>
      )}
    </nav>
  )
}
