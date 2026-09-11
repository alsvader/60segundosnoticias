import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

/**
 * Branded 404 (root-content-routing, §72): lives inside `(frontend)/` -
 * not at the `src/app/` root shown in the Master Spec's illustrative
 * project-structure tree - so it renders inside `(frontend)/layout.tsx`'s
 * `<main>` and keeps Header/Footer, instead of losing the site shell.
 * Used for any `notFound()` call from a route inside this group: unknown
 * root slug, unknown/unpublished Article, unpublished Page.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <p className="type-display-xl font-[var(--font-display)] font-bold text-[var(--brand-red-500)]" aria-hidden>
        60
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="type-h2 font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
          No encontramos esta página
        </h1>
        <p className="type-body max-w-prose text-[var(--ink-700)]">
          El contenido que buscas no existe o ya no está disponible.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </Container>
  )
}
