import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { seedBaseFixtures, type BaseFixtures } from '../fixtures/builders.ts'

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
 * Cubre specs/cms-integration-testing/spec.md, requirement "Ciclo de vida
 * de borrador y publicación". `publishValidation` (beforeChange) exige
 * excerpt/featuredImage/content para transicionar a publicado - se
 * incluyen siempre, incluso en los Posts que empiezan en borrador, porque
 * este archivo prueba la transición borrador→publicado, no ese
 * requirement de validación por separado.
 */
describe('ciclo de vida de borrador y publicación', () => {
  let fixtures: BaseFixtures
  const createdPostIds: number[] = []

  beforeAll(async () => {
    const payload = await getTestPayload()
    fixtures = await seedBaseFixtures(payload)
  })

  afterEach(async () => {
    const payload = await getTestPayload()
    for (const id of createdPostIds.splice(0)) {
      await payload.delete({ collection: 'posts', id, overrideAccess: true })
    }
  })

  afterAll(async () => {
    const payload = await getTestPayload()
    await payload.destroy()
  })

  async function readPublic(id: number) {
    const payload = await getTestPayload()
    return payload.find({
      collection: 'posts',
      where: { id: { equals: id } },
      overrideAccess: false,
      user: undefined,
    })
  }

  it('publicar un Post en borrador lo hace visible en una lectura pública subsecuente', async () => {
    const payload = await getTestPayload()
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'Post que será publicado',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt del post que será publicado.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido del post que será publicado.']),
      },
      draft: true,
      overrideAccess: true,
    })
    createdPostIds.push(draft.id)

    expect((await readPublic(draft.id)).docs).toHaveLength(0)

    await payload.update({
      collection: 'posts',
      id: draft.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })

    expect((await readPublic(draft.id)).docs).toHaveLength(1)
  })

  it('una nueva revisión en borrador sobre un Post publicado deja la versión pública sin cambios', async () => {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Título original publicado',
        slug: 'draft-publish-titulo-original',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt original.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido original.']),
        _status: 'published',
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)

    // Nueva revisión en borrador (draft: true) sobre el documento publicado.
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: 'Título en revisión sin publicar' },
      draft: true,
      overrideAccess: true,
    })

    const publicRead = await readPublic(post.id)
    expect(publicRead.docs[0]?.title).toBe('Título original publicado')
  })

  it('despublicar un Post elimina su visibilidad pública, y volver a publicar la restaura', async () => {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Post publicado que será despublicado',
        slug: 'draft-publish-sera-despublicado',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt del post que será despublicado.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido del post que será despublicado.']),
        _status: 'published',
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)

    expect((await readPublic(post.id)).docs).toHaveLength(1)

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'draft' },
      overrideAccess: true,
    })
    expect((await readPublic(post.id)).docs).toHaveLength(0)

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })
    expect((await readPublic(post.id)).docs).toHaveLength(1)
  })
})
