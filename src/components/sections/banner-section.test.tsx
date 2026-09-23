import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BannerSection, type BannerData } from './banner-section'

const baseBanner: BannerData = {
  title: 'Descubre nuestros vlogs',
  description: 'Historias contadas en primera persona, cada semana.',
  variant: 'editorial',
  link: { href: '/vlog', label: 'Ver vlogs', external: false, openInNewTab: false },
}

const image = { src: 'https://example.com/vlog.jpg', alt: 'Reportera grabando en el malecón', width: 1200, height: 1600 }

describe('BannerSection', () => {
  it('expone el título como h2 y nombra la sección con él', () => {
    render(<BannerSection banner={baseBanner} />)

    const heading = screen.getByRole('heading', { level: 2, name: 'Descubre nuestros vlogs' })
    expect(screen.getByRole('region', { name: 'Descubre nuestros vlogs' })).toHaveAttribute(
      'aria-labelledby',
      heading.id,
    )
  })

  it('sin imagen centra el contenido y no reserva columna de imagen', () => {
    render(<BannerSection banner={baseBanner} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.parentElement).toHaveClass('text-center', 'items-center')
    expect(heading.parentElement?.parentElement).not.toHaveClass('lg:grid-cols-[3fr_2fr]')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('con imagen usa dos columnas desde lg y expone el alt de Media', () => {
    render(<BannerSection banner={{ ...baseBanner, image }} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.parentElement).not.toHaveClass('text-center')
    expect(heading.parentElement?.parentElement).toHaveClass('lg:grid-cols-[3fr_2fr]')
    expect(screen.getByRole('img', { name: image.alt })).toBeInTheDocument()
  })

  it('la imagen conserva su proporción original, sin caja recortada', () => {
    const { container } = render(<BannerSection banner={{ ...baseBanner, image }} />)

    const img = screen.getByRole('img', { name: image.alt })
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '1600')
    expect(img).toHaveClass('max-h-96', 'w-auto')
    expect(container.querySelector('[style*="aspect-ratio"]')).toBeNull()
  })

  it('renderiza el CTA como enlace interno sin target ni rel', () => {
    render(<BannerSection banner={baseBanner} />)

    const cta = screen.getByRole('link', { name: 'Ver vlogs' })
    expect(cta).toHaveAttribute('href', '/vlog')
    expect(cta).not.toHaveAttribute('target')
    expect(cta).not.toHaveAttribute('rel')
  })

  it('un enlace externo en nueva pestaña lleva target y rel seguros', () => {
    render(
      <BannerSection
        banner={{
          ...baseBanner,
          link: { href: 'https://example.com/boletin', label: 'Suscríbete', external: true, openInNewTab: true },
        }}
      />,
    )

    const cta = screen.getByRole('link', { name: 'Suscríbete' })
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('sin enlace resuelto se renderiza sin CTA', () => {
    render(<BannerSection banner={{ ...baseBanner, link: undefined }} />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('full-bleed (Home) envuelve el contenido en el Container del sitio', () => {
    const { container } = render(<BannerSection banner={baseBanner} />)

    expect(container.querySelector('section > .max-w-\\[var\\(--container-max\\)\\]')).not.toBeNull()
  })

  it('contained (Pages) no anida un segundo Container', () => {
    const { container } = render(<BannerSection banner={baseBanner} layout="contained" />)

    expect(container.querySelector('.max-w-\\[var\\(--container-max\\)\\]')).toBeNull()
    expect(container.querySelector('section > .rounded-xl')).not.toBeNull()
  })
})
