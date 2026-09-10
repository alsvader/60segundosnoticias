import Image from 'next/image'

import { cn } from '@/lib/utils'

type ResponsiveMediaProps = {
  src: string
  /** Required — no silent empty-alt fallback for editorial imagery (AC-A11Y-004). */
  alt: string
  /** e.g. "16/9", "4/3", "1/1" — matches the aspect ratios in docs/60-segundos-spec.md §50. */
  aspectRatio?: string
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Thin wrapper around `next/image` for editorial photography. Does not
 * fetch Payload Media itself — the caller resolves the URL/alt beforehand.
 * Captions/credits are composed by the caller, not owned by this component.
 */
export function ResponsiveMedia({
  src,
  alt,
  aspectRatio = '16/9',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  className,
}: ResponsiveMediaProps) {
  return (
    <div className={cn('relative w-full overflow-hidden bg-[var(--paper-200)]', className)} style={{ aspectRatio }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  )
}
