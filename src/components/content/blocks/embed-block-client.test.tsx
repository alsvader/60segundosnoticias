import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `react-social-media-embed` hace peticiones oEmbed reales a cada
 * proveedor al montar - se mockea aquí para que EmbedBlockClient se
 * pruebe como despachador puro (qué provider recibe qué URL), sin
 * depender de red de terceros real.
 */
vi.mock('react-social-media-embed', () => ({
  InstagramEmbed: ({ url }: { url: string }) => <div data-testid="instagram-embed">{url}</div>,
  XEmbed: ({ url }: { url: string }) => <div data-testid="x-embed">{url}</div>,
  FacebookEmbed: ({ url }: { url: string }) => <div data-testid="facebook-post-embed">{url}</div>,
  LinkedInEmbed: ({ url }: { url: string }) => <div data-testid="linkedin-embed">{url}</div>,
}))

const { default: EmbedBlockClient } = await import('./embed-block-client')

describe('EmbedBlockClient', () => {
  beforeEach(() => {
    // Evita que el efecto de `FacebookVideoEmbed` (rama facebook/video)
    // intente cargar el SDK real de Meta - ver
    // facebook-video-embed.test.tsx.
    window.FB = { XFBML: { parse: vi.fn() } }
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'FB')
  })

  it('despacha instagram a InstagramEmbed', () => {
    render(<EmbedBlockClient provider="instagram" url="https://www.instagram.com/p/abc123/" />)
    expect(screen.getByTestId('instagram-embed')).toHaveTextContent('https://www.instagram.com/p/abc123/')
  })

  it('despacha x a XEmbed', () => {
    render(<EmbedBlockClient provider="x" url="https://x.com/user/status/123" />)
    expect(screen.getByTestId('x-embed')).toHaveTextContent('https://x.com/user/status/123')
  })

  it('despacha linkedin a LinkedInEmbed', () => {
    render(<EmbedBlockClient provider="linkedin" url="https://www.linkedin.com/embed/feed/update/urn:li:share:123" />)
    expect(screen.getByTestId('linkedin-embed')).toBeInTheDocument()
  })

  it('despacha facebook (post, no-video) a FacebookEmbed', () => {
    render(<EmbedBlockClient provider="facebook" url="https://www.facebook.com/60segundos/posts/123" />)
    expect(screen.getByTestId('facebook-post-embed')).toBeInTheDocument()
  })

  it('despacha facebook (video) al wrapper propio FacebookVideoEmbed, no a FacebookEmbed', () => {
    const { container } = render(<EmbedBlockClient provider="facebook" url="https://www.facebook.com/60segundos/videos/123" />)
    expect(screen.queryByTestId('facebook-post-embed')).not.toBeInTheDocument()
    // FacebookVideoEmbed arranca en estado "loading": contenedor .fb-video oculto + skeleton visible.
    expect(container.querySelector('.fb-video')).toBeInTheDocument()
  })

  it('despacha tiktok al wrapper propio TikTokEmbed, no a react-social-media-embed', () => {
    const { container } = render(<EmbedBlockClient provider="tiktok" url="https://www.tiktok.com/@user/video/123" />)
    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute('src', 'https://www.tiktok.com/player/v1/123')
  })
})
