import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/container'
import type { ResolvedLink } from '@/lib/url/resolve-link'

export type FooterColumn = {
  title: string
  links: ResolvedLink[]
}

export type FooterProps = {
  logo?: { src: string; alt: string }
  description?: string
  columns: FooterColumn[]
  socialLinks?: { platform: string; url: string }[]
  legalLinks: ResolvedLink[]
  copyright?: string
}

/**
 * Presentational Server Component - receives already-resolved data via
 * props. No Payload import, no data fetching.
 */
export function Footer({ logo, description, columns, socialLinks, legalLinks, copyright }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--paper-100)]">
      <Container className="flex flex-col gap-10 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            {logo ? <Image src={logo.src} alt={logo.alt} width={120} height={28} unoptimized /> : null}
            {description ? <p className="type-body text-[var(--ink-700)]">{description}</p> : null}
            {socialLinks && socialLinks.length > 0 ? (
              <ul className="flex gap-3">
                {socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="type-metadata rounded-sm text-[var(--ink-700)] outline-none hover:text-[var(--brand-red-600)] focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-2">
              <h2 className="type-label-uppercase text-xs text-[var(--ink-950)]">{column.title}</h2>
              <ul className="flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="type-metadata rounded-sm text-[var(--ink-700)] outline-none hover:text-[var(--ink-950)] focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          {copyright ? <p className="type-metadata text-[var(--ink-700)]">{copyright}</p> : null}
          {legalLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="type-metadata rounded-sm text-[var(--ink-700)] outline-none hover:text-[var(--ink-950)] focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
