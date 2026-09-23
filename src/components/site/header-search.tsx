'use client'

import { Search } from 'lucide-react'
import { useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Header search: an inline control that expands right-to-left from the
 * icon itself - never a popover/dropdown/modal. The icon is always the
 * form's submit button; a first click only reveals the input (does not
 * navigate). Escape collapses and clears the typed value and returns
 * focus to the icon; blurring outside the form also collapses, but
 * without clearing (that's not an explicit close). Isolated Client
 * Component so Header itself stays a Server Component.
 *
 * Layout contract with Header: the expanded input is absolutely positioned
 * against the nearest positioned ancestor (Header's `relative ... gap-4`
 * nav zone) and covers it, so the nav never reflows.
 */
export function HeaderSearch() {
  const [expanded, setExpanded] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const collapse = ({ clear = false, restoreFocus = false } = {}) => {
    setExpanded(false)
    if (clear && inputRef.current) {
      inputRef.current.value = ''
    }
    if (restoreFocus) {
      buttonRef.current?.focus()
    }
  }

  const handleButtonClick = () => {
    if (!expanded) {
      setExpanded(true)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    // Already expanded: this is a real type="submit" click - let it reach
    // the form's onSubmit guard below, which blocks an empty query.
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!inputRef.current?.value.trim()) {
      event.preventDefault()
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape' && expanded) {
      collapse({ clear: true, restoreFocus: true })
    }
  }

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (expanded && !formRef.current?.contains(event.relatedTarget as Node | null)) {
      collapse()
    }
  }

  return (
    <form
      ref={formRef}
      action="/buscar"
      method="get"
      role="search"
      aria-label="Búsqueda en el encabezado"
      className="ml-auto flex items-center md:ml-0"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <label htmlFor="header-search-q" className="sr-only">
        Buscar en el sitio
      </label>
      <input
        ref={inputRef}
        id="header-search-q"
        name="q"
        type="search"
        placeholder="Buscar noticias…"
        aria-hidden={!expanded}
        tabIndex={expanded ? 0 : -1}
        className={cn(
          // Out of flow, positioned against the Header's nav zone (the form is
          // unpositioned) so expanding never reflows the nav: it covers it.
          // right-12 = the icon button (size-8) + the zone's gap-4.
          'absolute top-1/2 right-12 z-10 h-9 -translate-y-1/2 rounded-md text-sm outline-none transition-[left,padding,opacity] duration-[var(--motion-normal)] ease-[var(--motion-ease)] focus-visible:ring-3 focus-visible:ring-ring/50',
          expanded
            ? 'left-0 border border-[var(--border-default)] bg-[var(--paper-50)] px-3 opacity-100'
            : 'pointer-events-none left-[calc(100%-3rem)] border border-transparent bg-transparent px-0 opacity-0',
        )}
      />
      <Button
        ref={buttonRef}
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Buscar"
        aria-expanded={expanded}
        onClick={handleButtonClick}
      >
        <Search />
      </Button>
    </form>
  )
}
