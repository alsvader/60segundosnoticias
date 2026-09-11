'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { EmbedLinkCard } from '@/components/content/blocks/embed-link-card'

type FacebookVideoEmbedProps = {
  url: string
}

declare global {
  interface Window {
    FB?: { XFBML?: { parse?: (node?: HTMLElement) => void } }
  }
}

const SDK_SCRIPT_SRC = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0'
const SDK_SCRIPT_ID = 'facebook-jssdk'
// Longer than react-social-media-embed's own fb-post retryDelay (5000ms)
// so we never compete with it for the same script/parse cycle. Reels
// have no documented Meta support at all (see embed-provider.ts) - this
// timeout is what keeps that case from hanging forever, not a real embed
// fix for them.
const GIVE_UP_AFTER_MS = 8000

const PLACEHOLDER_CLASS_NAME =
  'flex min-h-40 w-full items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--paper-100)] type-metadata text-[var(--ink-700)]'

function loadFacebookSdk(onReady: () => void) {
  if (window.FB?.XFBML?.parse) {
    onReady()
    return
  }

  const existing = document.getElementById(SDK_SCRIPT_ID)
  if (existing) {
    existing.addEventListener('load', onReady, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = SDK_SCRIPT_ID
  script.src = SDK_SCRIPT_SRC
  script.async = true
  script.defer = true
  script.addEventListener('load', onReady, { once: true })
  document.head.appendChild(script)
}

/**
 * Meta's `fb-video` plugin (`react-social-media-embed` only implements
 * `fb-post` — see `isFacebookVideoUrl()`), for `/videos/`, `/watch/`, and
 * `/reel/` URLs. Unlike the library's `fb-post` component, this never
 * retries indefinitely: after `GIVE_UP_AFTER_MS` with no real content
 * (Meta's own SDK never populated the container - most likely because
 * the content genuinely isn't embeddable, e.g. a Reel, or a script load
 * failure), it degrades to the same link-out card as `generic` embeds,
 * instead of leaving a loading skeleton on screen forever.
 */
export function FacebookVideoEmbed({ url }: FacebookVideoEmbedProps) {
  const containerId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    let cancelled = false
    let pollInterval: ReturnType<typeof setInterval> | undefined
    let giveUpTimeout: ReturnType<typeof setTimeout> | undefined

    function processEmbed() {
      if (cancelled) return
      window.FB?.XFBML?.parse?.(containerRef.current ?? undefined)

      pollInterval = setInterval(() => {
        if (containerRef.current?.querySelector('iframe')) {
          setStatus('success')
          if (pollInterval) clearInterval(pollInterval)
          if (giveUpTimeout) clearTimeout(giveUpTimeout)
        }
      }, 200)
    }

    loadFacebookSdk(processEmbed)

    giveUpTimeout = setTimeout(() => {
      if (!cancelled) setStatus((current) => (current === 'success' ? current : 'failed'))
      if (pollInterval) clearInterval(pollInterval)
    }, GIVE_UP_AFTER_MS)

    return () => {
      cancelled = true
      if (pollInterval) clearInterval(pollInterval)
      if (giveUpTimeout) clearTimeout(giveUpTimeout)
    }
  }, [url])

  if (status === 'failed') {
    return <EmbedLinkCard href={url} label="Ver video en Facebook" />
  }

  return (
    <div className="w-full max-w-[550px]">
      <div
        ref={containerRef}
        id={containerId}
        className={status === 'loading' ? 'hidden' : undefined}
      >
        <div className="fb-video" data-href={url} data-width="550" data-show-text="false" />
      </div>
      {status === 'loading' ? <div aria-hidden className={PLACEHOLDER_CLASS_NAME} /> : null}
    </div>
  )
}
