import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/app/globals.css'

import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { getFooter } from '@/lib/data/footer'
import { getNavigation } from '@/lib/data/navigation'
import { getSettings } from '@/lib/data/settings'
import { resolveLinks, resolveNavItems } from '@/lib/url/resolve-link'
import { mapMediaToMediaData } from '@/lib/view-models/media'

import { inter, oswald } from './fonts'

export const metadata: Metadata = {
  title: '60 Segundos Noticias',
  description: 'Portal editorial y multimedia 60 Segundos Noticias.',
}

/**
 * Without this, Next.js 16 statically prerenders frontend routes at
 * build time by default, which would bake Navigation/Footer/SiteSettings
 * into a stale snapshot until the next rebuild - directly contradicting
 * "administrable without a code change" (AC-NAV-004, AC-FOOT-001/002).
 * This is the smallest Phase 5 cache posture: no caching at all, always
 * fetch fresh. Phase 8 layers real tag-based revalidation on top of this
 * dynamic baseline; this does not preempt that work.
 */
export const dynamic = 'force-dynamic'

/**
 * The only place in the site shell that calls the DAL. Header/Footer/
 * MobileNav below stay presentational, receiving plain resolved props.
 */
export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [navigation, footer, settings] = await Promise.all([getNavigation(), getFooter(), getSettings()])

  const siteName = settings.branding?.siteName || '60 Segundos Noticias'
  const headerLogo = mapMediaToMediaData(navigation.logo, { fallbackAlt: siteName })
  const footerLogo = mapMediaToMediaData(footer.logo ?? settings.branding?.logo, { fallbackAlt: siteName })

  const navItems = resolveNavItems(navigation.items)
  const cta =
    navigation.cta?.url && navigation.cta.label
      ? { href: navigation.cta.url, label: navigation.cta.label }
      : undefined

  const footerColumns = (footer.columns ?? []).map((column) => ({
    title: column.title,
    links: resolveLinks(column.links),
  }))

  return (
    <html lang="es-MX" className={`${oswald.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-[var(--brand-red-500)] focus-visible:px-4 focus-visible:py-2 focus-visible:text-[var(--paper-50)]"
        >
          Saltar al contenido principal
        </a>
        <Header
          siteName={siteName}
          logo={headerLogo ? { src: headerLogo.url, alt: headerLogo.alt } : undefined}
          navItems={navItems}
          cta={cta}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer
          logo={footerLogo ? { src: footerLogo.url, alt: footerLogo.alt } : undefined}
          description={footer.description ?? undefined}
          columns={footerColumns}
          socialLinks={footer.socialLinks?.map((link) => ({ platform: link.platform, url: link.url }))}
          legalLinks={resolveLinks(footer.legalLinks)}
          copyright={footer.copyright ?? undefined}
        />
      </body>
    </html>
  )
}
