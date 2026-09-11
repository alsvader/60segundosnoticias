'use client'

import { FacebookEmbed, InstagramEmbed, LinkedInEmbed, XEmbed } from 'react-social-media-embed'

import { FacebookVideoEmbed } from '@/components/content/blocks/facebook-video-embed'
import { TikTokEmbed } from '@/components/content/blocks/tiktok-embed'
import { isFacebookVideoUrl, type ControlledEmbedProvider } from '@/lib/editorial/embed-provider'

type EmbedBlockClientProps = {
  provider: ControlledEmbedProvider
  url: string
}

const PLACEHOLDER_CLASS_NAME =
  'flex min-h-40 w-full items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--paper-100)] type-metadata text-[var(--ink-700)]'

/**
 * Real social embeds via `react-social-media-embed` — always loaded
 * through `next/dynamic({ ssr: false })` from `embed-block.tsx`, never
 * server-rendered: the library ships no `'use client'` of its own and
 * generates its wrapper element id at render time (not inside an
 * effect), which produces a real hydration mismatch under SSR (a known,
 * still-open issue in that library). Skipping SSR entirely sidesteps it,
 * and also means these providers' third-party embed scripts only ever
 * load in a browser that actually renders this block.
 */
export default function EmbedBlockClient({ provider, url }: EmbedBlockClientProps) {
  const placeholderProps = { url, className: PLACEHOLDER_CLASS_NAME }

  switch (provider) {
    case 'instagram':
      return (
        <div className="w-full max-w-[550px]">
          <InstagramEmbed url={url} width="100%" placeholderProps={placeholderProps} />
        </div>
      )
    case 'x':
      return (
        <div className="w-full max-w-[550px]">
          <XEmbed url={url} width="100%" placeholderProps={placeholderProps} />
        </div>
      )
    case 'tiktok':
      return <TikTokEmbed url={url} />
    case 'facebook':
      return isFacebookVideoUrl(url) ? (
        <FacebookVideoEmbed url={url} />
      ) : (
        <div className="w-full max-w-[550px]">
          <FacebookEmbed url={url} width="100%" placeholderProps={placeholderProps} />
        </div>
      )
    case 'linkedin':
      return (
        <div className="w-full max-w-[550px]">
          <LinkedInEmbed url={url} width="100%" placeholderProps={placeholderProps} />
        </div>
      )
    default: {
      const unknown: never = provider
      console.warn('EmbedBlockClient: skipping unresolvable provider', unknown)
      return null
    }
  }
}
