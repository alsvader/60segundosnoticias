import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FacebookVideoEmbed } from './facebook-video-embed'

const URL = 'https://www.facebook.com/60segundos/videos/1234567890'

describe('FacebookVideoEmbed', () => {
  beforeEach(() => {
    // Pre-poblar `window.FB` toma el atajo de `loadFacebookSdk` (llama
    // `onReady()` de inmediato) y evita por completo su rama de
    // `document.createElement('script')` - happy-dom no permite cargar
    // scripts externos de verdad en este entorno (lanza de forma
    // asíncrona, fuera del control de la prueba), así que ningún test de
    // este archivo necesita ejercitar esa rama para cubrir el
    // comportamiento real del componente.
    window.FB = { XFBML: { parse: vi.fn() } }
  })

  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(window, 'FB')
  })

  it('muestra el skeleton mientras espera a que el SDK de Meta monte el video, con el contenedor real oculto', () => {
    const { container } = render(<FacebookVideoEmbed url={URL} />)
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument()
    expect(container.querySelector('.fb-video')?.parentElement).toHaveClass('hidden')
  })

  it(
    'transiciona de skeleton a cargado cuando el poll detecta el iframe insertado por el SDK de Meta',
    async () => {
      vi.useFakeTimers()
      const { container } = render(<FacebookVideoEmbed url={URL} />)

      const realContainer = container.querySelector('.fb-video')?.parentElement as HTMLDivElement

      // Antes de que el poll (cada 200ms) detecte un <iframe> real, el
      // contenedor permanece oculto y el skeleton visible.
      expect(realContainer).toHaveClass('hidden')

      // happy-dom no permite insertar/navegar un <iframe> real en un
      // documento vivo en este entorno de prueba (carga de iframes
      // deshabilitada en vitest.config.ts) - se simula lo único que
      // `processEmbed` realmente observa (`querySelector('iframe')`
      // devolviendo un nodo) en vez de depender de un iframe real.
      vi.spyOn(realContainer, 'querySelector').mockReturnValue(document.createElement('span'))

      // El `setStatus('success')` del poll ocurre dentro de un callback
      // de `setInterval` (fuera de un evento manejado por React) - hay
      // que envolver el avance de tiempo en `act()` para que React vacíe
      // esa actualización de estado antes de aserar sobre el DOM.
      await act(() => vi.advanceTimersByTimeAsync(200))

      expect(realContainer).not.toHaveClass('hidden')
      expect(container.querySelector('[aria-hidden]')).not.toBeInTheDocument()
    },
    10000,
  )

  it(
    'degrada a un link-out card si el SDK de Meta nunca monta contenido real (Reels, fallo de script)',
    async () => {
      vi.useFakeTimers()
      // `window.FB.XFBML.parse` es un no-op (del beforeEach) - nunca
      // inserta un iframe real, así que el poll nunca encuentra nada y el
      // componente debe rendirse tras GIVE_UP_AFTER_MS, no quedarse
      // esperando indefinidamente.
      render(<FacebookVideoEmbed url={URL} />)

      await act(() => vi.advanceTimersByTimeAsync(8000))

      expect(screen.getByRole('link', { name: 'Ver video en Facebook' })).toHaveAttribute('href', URL)
    },
    10000,
  )
})
