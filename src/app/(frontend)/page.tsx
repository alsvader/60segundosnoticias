import { HomeBlockRenderer } from '@/components/sections/home/home-block-renderer'
import { getHome } from '@/lib/data/home'
import { getSettings } from '@/lib/data/settings'
import { resolveHomeBlocks } from '@/lib/home/resolve-home-blocks'

/**
 * getHome() -> resolveHomeBlocks() -> HomeBlockRenderer (§32.1). The page
 * itself owns the single H1 (design.md D7) - visually hidden, independent
 * of whatever blocks the Admin configures, so document structure never
 * depends on whether/where a HeroNews block appears.
 */
export default async function HomePage() {
  const [home, settings] = await Promise.all([getHome(), getSettings()])
  const blocks = await resolveHomeBlocks(home.layout)
  const siteName = settings.branding?.siteName || '60 Segundos Noticias'

  return (
    <>
      <h1 className="sr-only">{siteName}</h1>
      <HomeBlockRenderer blocks={blocks} />
    </>
  )
}
