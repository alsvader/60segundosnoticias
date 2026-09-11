import { ExternalLink } from 'lucide-react'

type EmbedLinkCardProps = {
  href: string
  label: string
  className?: string
}

/**
 * Shared safe link-out card — used both for `generic` embeds and as the
 * give-up fallback when a controlled embed (e.g. a Facebook video/Reel)
 * never actually mounts real content. Never an iframe, never raw HTML.
 */
export function EmbedLinkCard({ href, label, className }: EmbedLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--paper-100)] p-4 text-[var(--ink-950)] outline-none hover:bg-[var(--paper-200)] focus-visible:ring-3 focus-visible:ring-ring/50 ${className ?? ''}`}
    >
      <ExternalLink className="size-5 shrink-0" aria-hidden />
      <span className="type-body">{label}</span>
    </a>
  )
}
