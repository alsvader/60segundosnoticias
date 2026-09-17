import { describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import type { Category, Page, Post, Tag } from '@/payload-types'

import { buildPageSearchDoc, buildPostSearchDoc } from './build-search-doc'

/**
 * `buildPostSearchDoc` solo llama al Local API para resolver `primaryCategory`/
 * `tags` cuando llegan como ids planos - aquí siempre llegan ya poblados
 * (el mismo shape que un guardado editorial normal, depth >= 1), así que un
 * Payload real nunca se invoca y este fake nunca necesita implementar nada.
 */
const unusedPayload = {} as Payload

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const category: Category = {
  id: 1,
  colorTheme: 'red',
  icon: 'newspaper',
  name: 'Deportes',
  slug: 'deportes',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as Category

const tag: Tag = { id: 1, name: 'Mundial', createdAt: '', updatedAt: '' } as Tag

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: 'Un título de prueba',
    slug: 'un-titulo-de-prueba',
    excerpt: 'Un excerpt corto',
    content: richText(['Texto plano del cuerpo del post.']),
    primaryCategory: category,
    tags: [tag],
    publishedAt: '2026-01-01T12:00:00.000Z',
    // Presente para probar que el documento de búsqueda nunca lo expone -
    // buildPostSearchDoc no lee `author` en absoluto.
    author: { id: 42, email: 'writer-secret@example.test', role: 'writer' } as unknown as Post['author'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as unknown as Post
}

describe('buildPostSearchDoc', () => {
  it('nunca incluye JSON crudo de Lexical, solo el texto plano extraído', async () => {
    const post = makePost({ content: richText(['Primer párrafo.', 'Segundo párrafo.']) })
    const doc = await buildPostSearchDoc(unusedPayload, post)

    expect(doc.searchText).toContain('Primer párrafo.')
    expect(doc.searchText).toContain('Segundo párrafo.')
    expect(doc.searchText).not.toContain('"root"')
    expect(doc.searchText).not.toContain('"children"')
    expect(doc.searchText).not.toMatch(/[{}[\]"]/)
  })

  it('nunca expone campos de autor no públicos (email, role)', async () => {
    const post = makePost()
    const doc = await buildPostSearchDoc(unusedPayload, post)

    const serialized = JSON.stringify(doc)
    expect(serialized).not.toContain('writer-secret@example.test')
    expect(serialized).not.toContain('"role"')
    expect(doc).not.toHaveProperty('author')
  })

  it('respeta el límite de 2000 caracteres, agregando una elipsis al recortar', async () => {
    const longParagraph = 'a'.repeat(3000)
    const post = makePost({ content: richText([longParagraph]), tags: [], excerpt: '' })
    const doc = await buildPostSearchDoc(unusedPayload, post)

    expect(doc.searchText.length).toBeLessThanOrEqual(2001)
    expect(doc.searchText.endsWith('…')).toBe(true)
  })

  it('no recorta texto por debajo del límite', async () => {
    const post = makePost({ content: richText(['Texto corto.']), tags: [] })
    const doc = await buildPostSearchDoc(unusedPayload, post)

    expect(doc.searchText.endsWith('…')).toBe(false)
  })

  it('resuelve categorySlug/categoryName desde la categoría ya poblada', async () => {
    const post = makePost()
    const doc = await buildPostSearchDoc(unusedPayload, post)

    expect(doc.categorySlug).toBe('deportes')
    expect(doc.categoryName).toBe('Deportes')
  })
})

describe('buildPageSearchDoc', () => {
  it('extrae el texto de los bloques del layout sin JSON crudo', () => {
    const page: Page = {
      id: 1,
      title: 'Página de prueba',
      slug: 'pagina-de-prueba',
      seo: { metaDescription: 'Descripción de prueba' },
      layout: [{ blockType: 'hero', eyebrow: 'Eyebrow', title: 'Título hero', description: 'Descripción hero' }],
      createdAt: '',
      updatedAt: '',
    } as unknown as Page

    const doc = buildPageSearchDoc(page)

    expect(doc.searchText).toContain('Título hero')
    expect(doc.excerpt).toBe('Descripción de prueba')
    expect(doc.categorySlug).toBe('')
    expect(doc.categoryName).toBe('')
    expect(doc.publishedAt).toBeNull()
  })
})
