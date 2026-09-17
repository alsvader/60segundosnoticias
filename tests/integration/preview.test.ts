import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { GET as previewRouteGET } from '@/app/api/preview/route'
import { resolvePreviewDocument } from '@/lib/preview/resolve-preview-document'
import { seedBaseFixtures, TEST_PASSWORD, type BaseFixtures } from '../fixtures/builders.ts'

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
 * Cubre specs/cms-integration-testing/spec.md, requirement "Autorización
 * de preview" - a través de `resolvePreviewDocument()`, la función real
 * usada por `src/app/api/preview/route.ts`. La ruta en sí (`redirect()`/
 * `draftMode()` de Next) depende de contexto de request de Next y se
 * cubre en tests/e2e/preview.spec.ts; aquí se prueba exclusivamente la
 * resolución/autorización del documento, que es Local API puro.
 */
describe('autorización de preview', () => {
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

  async function headersForUser(email: string): Promise<Headers> {
    const payload = await getTestPayload()
    const { token } = await payload.login({ collection: 'users', data: { email, password: TEST_PASSWORD } })
    return new Headers({ Cookie: `payload-token=${token}` })
  }

  async function createDraftPost(authorId: number, slug: string) {
    const payload = await getTestPayload()
    const post = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: `Post en borrador ${slug}`,
        slug,
        primaryCategory: fixtures.categories[0].id,
        author: authorId,
        excerpt: 'Excerpt.',
        featuredImage: fixtures.media.id,
        content: richText(['Contenido.']),
      },
      overrideAccess: true,
    })
    createdPostIds.push(post.id)
    return post
  }

  it('un Writer autenticado puede previsualizar su propio Post en borrador', async () => {
    const post = await createDraftPost(fixtures.writerA.id, 'preview-writer-propio')
    const headers = await headersForUser(fixtures.writerA.email)

    const resolved = await resolvePreviewDocument(headers, 'posts', String(post.id))

    expect(resolved).toMatchObject({ type: 'post', doc: { id: post.id } })
  })

  it('un Writer autenticado es denegado al previsualizar el borrador de otro writer', async () => {
    const post = await createDraftPost(fixtures.writerB.id, 'preview-writer-ajeno')
    const headers = await headersForUser(fixtures.writerA.email)

    const resolved = await resolvePreviewDocument(headers, 'posts', String(post.id))

    expect(resolved).toEqual({ type: 'not-found' })
  })

  it('un Admin puede previsualizar el borrador de cualquier writer', async () => {
    const post = await createDraftPost(fixtures.writerB.id, 'preview-admin-cualquiera')
    const headers = await headersForUser(fixtures.admin.email)

    const resolved = await resolvePreviewDocument(headers, 'posts', String(post.id))

    expect(resolved).toMatchObject({ type: 'post', doc: { id: post.id } })
  })

  it('manipular `collection`/`id` nunca deriva un destino fuera de lo que el documento resuelto realmente permite', async () => {
    const post = await createDraftPost(fixtures.writerB.id, 'preview-destino-no-manipulable')
    const headers = await headersForUser(fixtures.writerA.email)

    // El atacante (Writer A) intenta apuntar `id` al Post en borrador de
    // otro writer, y `collection` a un valor no soportado - ninguno de los
    // dos produce un documento resuelto utilizable como destino.
    expect(await resolvePreviewDocument(headers, 'posts', String(post.id))).toEqual({ type: 'not-found' })
    expect(await resolvePreviewDocument(headers, 'categories', String(fixtures.categories[0].id))).toEqual({
      type: 'not-found',
    })
    expect(await resolvePreviewDocument(headers, 'posts', 'not-a-real-id')).toEqual({ type: 'not-found' })
  })

  it('un secreto de preview inválido deniega el acceso sin importar el estado de autenticación', async () => {
    const post = await createDraftPost(fixtures.writerA.id, 'preview-secreto-invalido')

    // La comparación de secreto en `route.ts` ocurre antes de cualquier
    // llamada a `draftMode()`/`redirect()` (APIs de Next que exigen
    // contexto de request real) - una respuesta 401 se produce y se
    // retorna sin necesidad de ese contexto, así que el handler real es
    // invocable directamente aquí con una request corriente.
    const url = `http://localhost/api/preview?secret=un-secreto-incorrecto&collection=posts&id=${post.id}`

    // Sin autenticar.
    const anonymousResponse = await previewRouteGET(new Request(url))
    expect(anonymousResponse.status).toBe(401)

    // Autenticado como el propio autor del borrador - el secreto inválido
    // sigue denegando el acceso de todas formas.
    const headers = await headersForUser(fixtures.writerA.email)
    const authenticatedRequest = new Request(url, { headers })
    const authenticatedResponse = await previewRouteGET(authenticatedRequest)
    expect(authenticatedResponse.status).toBe(401)
  })
})
