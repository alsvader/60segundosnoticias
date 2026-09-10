import type { User } from '@/payload-types'
import { mapMediaToMediaData, type MediaData } from '@/lib/view-models/media'

export type AuthorSummary = {
  id: number
  displayName: string
  slug?: string
  avatar?: MediaData
  bio?: string
  socialLinks?: { platform: string; url: string }[]
}

/**
 * The ONLY place a Payload `User` is normalized for the public frontend.
 * Deliberately an allowlist, never a spread: `email`, `role`, `active`,
 * and every auth-internal field (password/salt/hash/sessions/reset
 * tokens) must never reach this return value (AC-USER-008).
 */
export function mapUserToAuthorSummary(user: User | number | null | undefined): AuthorSummary | undefined {
  if (!user || typeof user === 'number') {
    return undefined
  }

  return {
    id: user.id,
    displayName: user.displayName,
    slug: user.slug ?? undefined,
    avatar: mapMediaToMediaData(user.avatar, {
      preferredSize: 'thumbnail',
      fallbackAlt: user.displayName,
    }),
    bio: user.bio ?? undefined,
    socialLinks: user.socialLinks?.map((link) => ({ platform: link.platform, url: link.url })),
  }
}
