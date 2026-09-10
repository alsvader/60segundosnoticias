'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { SectionHeader } from '@/components/editorial/section-header'
import { Container } from '@/components/layout/container'
import type { ResolvedVideoFeature } from '@/lib/home/resolve-home-blocks'

type VideoFeatureSectionProps = {
  block: ResolvedVideoFeature
}

const EMBED_SRC: Record<'youtube' | 'vimeo', (embedId: string) => string> = {
  youtube: (embedId) => `https://www.youtube.com/embed/${embedId}`,
  vimeo: (embedId) => `https://player.vimeo.com/video/${embedId}`,
}

/**
 * Client island (design.md §23): the click-to-play affordance genuinely
 * needs state, so the embed is lazy - never loaded until the viewer
 * interacts (AC-PERF-004). The rest of Home stays server-rendered.
 */
export function VideoFeatureSection({ block }: VideoFeatureSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const thumbnail = block.thumbnail ?? (block.media.kind === 'post' ? block.media.post.image : undefined)
  const label = block.headline ?? block.title ?? 'Video'

  return (
    <section className="py-8 md:py-12">
      <Container className="flex flex-col gap-6">
        {block.title ? <SectionHeader title={block.title} /> : null}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
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

            {block.media.kind === 'embed' && isPlaying ? (
              <iframe
                src={EMBED_SRC[block.media.provider](block.media.embedId)}
                title={label}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : block.media.kind === 'embed' ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label={`Reproducir video: ${label}`}
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-[var(--brand-red-500)] text-[var(--paper-50)]">
                  <Play className="size-7" fill="currentColor" />
                </span>
              </button>
            ) : (
              <Link
                href={block.media.post.href}
                className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label={`Ver: ${label}`}
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-[var(--brand-red-500)] text-[var(--paper-50)]">
                  <Play className="size-7" fill="currentColor" />
                </span>
              </Link>
            )}
          </div>
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
