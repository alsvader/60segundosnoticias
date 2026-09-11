export type ControlledEmbedProvider = 'instagram' | 'x' | 'tiktok' | 'facebook' | 'linkedin'

export type ResolvedEmbed =
  | { kind: 'controlled'; provider: ControlledEmbedProvider; url: string }
  | { kind: 'generic-link'; url: string; hostname: string }

const CONTROLLED_PROVIDER_HOSTS: Record<ControlledEmbedProvider, ReadonlySet<string>> = {
  instagram: new Set(['instagram.com', 'www.instagram.com']),
  x: new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']),
  tiktok: new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']),
  facebook: new Set(['facebook.com', 'www.facebook.com', 'fb.watch']),
  // The same host as a normal LinkedIn post URL - LinkedIn's embed requires
  // its own special `/embed/feed/update/urn:li:share:<id>` path, not a
  // different domain, so a per-host check alone can't distinguish a valid
  // embed URL from an ordinary post link. Admin guidance for that shape
  // lives on the Payload field itself (`EmbedBlock.ts`), not here.
  linkedin: new Set(['linkedin.com', 'www.linkedin.com']),
}

/**
 * `EmbedBlock` resolver (article-content-rendering). `instagram`/`x`/
 * `tiktok`/`facebook`/`linkedin` get their provider-specific embed
 * treatment (`react-social-media-embed`, rendered client-side - see
 * `embed-block-client.tsx`). `generic` never becomes an iframe/arbitrary
 * HTML - it degrades to a safe external-link card.
 *
 * Every controlled provider is checked against a per-provider host
 * allowlist, not just protocol - the underlying library does no such
 * validation itself (verified against the installed package: none of its
 * five embed components confirm a URL actually belongs to the claimed
 * platform, and `LinkedInEmbed` puts the raw `url` straight into an
 * `<iframe src>` with no sanitization at all, matching a known
 * unpatched-by-default XSS report in that library). This allowlist is
 * the only real safety net before a URL ever reaches one of those
 * components.
 */
export function resolveEmbed(
  provider: ControlledEmbedProvider | 'generic',
  rawUrl: string | null | undefined,
): ResolvedEmbed | undefined {
  if (!rawUrl) return undefined

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return undefined
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined

  if (provider === 'generic') {
    return { kind: 'generic-link', url: url.toString(), hostname: url.hostname }
  }

  if (!CONTROLLED_PROVIDER_HOSTS[provider].has(url.hostname.toLowerCase())) {
    return undefined
  }

  return { kind: 'controlled', provider, url: url.toString() }
}

const FACEBOOK_VIDEO_PATH_PATTERN = /\/(videos|watch|reel)(\/|$)/

/**
 * Meta's XFBML has two distinct plugins: `fb-post` (photo/text/link
 * posts) and `fb-video` (native videos and Reels) — `react-social-media-
 * embed`'s `FacebookEmbed` only implements `fb-post`, which structurally
 * cannot render `/videos/`, `/watch/`, or `/reel/` URLs (it will just
 * retry forever). This decides which of the two to use; it does not
 * change what `resolveEmbed()` validates - both paths are still the same
 * `facebook` provider at the schema/allowlist level.
 */
export function isFacebookVideoUrl(url: string): boolean {
  try {
    return FACEBOOK_VIDEO_PATH_PATTERN.test(new URL(url).pathname)
  } catch {
    return false
  }
}
