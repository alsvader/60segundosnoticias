import { revalidateTag } from 'next/cache'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { seedBaseFixtures, type BaseFixtures } from '../fixtures/builders.ts'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

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

/**
 * Cubre specs/cms-integration-testing/spec.md, requirement "Invalidación
 * de caché ante cambios que afectan lo publicado". `next/cache` se
 * mockea (en vez de dejar que la implementación real falle con
 * "static generation store missing", como ocurre en el resto de la
 * suite fuera de un request de Next) para poder aserar explícitamente
 * qué tags se invalidan y cuáles no - no solo que la escritura no se
 * rompe.
 */
describe('invalidación de caché', () => {
  let fixtures: BaseFixtures
  const createdPostIds: number[] = []
  const mockedRevalidateTag = vi.mocked(revalidateTag)

  beforeAll(async () => {
    const payload = await getTestPayload()
    fixtures = await seedBaseFixtures(payload)
  })

  beforeEach(() => {
    mockedRevalidateTag.mockClear()
    mockedRevalidateTag.mockImplementation(() => undefined)
  })

  afterEach(async () => {
    const payload = await getTestPayload()
    for (const id of createdPostIds.splice(0)) {
      await payload.delete({ collection: 'posts', id, overrideAccess: true }).catch(() => undefined)
    }
  })

  afterAll(async () => {
    const payload = await getTestPayload()
    await payload.destroy()
  })

  it('actualizar un Post publicado invalida su tag específico y los tags generales de listado', async () => {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Post publicado para invalidación',
        slug: 'cache-invalidacion-publicado',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido.']),
        _status: 'published',
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)

    mockedRevalidateTag.mockClear()

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: 'Post publicado para invalidación (editado)' },
      overrideAccess: true,
    })

    const calledTags = mockedRevalidateTag.mock.calls.map((call) => call[0])
    expect(calledTags).toContain(`post:${post.id}`)
    expect(calledTags).toContain('post:cache-invalidacion-publicado')
    expect(calledTags).toContain('posts')
    expect(calledTags).toContain('sitemap')
  })

  it('editar un Post que nunca ha sido publicado no invalida ninguna etiqueta pública', async () => {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: 'Post en borrador nunca publicado',
        slug: 'cache-invalidacion-solo-borrador',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido.']),
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)

    mockedRevalidateTag.mockClear()

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: 'Post en borrador editado, sigue sin publicar' },
      draft: true,
      overrideAccess: true,
    })

    expect(mockedRevalidateTag).not.toHaveBeenCalled()
  })

  it('una falla durante la invalidación nunca bloquea la escritura de Payload que la desencadenó', async () => {
    mockedRevalidateTag.mockImplementation(() => {
      throw new Error('Fallo simulado de invalidación de caché')
    })

    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Post publicado pese a fallo de invalidación',
        slug: 'cache-invalidacion-falla-no-bloquea',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido.']),
        _status: 'published',
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)

    expect(post.id).toBeDefined()
    expect(mockedRevalidateTag).toHaveBeenCalled()

    const reread = await payload.findByID({ collection: 'posts', id: post.id, overrideAccess: true })
    expect(reread.title).toBe('Post publicado pese a fallo de invalidación')
  })
})
