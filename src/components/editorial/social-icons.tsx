type IconProps = {
  className?: string
}

/**
 * Brand glyphs shared by any UI that links out to a social network — the
 * share buttons (`ShareActions`) and the author byline (`AuthorCard`).
 * Kept here once instead of duplicated per consumer.
 */
export function FacebookLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
    </svg>
  )
}

export function XLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function WhatsAppLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.031 0C5.436 0 .1 5.336.1 11.929c0 2.105.55 4.161 1.594 5.972L0 24l6.246-1.634a11.88 11.88 0 0 0 5.785 1.474h.005c6.594 0 11.929-5.335 11.929-11.928C23.965 5.336 18.637.001 12.031 0zm0 21.816h-.004a9.9 9.9 0 0 1-5.043-1.38l-.362-.214-3.741.981 1-3.648-.236-.374a9.86 9.86 0 0 1-1.516-5.253c0-5.462 4.448-9.91 9.913-9.91 2.648 0 5.135 1.032 7.006 2.906a9.845 9.845 0 0 1 2.897 7.01c-.003 5.462-4.451 9.882-9.914 9.882z" />
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    </svg>
  )
}

export function InstagramLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174 4 4 0 0 1 7.914-1.174z" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function YouTubeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function TikTokLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82c-1.06-.92-1.7-2.26-1.7-3.75h-3.14v13.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.6-2.6 2.59 2.59 0 0 1 3.31-2.49V9.7a5.74 5.74 0 0 0-.71-.05A5.73 5.73 0 1 0 15 15.34V8.87a8.02 8.02 0 0 0 4.69 1.5V7.24a4.68 4.68 0 0 1-3.09-1.42z" />
    </svg>
  )
}
