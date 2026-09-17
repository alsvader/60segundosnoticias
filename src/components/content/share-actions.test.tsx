import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ShareActions } from './share-actions'

const URL = 'https://example.test/deportes/gana-el-mundial'
const TITLE = 'Gana el mundial'

describe('ShareActions', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('los links de Facebook/X/WhatsApp usan siempre la URL canónica provista', () => {
    render(<ShareActions url={URL} title={TITLE} />)

    const facebookLink = screen.getByRole('link', { name: /facebook/i })
    expect(facebookLink).toHaveAttribute('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`)

    const xLink = screen.getByRole('link', { name: /^x$/i })
    expect(xLink).toHaveAttribute(
      'href',
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(URL)}&text=${encodeURIComponent(TITLE)}`,
    )

    const whatsappLink = screen.getByRole('link', { name: /whatsapp/i })
    expect(whatsappLink).toHaveAttribute('href', `https://wa.me/?text=${encodeURIComponent(`${TITLE} ${URL}`)}`)
  })

  describe('sin Web Share API disponible', () => {
    /**
     * `navigator.share` no existe en happy-dom por defecto, así que el
     * botón "Compartir" ya está ausente sin necesidad de stub alguno -
     * probarlo así evita depender de un stub de `navigator` cuyo momento
     * exacto importa (ver nota en el siguiente `describe`).
     */
    it('no muestra el botón "Compartir" nativo', () => {
      render(<ShareActions url={URL} title={TITLE} />)
      expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument()
    })

    it(
      'copia la URL al portapapeles y muestra feedback de "copiado" temporalmente',
      async () => {
        const user = userEvent.setup()
        render(<ShareActions url={URL} title={TITLE} />)

        // `userEvent.setup()` reemplaza `navigator` con su propio polyfill
        // de clipboard en cuanto detecta un objeto `navigator.clipboard`
        // preexistente (confirmado empíricamente) - stubear después de
        // `setup()` + `render()`, justo antes de interactuar, es lo único
        // que sobrevive hasta el click.
        const writeText = vi.fn().mockResolvedValue(undefined)
        vi.stubGlobal('navigator', { clipboard: { writeText } })

        const copyButton = screen.getByRole('button', { name: 'Copiar enlace' })
        await user.click(copyButton)

        expect(writeText).toHaveBeenCalledWith(URL)
        expect(await screen.findByRole('button', { name: 'Enlace copiado' })).toBeInTheDocument()

        await waitFor(() => expect(screen.getByRole('button', { name: 'Copiar enlace' })).toBeInTheDocument(), {
          timeout: 3000,
        })
      },
      6000,
    )
  })

  describe('con Web Share API disponible', () => {
    /**
     * `ShareActions` decide si renderiza el botón "Compartir" evaluando
     * `navigator.share` en el cuerpo del componente durante el primer
     * render - el stub debe existir *antes* de `render()`. Se stubea sin
     * la clave `clipboard` deliberadamente: incluirla dispara el reset de
     * `userEvent.setup()` descrito arriba antes de que el primer render
     * siquiera ocurra, y estas pruebas nunca hacen click en "Copiar
     * enlace".
     */
    it('muestra el botón "Compartir" y delega en navigator.share con el título y la URL', async () => {
      const share = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', { share })
      const user = userEvent.setup()
      render(<ShareActions url={URL} title={TITLE} />)

      const shareButton = screen.getByRole('button', { name: 'Compartir' })
      await user.click(shareButton)

      expect(share).toHaveBeenCalledWith({ title: TITLE, url: URL })
    })

    it('no propaga un error cuando el usuario cancela el share sheet nativo', async () => {
      const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
      vi.stubGlobal('navigator', { share })
      const user = userEvent.setup()
      render(<ShareActions url={URL} title={TITLE} />)

      await expect(user.click(screen.getByRole('button', { name: 'Compartir' }))).resolves.not.toThrow()
    })
  })
})
