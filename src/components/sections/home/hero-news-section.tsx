import Link from 'next/link'

import { ArticleCard } from '@/components/editorial/article-card'
import { ArticleMetadata } from '@/components/editorial/article-metadata'
import { CategoryBadge } from '@/components/editorial/category-badge'
import { ResponsiveMedia } from '@/components/editorial/responsive-media'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import type { ResolvedHeroNews } from '@/lib/home/resolve-home-blocks'

type HeroNewsSectionProps = {
  hero: ResolvedHeroNews
}

/**
 * Never renders an `<h1>` - the page itself owns the single H1 (design.md
 * D7), independent of whether Home even configures a Hero block.
 *
 * `.texture-newspaper-pattern` (globals.css) is the decorative backdrop
 * for this section only - a contained, negative-z-index, pointer-events:
 * none pseudo-element, never applied site-wide. Its opacity was calibrated
 * against this specific low-contrast asset through live browser sign-off
 * (see the comment on `.texture-newspaper-pattern` in globals.css for the
 * measured values and iteration history), not left at the Design System's
 * original 3-7% starting guidance. Hero content renders in the normal
 * stacking order above it.
 */
export function HeroNewsSection({ hero }: HeroNewsSectionProps) {
  return (
    <section className="texture-newspaper-pattern py-8 md:py-12">
      <Container className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Link href={hero.mainPost.href} className="group flex flex-col gap-4">
          {hero.mainPost.image ? (
            <ResponsiveMedia
              src={hero.mainPost.image.src}
              alt={hero.mainPost.image.alt}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 1024px) 66vw, 100vw"
            />
          ) : null}
          <div className="flex flex-col gap-3">
            {hero.eyebrow ? (
              <p className="type-label-uppercase text-xs text-[var(--brand-red-600)]">{hero.eyebrow}</p>
            ) : null}
            <h2 className="type-h1-article font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
              {hero.headline}
            </h2>
            {hero.description ? <p className="type-lead text-[var(--ink-700)]">{hero.description}</p> : null}
            {hero.mainPost.metadata ? (
              <ArticleMetadata
                data={hero.mainPost.metadata}
                categorySlot={
                  hero.mainPost.category ? (
                    <CategoryBadge
                      name={hero.mainPost.category.name}
                      colorTheme={hero.mainPost.category.colorTheme}
                      icon={hero.mainPost.category.icon}
                    />
                  ) : undefined
                }
              />
            ) : null}
            {hero.cta ? (
              <Button asChild className="w-fit">
                <Link href={hero.cta.href}>{hero.cta.label}</Link>
              </Button>
            ) : null}
          </div>
        </Link>
        <div className="flex flex-col gap-4">
          {hero.secondaryPosts.map((post) => (
            <ArticleCard key={post.href} article={post} variant="compact" />
          ))}
        </div>
      </Container>
    </section>
  )
}
