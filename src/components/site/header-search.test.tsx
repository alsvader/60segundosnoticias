import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { HeaderSearch } from './header-search'

function getInput() {
  return screen.getByLabelText('Buscar en el sitio') as HTMLInputElement
}

function getButton() {
  return screen.getByRole('button', { name: 'Buscar' })
}

describe('HeaderSearch', () => {
  it('empieza colapsado: input no enfocable ni visible para foco/lectores', () => {
    render(<HeaderSearch />)
    const input = getInput()
    expect(input).toHaveAttribute('aria-hidden', 'true')
    expect(input).toHaveAttribute('tabindex', '-1')
    expect(getButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('un primer click expande el input y le da foco, sin navegar', async () => {
    const user = userEvent.setup()
    render(<HeaderSearch />)

    await user.click(getButton())

    const input = getInput()
    expect(input).toHaveAttribute('aria-hidden', 'false')
    expect(input).toHaveAttribute('tabindex', '0')
    expect(getButton()).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('permite escribir en el input una vez expandido', async () => {
    const user = userEvent.setup()
    render(<HeaderSearch />)

    await user.click(getButton())
    const input = getInput()
    await waitFor(() => expect(input).toHaveFocus())
    await user.type(input, 'elecciones')

    expect(input).toHaveValue('elecciones')
  })

  it('Escape colapsa, limpia el valor y devuelve el foco al ícono', async () => {
    const user = userEvent.setup()
    render(<HeaderSearch />)

    await user.click(getButton())
    const input = getInput()
    await waitFor(() => expect(input).toHaveFocus())
    await user.type(input, 'elecciones')

    await user.keyboard('{Escape}')

    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('aria-hidden', 'true')
    await waitFor(() => expect(getButton()).toHaveFocus())
  })

  it('perder el foco fuera del formulario colapsa sin limpiar el valor', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <HeaderSearch />
        <button type="button">Otro elemento</button>
      </div>,
    )

    await user.click(getButton())
    const input = getInput()
    await waitFor(() => expect(input).toHaveFocus())
    await user.type(input, 'elecciones')

    await user.click(screen.getByRole('button', { name: 'Otro elemento' }))

    expect(getButton()).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('elecciones')
  })

  it('bloquea el envío cuando el valor recortado está vacío', async () => {
    const user = userEvent.setup()
    render(<HeaderSearch />)

    await user.click(getButton())
    const input = getInput()
    await waitFor(() => expect(input).toHaveFocus())
    await user.type(input, '   ')

    await user.click(getButton())

    // `onSubmit` de HeaderSearch bloquea el envío y devuelve el foco al
    // input cuando el valor recortado está vacío - si el envío hubiera
    // procedido, el foco no volvería a quedar aquí.
    expect(input).toHaveFocus()
    expect(input).toHaveValue('   ')
  })
})
