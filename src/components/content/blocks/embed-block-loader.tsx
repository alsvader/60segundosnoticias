'use client'

import dynamic from 'next/dynamic'

/**
 * `dynamic(..., { ssr: false })` is only allowed from inside a Client
 * Component in the App Router — this thin wrapper exists solely to carry
 * that boundary, so the actual Server Component (`embed-block.tsx`) can
 * still just import and render it normally. See `embed-block-client.tsx`
 * for why `ssr: false` is required here at all.
 */
const EmbedBlockLoader = dynamic(() => import('@/components/content/blocks/embed-block-client'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="flex min-h-40 w-full animate-pulse items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--paper-100)]"
    />
  ),
})

export default EmbedBlockLoader
