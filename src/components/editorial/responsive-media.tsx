import Image from 'next/image'

import { cn } from '@/lib/utils'

type ResponsiveMediaProps = {
  src: string
  /** Required — no silent empty-alt fallback for editorial imagery (AC-A11Y-004). */
  alt: string
  /** e.g. "16/9", "4/3", "1/1" — matches the aspect ratios in docs/60-segundos-spec.md §50. Forces a cropped `fill`+`object-cover` box (intentional for grid layouts, e.g. `gallery-block.tsx`). */
  aspectRatio?: string
  /** Intrinsic size of the source image. Used only when `aspectRatio` is omitted, to render at the image's real ratio instead of a forced crop. */
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Thin wrapper around `next/image` for editorial photography. Does not
 * fetch Payload Media itself — the caller resolves the URL/alt beforehand.
 * Captions/credits are composed by the caller, not owned by this component.
 *
 * Two modes: pass `aspectRatio` for a fixed-ratio cropped box (`fill` +
 * `object-cover` — grids/galleries, where a uniform cell size is the
 * point); omit it and pass `width`/`height` instead for the image's own
 * natural ratio with no crop (single editorial images). Missing both
 * `aspectRatio` and dimensions falls back to the cropped 16:9 box so this
 * never renders broken.
 *
 * `unoptimized` on both branches: `src` can be an S3-compatible Object
 * Storage URL configured only at runtime (`S3_PUBLIC_URL`), never known
 * at build time — Next's optimizer would need `images.remotePatterns`
 * frozen into the `output: standalone` build, which can't reflect a
 * runtime-only host. The browser fetches the object directly instead
 * (same pattern already used by `header.tsx`/`footer.tsx` for logos).
 */
export function ResponsiveMedia({
  src,
  alt,
  aspectRatio,
  width,
  height,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  className,
}: ResponsiveMediaProps) {
  if (!aspectRatio && width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        unoptimized
        className={cn('h-auto w-full', className)}
      />
    )
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden bg-[var(--paper-200)]', className)}
      style={{ aspectRatio: aspectRatio ?? '16/9' }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized className="object-cover" />
    </div>
  )
}
