import { createLocalReq } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { Payload, PayloadRequest } from 'payload'

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
 * Cubre specs/cms-integration-testing/spec.md, requirement
 * "Sincronización del índice de búsqueda y límites documentados de V1".
 */
describe('sincronización del índice de búsqueda', () => {
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
  })

  afterAll(async () => {
    const payload = await getTestPayload()
    await payload.destroy()
  })

  async function findSearchDocsByTitle(title: string) {
    const payload = await getTestPayload()
    return payload.find({
      collection: 'search',
      where: { title: { equals: title } },
      overrideAccess: true,
    })
  }

  it('un Post guardado como borrador nunca aparece en el índice de búsqueda', async () => {
    const payload = await getTestPayload()
    const title = 'Post en borrador nunca indexado (Fase 11)'
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug: 'search-draft-nunca-indexado',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
        excerpt: 'Excerpt.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido.']),
      },
      draft: true,
      overrideAccess: true,
    })
    createdPostIds.push(draft.id)

    expect((await findSearchDocsByTitle(title)).docs).toHaveLength(0)
  })

  it('publicar un Post lo indexa y una búsqueda por su título lo devuelve', async () => {
    const payload = await getTestPayload()
    const title = 'Post publicado indexado búsqueda (Fase 11)'
    const post = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug: 'search-publicado-indexado',
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

    const results = await findSearchDocsByTitle(title)
    expect(results.docs).toHaveLength(1)
    expect(results.docs[0]).toMatchObject({ title, slug: 'search-publicado-indexado' })
  })

  it('despublicar o eliminar un documento lo elimina del índice', async () => {
    const payload = await getTestPayload()
    const title = 'Post despublicado removido del índice (Fase 11)'
    const post = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug: 'search-despublicado-removido',
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
    expect((await findSearchDocsByTitle(title)).docs).toHaveLength(1)

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'draft' },
      overrideAccess: true,
    })
    expect((await findSearchDocsByTitle(title)).docs).toHaveLength(0)
  })

  it(
    'la reindexación manual es idempotente: ejecutarla dos veces no duplica resultados',
    async () => {
      const payload = await getTestPayload()
      const title = 'Post fijo para reindexación idempotente (Fase 11)'
      const post = await payload.create({
        collection: 'posts',
        data: {
          title,
          slug: 'search-reindex-idempotente',
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

      const runReindex = async () => {
        const req = await buildReindexRequest(payload)
        const handler = getReindexHandler(payload)
        const response = await handler(req)
        expect(response.status).toBe(200)
      }

      await runReindex()
      const afterFirst = await findSearchDocsByTitle(title)
      expect(afterFirst.docs).toHaveLength(1)

      await runReindex()
      const afterSecond = await findSearchDocsByTitle(title)
      expect(afterSecond.docs).toHaveLength(1)
    },
    30_000,
  )

  it('una consulta sin acentos no está obligada a coincidir con contenido acentuado (fuera de alcance en V1)', async () => {
    const payload = await getTestPayload()
    const title = 'Édición histórica de la Región (Fase 11)'
    const post = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug: 'search-acentos-fuera-de-alcance',
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

    // Documentando explícitamente que esto NO debe fallar si el sistema
    // nunca llega a devolverlo: la ausencia de coincidencia es válida.
    const results = await payload.find({
      collection: 'search',
      where: { title: { contains: 'edicion historica' } },
      overrideAccess: true,
    })
    expect(results.docs.every((doc) => doc.title !== title)).toBe(true)
  })
})

/**
 * El plugin de búsqueda no expone su handler de `/reindex` vía Local API -
 * es un endpoint REST propio (`generateReindexHandler`, ver
 * node_modules/@payloadcms/plugin-search) que espera un `PayloadRequest`
 * completo. `createLocalReq` (exportado por `payload`, el mismo mecanismo
 * interno de construcción de requests que usa el propio Local API)
 * produce ese objeto; solo faltan `json()` y `t()`, que el handler sí usa.
 */
async function buildReindexRequest(payload: Payload): Promise<PayloadRequest> {
  const admin = (
    await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1, overrideAccess: true })
  ).docs[0]
  const req = await createLocalReq({ user: admin }, payload)
  return Object.assign(req, {
    json: async () => ({ collections: ['posts', 'pages'] }),
    t: (key: string) => key,
  })
}

function getReindexHandler(payload: Payload) {
  const endpoints = (payload.collections['search'].config as { endpoints?: Array<{ path: string; handler: unknown }> })
    .endpoints
  const endpoint = endpoints?.find((e) => e.path === '/reindex')
  if (!endpoint) throw new Error('El plugin de búsqueda no registró el endpoint /reindex esperado')
  return endpoint.handler as (req: PayloadRequest) => Promise<Response>
}
