'use client'

import { Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'

import { FacebookLogo, WhatsAppLogo, XLogo } from '@/components/editorial/social-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ShareActionsProps = {
  /** Absolute URL - always the canonical Article URL (§35), never built here. */
  url: string
  title: string
  className?: string
}

/**
 * §35: Facebook/X/WhatsApp/Copy link/Web Share API — always the canonical
 * URL, never a per-component reconstruction. No dedicated "share to
 * Instagram" button exists (AC-SHARE-005); Native Share may surface
 * Instagram itself on supporting devices. Smallest client island: this is
 * the only interactive piece of the Article page.
 */
export function ShareActions({ url, title, className }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url })
    } catch {
      // User cancelled the native share sheet — not an error to surface.
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button asChild variant="default" size="default" data-network="facebook">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookLogo className="size-4" />
          Facebook
        </a>
      </Button>
      <Button asChild variant="default" size="default" data-network="x">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <XLogo className="size-4" />
          X
        </a>
      </Button>
      <Button asChild variant="default" size="default" data-network="whatsapp">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppLogo className="size-4" />
          WhatsApp
        </a>
      </Button>
      <Button type="button" variant="outline" size="default" onClick={handleCopy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Enlace copiado' : 'Copiar enlace'}
      </Button>
      {canNativeShare ? (
        <Button type="button" variant="outline" size="default" onClick={handleNativeShare}>
          <Share2 className="size-4" />
          Compartir
        </Button>
      ) : null}
    </div>
  )
}
