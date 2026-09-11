'use client'

import { useEffect } from 'react'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

type ErrorBoundaryProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Branded error boundary (root-content-routing, AC-ERR-001/002): Next.js
 * App Router requires this file to be a Client Component - the smallest
 * possible boundary, no business logic. Catches unexpected
 * infrastructure/runtime failures from routes inside `(frontend)/`
 * (Category/Article/Page data fetching), never a substitute for
 * `notFound()` - expected missing/unpublished content still resolves to
 * `not-found.tsx`. Lives inside `(frontend)/` for the same reason as
 * `not-found.tsx`: keeps Header/Footer. Does not catch failures from
 * `(frontend)/layout.tsx` itself (Navigation/Footer/SiteSettings) - a
 * same-segment error boundary can't catch its own layout's errors; that
 * pre-existing Phase 5 site shell is out of this change's scope.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Server-side detail (stack, message) is never sent to the client by
    // Next.js for this callback in production - only `error.message`/
    // `error.digest` reach here, and neither is rendered below.
    console.error(error)
  }, [error])

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <p className="type-display-xl font-[var(--font-display)] font-bold text-[var(--brand-red-500)]" aria-hidden>
        60
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="type-h2 font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
          Algo salió mal
        </h1>
        <p className="type-body max-w-prose text-[var(--ink-700)]">
          Ocurrió un error inesperado. Intenta de nuevo en un momento.
        </p>
      </div>
      <Button onClick={reset}>Reintentar</Button>
    </Container>
  )
}
