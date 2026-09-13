import { cache } from 'react'
import { draftMode } from 'next/headers'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

import { HomeBlockRenderer } from '@/components/sections/home/home-block-renderer'
import { getHome } from '@/lib/data/home'
import { getSettings } from '@/lib/data/settings'
import { resolveHomeBlocks } from '@/lib/home/resolve-home-blocks'
import { findDraftHome } from '@/lib/preview/draft-documents'
import { buildOrganizationJsonLd, buildWebsiteJsonLd, JsonLd, resolveOrganizationInfo } from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'
import { getAbsoluteUrl } from '@/lib/url/canonical'

/**
 * Draft Mode habilita el bypass de cache, pero no le dice a Payload que
 * debe devolver la versión en Draft - eso se pide explícitamente aquí
 * (`findDraftHome`, `src/lib/preview/draft-documents.ts`). Sin esta rama,
 * Preview redirigiría correctamente pero renderizaría igual el contenido
 * publicado (hallazgo real durante la verificación en vivo, sección 16).
 */
const loadHome = cache(async () => {
  const { isEnabled } = await draftMode()
  if (isEnabled) {
    const draft = await findDraftHome(await headers())
    if (draft) return draft
  }
  return getHome()
})

/** Home metadata (§41.4, AC-SEO-005): SiteSettings defaults, Home SEO override opcional. */
export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([loadHome(), getSettings()])
  const siteName = settings.branding?.siteName || '60 Segundos Noticias'

  return buildMetadata({
    seo: home.seo,
    fallbackTitle: siteName,
    fallbackDescription: settings.branding?.tagline,
    canonicalPath: '/',
    siteDefaults: {
      siteName,
      defaultMetaTitle: settings.seo?.defaultMetaTitle,
      defaultMetaDescription: settings.seo?.defaultMetaDescription,
      defaultMetaImage: settings.seo?.defaultMetaImage,
    },
  })
}

/**
 * getHome() -> resolveHomeBlocks() -> HomeBlockRenderer (§32.1). The page
 * itself owns the single H1 (design.md D7) - visually hidden, independent
 * of whatever blocks the Admin configures, so document structure never
 * depends on whether/where a HeroNews block appears.
 */
export default async function HomePage() {
  const [home, settings] = await Promise.all([loadHome(), getSettings()])
  const blocks = await resolveHomeBlocks(home.layout)
  const siteName = settings.branding?.siteName || '60 Segundos Noticias'
  const siteUrl = getAbsoluteUrl('/')
  const organization = resolveOrganizationInfo(settings)

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd({ name: organization.name, url: siteUrl, logoUrl: organization.logoUrl })} />
      <JsonLd data={buildWebsiteJsonLd({ name: siteName, url: siteUrl })} />
      <h1 className="sr-only">{siteName}</h1>
      <HomeBlockRenderer blocks={blocks} />
    </>
  )
}
