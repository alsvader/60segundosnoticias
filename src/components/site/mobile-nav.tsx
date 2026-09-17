'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { SearchForm } from '@/components/site/search-form'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { ResolvedLink, ResolvedNavItem } from '@/lib/url/resolve-link'

type MobileNavProps = {
  navItems: ResolvedNavItem[]
  cta?: ResolvedLink
}

/**
 * Scoped to open/close state for the mobile menu trigger. Receives
 * already-resolved items; does not fetch or resolve anything itself.
 * Escape-to-close, focus management and scroll lock come from Radix
 * Dialog (which shadcn's Sheet wraps), not custom code here.
 */
export function MobileNav({ navItems, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú de navegación">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Navegación</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navegación móvil" className="flex flex-col gap-1 px-4 pb-4">
          <SearchForm idPrefix="mobile-nav" landmarkLabel="Búsqueda en el menú de navegación" className="mb-3 flex gap-2" />
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="type-label-uppercase block rounded-md px-2 py-3 text-sm text-[var(--ink-950)] outline-none hover:bg-[var(--paper-200)] focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 ? (
                <div className="ml-3 flex flex-col gap-1 border-l border-[var(--border-default)] pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      target={child.openInNewTab ? '_blank' : undefined}
                      rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setOpen(false)}
                      className="type-metadata block rounded-md px-2 py-2 text-[var(--ink-700)] outline-none hover:bg-[var(--paper-200)] focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {cta ? (
            <Button asChild className="mt-4">
              <Link href={cta.href} onClick={() => setOpen(false)}>
                {cta.label}
              </Link>
            </Button>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
