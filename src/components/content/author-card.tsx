import { Link2 } from 'lucide-react'
import Image from 'next/image'
import type { ComponentType } from 'react'

import { FacebookLogo, InstagramLogo, TikTokLogo, XLogo, YouTubeLogo } from '@/components/editorial/social-icons'
import { Button } from '@/components/ui/button'
import type { AuthorSummary } from '@/lib/view-models/author'
import { cn } from '@/lib/utils'

const PLATFORM_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  x: XLogo,
  youtube: YouTubeLogo,
  tiktok: TikTokLogo,
}

type AuthorCardProps = {
  author: AuthorSummary
  className?: string
}

/**
 * Public data only (`AuthorSummary` is already an allowlist mapper - never
 * `email`/`role`/`active`, AC-AUTHOR-002). `displayName`/`slug` are
 * deliberately plain text, never a link — there is no `/autor/[slug]`
 * route in this phase (article-page, "Author Card con datos públicos, sin
 * ruta de autor").
 */
export function AuthorCard({ author, className }: AuthorCardProps) {
  return (
    <div
      className={cn(
        'flex max-w-md min-w-0 shrink-0 gap-4 self-start rounded-xl bg-[var(--paper-200)] p-4',
        className,
      )}
    >
      {author.avatar ? (
        <Image
          src={author.avatar.url}
          alt={author.avatar.alt}
          width={56}
          height={56}
          unoptimized
          className="size-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--paper-50)] text-lg font-semibold text-[var(--ink-700)]">
          {author.displayName.charAt(0)}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-[var(--font-display)] font-semibold text-[var(--ink-950)]">{author.displayName}</p>
        {author.bio ? <p className="type-body text-[var(--ink-700)]">{author.bio}</p> : null}
        {author.socialLinks && author.socialLinks.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {author.socialLinks.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform] ?? Link2
              return (
                <Button
                  key={link.url}
                  asChild
                  variant="default"
                  size="icon-sm"
                  data-network={PLATFORM_ICONS[link.platform] ? link.platform : undefined}
                  aria-label={link.platform}
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="size-3.5" />
                  </a>
                </Button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
