import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { HeaderSearch } from '@/components/site/header-search'
import { MobileNav } from '@/components/site/mobile-nav'
import { Button } from '@/components/ui/button'
import type { ResolvedLink, ResolvedNavItem } from '@/lib/url/resolve-link'

export type HeaderProps = {
  siteName: string
  logo?: { src: string; alt: string }
  navItems: ResolvedNavItem[]
  cta?: ResolvedLink
}

/**
 * Presentational Server Component - receives already-resolved data via
 * props. No Payload import, no data fetching; the frontend layout is the
 * only place that calls the DAL for the shell.
 */
export function Header({ siteName, logo, navItems, cta }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--paper)]">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`${siteName} — inicio`}
        >
          {logo ? (
            <Image src={logo.src} alt={logo.alt} width={140} height={32} priority unoptimized />
          ) : (
            <span className="type-label-uppercase text-[var(--brand-red-500)]">{siteName}</span>
          )}
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <li key={item.href}>
                  <details className="group relative">
                    <summary className="type-label-uppercase cursor-pointer list-none rounded-sm text-sm text-[var(--ink-950)] outline-none marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                      {item.label}
                    </summary>
                    <ul className="absolute top-full left-0 z-10 mt-2 min-w-40 rounded-lg border border-[var(--border-default)] bg-[var(--paper-50)] p-2 shadow-md">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            target={child.openInNewTab ? '_blank' : undefined}
                            rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="type-metadata block rounded-md px-3 py-2 text-[var(--ink-800)] outline-none hover:bg-[var(--paper-200)] focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="type-label-uppercase rounded-sm text-sm text-[var(--ink-950)] outline-none hover:text-[var(--brand-red-600)] focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <HeaderSearch />
          {cta ? (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href={cta.href} target={cta.openInNewTab ? '_blank' : undefined}>
                {cta.label}
              </Link>
            </Button>
          ) : null}
          <MobileNav navItems={navItems} cta={cta} />
        </div>
      </Container>
    </header>
  )
}
