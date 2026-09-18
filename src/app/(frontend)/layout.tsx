import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/app/globals.css'

import { DraftModeBanner } from '@/components/site/draft-mode-banner'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { getFooter } from '@/lib/data/footer'
import { getNavigation } from '@/lib/data/navigation'
import { getSettings } from '@/lib/data/settings'
import { getSiteOrigin } from '@/lib/url/canonical'
import { resolveLinks, resolveNavItems } from '@/lib/url/resolve-link'
import { mapMediaToMediaData } from '@/lib/view-models/media'

import { inter, oswald } from './fonts'

export const metadata: Metadata = {
  // Fase 8: permite que rutas hijas usen paths relativos en `alternates`/
  // `openGraph.images` con la garantía de resolverse contra el mismo
  // origen que `getAbsoluteUrl()` ya usa explícitamente en todos lados.
  metadataBase: new URL(getSiteOrigin()),
  title: '60 Segundos Noticias',
  description: 'Portal editorial y multimedia 60 Segundos Noticias.',
}

/**
 * Fase 11 (openspec/changes/runtime-public-rendering): `force-dynamic`
 * (removido en Fase 8) está de vuelta, pero por una razón distinta a la
 * original de Fase 5 (postura sin-cache) - `next build` intenta generar
 * `/` y `/buscar` de forma estática por defecto, y esa generación
 * estática ejecuta las mismas consultas a Payload que fallan sin una base
 * de datos alcanzable en build time (invariante de Fase 10,
 * `production-docker-image`: `docker build --target runner` no debe
 * requerir Postgres). Confirmado en vivo: `docker-smoke.sh` fallaba en
 * `docker build` mismo, antes de que existiera ningún container.
 *
 * Navigation/Footer/SiteSettings/Home siguen serviéndose vía
 * `unstable_cache`, con tags específicos invalidados por hooks
 * `afterChange` en cada Global
 * (`src/payload/hooks/shell/cache-invalidation.ts`) - "administrable sin
 * cambio de código" (AC-NAV-004, AC-FOOT-001/002) sigue cumpliéndose
 * mediante invalidación dirigida, ahora sirviendo cada request de forma
 * dinámica en vez de una página estática revalidada por tag. `dynamic`
 * (modo de render/Full Route Cache) y `unstable_cache` (Data Cache) son
 * capas independientes en Next.js - este cambio no toca la segunda.
 * Verificado en vivo: un cambio de contenido (Post) se refleja en la
 * siguiente request sin rebuild (ver `openspec/changes/preview-seo-cache-redirects/tasks.md`
 * §4.1); Navigation/Footer/SiteSettings específicamente se verifican en
 * la sección 16 (requieren un usuario Admin real).
 */
export const dynamic = 'force-dynamic'

/**
 * The only place in the site shell that calls the DAL. Header/Footer/
 * MobileNav below stay presentational, receiving plain resolved props.
 */
export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [{ isEnabled: isDraftModeEnabled }, navigation, footer, settings] = await Promise.all([
    draftMode(),
    getNavigation(),
    getFooter(),
    getSettings(),
  ])

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
      <head>
        {/* llms.txt v2 discovery relation - the typed Metadata API's `alternates` has no field for `rel="describedby"` (only `canonical`/`languages`/`media`/`types`), so this is the framework's own sanctioned escape hatch for a link relation it doesn't model. */}
        <link rel="describedby" href="/llms.txt" type="text/markdown" />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        {isDraftModeEnabled ? <DraftModeBanner /> : null}
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
