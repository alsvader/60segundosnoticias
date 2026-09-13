import { Eye } from 'lucide-react'

import { Container } from '@/components/layout/container'

/**
 * Presentational Server Component - no data fetching, no `draftMode()` call
 * here. `(frontend)/layout.tsx` reads Draft Mode and renders this
 * conditionally; this component only knows how to display the indicator
 * and link out to `/api/preview-exit`.
 */
export function DraftModeBanner() {
  return (
    <div role="status" className="border-b border-[var(--warning)] bg-[var(--warning)] text-[var(--ink-950)]">
      <Container className="flex flex-wrap items-center justify-between gap-2 py-2">
        <span className="type-metadata flex items-center gap-2">
          <Eye aria-hidden="true" className="size-4 shrink-0" />
          Estás viendo una vista previa sin publicar
        </span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- /api/preview-exit is a Route Handler, not a page; it must be a full navigation to run its redirect/cookie-clearing response, not a client-side router transition. */}
        <a
          href="/api/preview-exit"
          className="type-label-uppercase rounded-sm underline decoration-2 underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Salir de vista previa
        </a>
      </Container>
    </div>
  )
}
