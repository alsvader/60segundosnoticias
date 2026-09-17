type SearchFormProps = {
  /** Distinguishes this form's `id` when more than one instance renders on the same page (Header + `/buscar` itself). */
  idPrefix: string
  /**
   * Accessible name for this form's `role="search"` landmark - required
   * whenever more than one `role="search"` region can be visible at once
   * (MobileNav's own form + HeaderSearch, both present when the mobile
   * menu is open) so assistive tech can tell them apart (hallazgo real de
   * tests/e2e/a11y.spec.ts, Fase 11: axe `landmark-unique`).
   */
  landmarkLabel: string
  defaultValue?: string
  autoFocus?: boolean
  className?: string
}

/**
 * Shared GET search form - progressive enhancement, no client state of its
 * own. The only Search entry point that ever talks to `/buscar`; Header,
 * MobileNav and the `/buscar` page itself all render this same component
 * instead of duplicating the markup.
 */
export function SearchForm({ idPrefix, landmarkLabel, defaultValue = '', autoFocus, className }: SearchFormProps) {
  const inputId = `${idPrefix}-search-q`

  return (
    <form action="/buscar" method="get" role="search" aria-label={landmarkLabel} className={className ?? 'flex gap-2'}>
      <label htmlFor={inputId} className="sr-only">
        Buscar en el sitio
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Buscar noticias, páginas…"
        className="type-body min-w-0 flex-1 rounded-md border border-[var(--border-default)] bg-[var(--paper-50)] px-4 py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <button
        type="submit"
        className="type-label-uppercase rounded-md bg-[var(--brand-red-500)] px-4 py-2 text-sm text-[var(--paper-50)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Buscar
      </button>
    </form>
  )
}
