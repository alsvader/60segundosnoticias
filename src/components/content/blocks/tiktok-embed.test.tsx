import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TikTokEmbed } from './tiktok-embed'

describe('TikTokEmbed', () => {
  it('muestra el skeleton mientras el iframe no ha cargado', () => {
    const { container } = render(<TikTokEmbed url="https://www.tiktok.com/@user/video/1234567890" />)
    expect(container.querySelector('[aria-hidden].animate-pulse')).toBeInTheDocument()
  })

  it('oculta el skeleton una vez que el iframe dispara onLoad', () => {
    const { container } = render(<TikTokEmbed url="https://www.tiktok.com/@user/video/1234567890" />)

    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    expect(iframe).toHaveAttribute('src', 'https://www.tiktok.com/player/v1/1234567890')

    fireEvent.load(iframe)

    expect(container.querySelector('[aria-hidden].animate-pulse')).not.toBeInTheDocument()
  })

  it('nunca interpola la URL cruda del admin en el iframe, solo el id numérico', () => {
    const { container } = render(
      <TikTokEmbed url="https://www.tiktok.com/@user/video/1234567890?is_copy_url=1&is_from_webapp=v1" />,
    )
    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).not.toContain('is_copy_url')
    expect(iframe.src).toBe('https://www.tiktok.com/player/v1/1234567890')
  })

  it('degrada a un link-out card cuando la URL no contiene un id de video reconocible', () => {
    render(<TikTokEmbed url="https://www.tiktok.com/@user" />)
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver video en TikTok' })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@user',
    )
  })
})
