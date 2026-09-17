import { describe, expect, it } from 'vitest'

import { resolveLink, resolveLinks, resolveNavItems } from './resolve-link'

describe('resolveLink', () => {
  it('resuelve un link de tipo category', () => {
    const resolved = resolveLink({ label: 'Deportes', type: 'category', category: { slug: 'deportes' } })
    expect(resolved).toEqual({ href: '/deportes', label: 'Deportes', openInNewTab: undefined })
  })

  it('descarta un link de tipo category sin categoría seleccionada', () => {
    expect(resolveLink({ label: 'Deportes', type: 'category', category: null })).toBeUndefined()
  })

  it('resuelve un link de tipo page', () => {
    const resolved = resolveLink({ label: 'Nosotros', type: 'page', page: { slug: 'sobre-nosotros' } })
    expect(resolved).toEqual({ href: '/sobre-nosotros', label: 'Nosotros', openInNewTab: undefined })
  })

  it('descarta un item sin label', () => {
    expect(resolveLink({ type: 'external', url: 'https://example.com' })).toBeUndefined()
  })

  it('descarta un item ausente', () => {
    expect(resolveLink(null)).toBeUndefined()
    expect(resolveLink(undefined)).toBeUndefined()
  })

  it('acepta un esquema http/https en un link externo', () => {
    expect(resolveLink({ label: 'Externo', type: 'external', url: 'https://example.com' })).toEqual({
      href: 'https://example.com',
      label: 'Externo',
      external: true,
      openInNewTab: undefined,
    })
    expect(resolveLink({ label: 'Externo', type: 'external', url: 'http://example.com' })?.href).toBe(
      'http://example.com',
    )
  })

  it('rechaza un esquema javascript: (AC-SEC-007)', () => {
    expect(resolveLink({ label: 'Malicioso', type: 'external', url: 'javascript:alert(1)' })).toBeUndefined()
  })

  it('rechaza otros esquemas no http(s) (data:, mailto:, ftp:)', () => {
    expect(resolveLink({ label: 'x', type: 'external', url: 'data:text/html,<script>1</script>' })).toBeUndefined()
    expect(resolveLink({ label: 'x', type: 'external', url: 'mailto:a@b.com' })).toBeUndefined()
    expect(resolveLink({ label: 'x', type: 'external', url: 'ftp://example.com' })).toBeUndefined()
  })

  it('propaga openInNewTab cuando está definido', () => {
    expect(
      resolveLink({ label: 'Externo', type: 'external', url: 'https://example.com', openInNewTab: true }),
    ).toMatchObject({ openInNewTab: true })
  })
})

describe('resolveLinks', () => {
  it('descarta entradas mal configuradas sin romper el resto de la lista', () => {
    const resolved = resolveLinks([
      { label: 'Válido', type: 'external', url: 'https://example.com' },
      { label: 'Malicioso', type: 'external', url: 'javascript:alert(1)' },
      { type: 'external', url: 'https://sin-label.com' },
    ])
    expect(resolved).toEqual([{ href: 'https://example.com', label: 'Válido', external: true, openInNewTab: undefined }])
  })

  it('retorna un arreglo vacío si no hay items', () => {
    expect(resolveLinks(null)).toEqual([])
    expect(resolveLinks(undefined)).toEqual([])
  })
})

describe('resolveNavItems', () => {
  it('resuelve items con children de un solo nivel', () => {
    const resolved = resolveNavItems([
      {
        label: 'Más',
        type: 'external',
        url: 'https://example.com',
        children: [{ label: 'Sub', type: 'external', url: 'https://example.com/sub' }],
      },
    ])
    expect(resolved).toHaveLength(1)
    expect(resolved[0].children).toEqual([
      { href: 'https://example.com/sub', label: 'Sub', external: true, openInNewTab: undefined },
    ])
  })

  it('omite children cuando ninguno resuelve, en vez de un arreglo vacío', () => {
    const resolved = resolveNavItems([
      {
        label: 'Más',
        type: 'external',
        url: 'https://example.com',
        children: [{ label: 'Malicioso', type: 'external', url: 'javascript:alert(1)' }],
      },
    ])
    expect(resolved[0].children).toBeUndefined()
  })

  it('descarta el item padre mal configurado sin considerar sus children', () => {
    const resolved = resolveNavItems([
      {
        type: 'external',
        url: 'https://example.com',
        children: [{ label: 'Sub', type: 'external', url: 'https://example.com/sub' }],
      },
    ])
    expect(resolved).toEqual([])
  })
})
