import EmbedBlockClient from '@/components/content/blocks/embed-block-loader'
import { EmbedLinkCard } from '@/components/content/blocks/embed-link-card'
import { resolveEmbed } from '@/lib/editorial/embed-provider'
import { cn } from '@/lib/utils'
import type { EmbedBlock } from '@/payload-types'

type EmbedBlockViewProps = {
  block: EmbedBlock
}

/**
 * Only controls where the embed's (fixed-width) box sits in the column —
 * never arbitrary CSS/margins from Payload, same restriction as
 * `ImageBlock`'s `SIZE_CLASSES` (`image-block.tsx`).
 */
const ALIGNMENT_CLASSES: Record<NonNullable<EmbedBlock['alignment']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

/**
 * `instagram`/`x`/`tiktok`/`facebook`/`linkedin` render the real embedded
 * post (client-only, see `embed-block-client.tsx`). `generic` (and any
 * URL that fails `resolveEmbed()`'s host allowlist) safely degrades to a
 * link-through card — never an iframe, never raw HTML, never
 * `dangerouslySetInnerHTML` (AC-EMBED-001/002).
 */
export function EmbedBlockView({ block }: EmbedBlockViewProps) {
  const resolved = resolveEmbed(block.provider, block.url)
  if (!resolved) return null

  const alignmentClass = ALIGNMENT_CLASSES[block.alignment ?? 'left']

  if (resolved.kind === 'controlled') {
    return (
      <figure className={cn('my-8 flex', alignmentClass)}>
        <EmbedBlockClient provider={resolved.provider} url={resolved.url} />
      </figure>
    )
  }

  return (
    <div className={cn('my-8 flex', alignmentClass)}>
      <EmbedLinkCard
        href={resolved.url}
        label={`Ver contenido en ${resolved.hostname}`}
        className="w-full max-w-[550px]"
      />
    </div>
  )
}
