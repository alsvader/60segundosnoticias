import { Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { SectionHeader } from '@/components/editorial/section-header'
import { Container } from '@/components/layout/container'
import { VideoPlayer } from '@/components/content/video-player'
import type { ResolvedVideoFeature } from '@/lib/home/resolve-home-blocks'

type VideoFeatureSectionProps = {
  block: ResolvedVideoFeature
}

/**
 * `media.kind === 'post'` has no real video — it's a teaser card linking
 * to another Post, kept exactly as before. `media.kind === 'embed'` now
 * renders through the shared `VideoPlayer` (Vidstack) instead of a
 * hand-rolled iframe/play-button — no `useState` needed here anymore,
 * Vidstack owns its own play state, so this stays a Server Component.
 */
export function VideoFeatureSection({ block }: VideoFeatureSectionProps) {
  const thumbnail = block.thumbnail ?? (block.media.kind === 'post' ? block.media.post.image : undefined)
  const label = block.headline ?? block.title ?? 'Video'

  return (
    <section className="py-8 md:py-12">
      <Container className="flex flex-col gap-6">
        {block.title ? <SectionHeader title={block.title} /> : null}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {block.media.kind === 'embed' ? (
            <VideoPlayer
              src={`${block.media.provider}/${block.media.embedId}`}
              title={label}
              poster={thumbnail ? { url: thumbnail.src, alt: thumbnail.alt } : undefined}
              className="aspect-video"
            />
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[var(--ink-950)]">
              {thumbnail ? (
                <Image
                  src={thumbnail.src}
                  alt={thumbnail.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <Link
                href={block.media.post.href}
                className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label={`Ver: ${label}`}
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-[var(--brand-red-500)] text-[var(--paper-50)]">
                  <Play className="size-7" fill="currentColor" />
                </span>
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {block.headline ? (
              <h3 className="type-h3 font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
                {block.headline}
              </h3>
            ) : null}
            {block.description ? <p className="type-body text-[var(--ink-700)]">{block.description}</p> : null}
          </div>
        </div>
      </Container>
    </section>
  )
}
