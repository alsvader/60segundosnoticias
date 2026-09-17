import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { Post } from '@/payload-types'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { seedBaseFixtures, type BaseFixtures } from '../fixtures/builders.ts'

/**
 * Cubre specs/cms-integration-testing/spec.md, requirements "Límites de
 * permisos del rol Writer" y "La lectura pública excluye contenido en
 * borrador". Usa `roles.ts` real vía `overrideAccess: false` + `user` en
 * el Local API - nunca se mockea `access`.
 */
describe('control de acceso de Posts', () => {
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

  let postCounter = 0

  async function createOwnedPost(authorId: number, title: string): Promise<Post> {
    const payload = await getTestPayload()
    postCounter += 1
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title,
        slug: `access-control-fixture-${postCounter}`,
        primaryCategory: fixtures.categories[0].id,
        author: authorId,
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)
    return post
  }

  it('el Writer A puede actualizar un Post cuyo autor es el Writer A', async () => {
    const payload = await getTestPayload()
    const post = await createOwnedPost(fixtures.writerA.id, 'Post de Writer A')

    await expect(
      payload.update({
        collection: 'posts',
        id: post.id,
        data: { title: 'Post de Writer A (editado)' },
        overrideAccess: false,
        user: fixtures.writerA,
      }),
    ).resolves.toMatchObject({ title: 'Post de Writer A (editado)' })
  })

  it('el Writer A queda bloqueado al intentar actualizar un Post cuyo autor es el Writer B', async () => {
    const payload = await getTestPayload()
    const post = await createOwnedPost(fixtures.writerB.id, 'Post de Writer B')

    await expect(
      payload.update({
        collection: 'posts',
        id: post.id,
        data: { title: 'Intento de Writer A' },
        overrideAccess: false,
        user: fixtures.writerA,
      }),
    ).rejects.toThrow()
  })

  it('la autoría no puede falsificarse al crear: el Writer autenticado siempre queda como autor', async () => {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Intento de falsificar autoría (create)',
        slug: 'access-control-autoria-create',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerB.id, // el Writer A intenta nombrar a Writer B
      },
      overrideAccess: false,
      user: fixtures.writerA,
    })
    createdPostIds.push(post.id)

    const authorId = typeof post.author === 'object' ? post.author?.id : post.author
    expect(authorId).toBe(fixtures.writerA.id)
  })

  it('la autoría no puede falsificarse al actualizar: el campo `author` enviado por el cliente se ignora', async () => {
    const payload = await getTestPayload()
    const post = await createOwnedPost(fixtures.writerA.id, 'Post de Writer A (autoría)')

    const updated = await payload.update({
      collection: 'posts',
      id: post.id,
      data: { author: fixtures.writerB.id },
      overrideAccess: false,
      user: fixtures.writerA,
    })

    const authorId = typeof updated.author === 'object' ? updated.author?.id : updated.author
    expect(authorId).toBe(fixtures.writerA.id)
  })

  it('un Admin puede administrar cualquier Post sin importar el autor', async () => {
    const payload = await getTestPayload()
    const post = await createOwnedPost(fixtures.writerB.id, 'Post administrado por Admin')

    await expect(
      payload.update({
        collection: 'posts',
        id: post.id,
        data: { title: 'Editado por Admin' },
        overrideAccess: false,
        user: fixtures.admin,
      }),
    ).resolves.toMatchObject({ title: 'Editado por Admin' })
  })

  it('una lectura pública anónima nunca incluye un Post en borrador', async () => {
    const payload = await getTestPayload()
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'Post en borrador excluido de lectura pública',
        primaryCategory: fixtures.categories[0].id,
        author: fixtures.writerA.id,
      },
      draft: true,
      overrideAccess: true,
    })
    createdPostIds.push(draft.id)

    const publicResults = await payload.find({
      collection: 'posts',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
      user: undefined,
    })

    expect(publicResults.docs).toHaveLength(0)
  })
})
