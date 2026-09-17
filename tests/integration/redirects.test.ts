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
 * Cubre specs/cms-integration-testing/spec.md, requirement "Creación de
 * redirecciones y aplanado de cadenas" - a través del hook real
 * `createPostRedirect` (afterChange de Posts), no llamando
 * `createHistoricalRedirect` directamente (esa cobertura aislada ya vive
 * en src/lib/redirects/create-historical-redirect.test.ts).
 */
describe('creación de redirecciones vía cambios reales de Post', () => {
  let fixtures: BaseFixtures
  const createdPostIds: number[] = []

  beforeAll(async () => {
    const payload = await getTestPayload()
    fixtures = await seedBaseFixtures(payload)
  })

  afterEach(async () => {
    const payload = await getTestPayload()
    for (const id of createdPostIds.splice(0)) {
      await payload.delete({ collection: 'posts', id, overrideAccess: true }).catch(() => undefined)
    }
    // Limpieza dirigida de Redirects creados por estas pruebas (nombres
    // fijos, sin overlap con otros archivos de integración).
    const stale = await payload.find({
      collection: 'redirects',
      where: { from: { like: '/fixture-noticias/redir-' } },
      overrideAccess: true,
      limit: 100,
    })
    for (const doc of stale.docs) {
      await payload.delete({ collection: 'redirects', id: doc.id, overrideAccess: true })
    }
    const staleCategoryChange = await payload.find({
      collection: 'redirects',
      where: { from: { like: '/fixture-noticias/cat-change-' } },
      overrideAccess: true,
      limit: 100,
    })
    for (const doc of staleCategoryChange.docs) {
      await payload.delete({ collection: 'redirects', id: doc.id, overrideAccess: true })
    }
  })

  afterAll(async () => {
    const payload = await getTestPayload()
    await payload.destroy()
  })

  async function createPublishedPost(slug: string, categoryId: number) {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: `Post ${slug}`,
        slug,
        primaryCategory: categoryId,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt fijo.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido fijo.']),
        _status: 'published',
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)
    return post
  }

  async function findRedirect(from: string) {
    const payload = await getTestPayload()
    const result = await payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      overrideAccess: true,
      limit: 1,
    })
    return result.docs[0]
  }

  it('un cambio simultáneo de slug y categoría produce exactamente un salto directo al destino final', async () => {
    const payload = await getTestPayload()
    const post = await createPublishedPost('cat-change-origen', fixtures.categories[0].id)

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { slug: 'cat-change-destino', primaryCategory: fixtures.categories[1].id },
      overrideAccess: true,
    })

    const redirect = await findRedirect('/fixture-noticias/cat-change-origen')
    expect(redirect).toMatchObject({ to: '/fixture-vlog/cat-change-destino', active: true })
  })

  it('aplana una cadena: al crear B->C, un redirect existente A->B se actualiza para apuntar directo a C', async () => {
    const payload = await getTestPayload()
    const post = await createPublishedPost('redir-a', fixtures.categories[0].id)

    // A -> B
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { slug: 'redir-b' },
      overrideAccess: true,
    })
    expect(await findRedirect('/fixture-noticias/redir-a')).toMatchObject({ to: '/fixture-noticias/redir-b' })

    // B -> C: debe aplanar A para que apunte directo a C.
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { slug: 'redir-c' },
      overrideAccess: true,
    })

    expect(await findRedirect('/fixture-noticias/redir-b')).toMatchObject({ to: '/fixture-noticias/redir-c' })
    expect(await findRedirect('/fixture-noticias/redir-a')).toMatchObject({ to: '/fixture-noticias/redir-c' })
  })

  it('detecta un ciclo y desactiva los redirects involucrados en vez de crear un bucle', async () => {
    const payload = await getTestPayload()
    const post = await createPublishedPost('redir-x', fixtures.categories[0].id)

    // X -> Y
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { slug: 'redir-y' },
      overrideAccess: true,
    })
    expect(await findRedirect('/fixture-noticias/redir-x')).toMatchObject({ active: true })

    // Volver a X completaría el ciclo X -> Y -> X.
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { slug: 'redir-x' },
      overrideAccess: true,
    })

    const cyclical = await findRedirect('/fixture-noticias/redir-x')
    expect(cyclical?.active).toBe(false)
  })

  it('eliminar un Post publicado sin renombrar nunca no crea ninguna redirección', async () => {
    const payload = await getTestPayload()
    const post = await createPublishedPost('redir-sin-cambios', fixtures.categories[0].id)

    await payload.delete({ collection: 'posts', id: post.id, overrideAccess: true })
    createdPostIds.splice(createdPostIds.indexOf(post.id), 1)

    expect(await findRedirect('/fixture-noticias/redir-sin-cambios')).toBeUndefined()
  })
})
