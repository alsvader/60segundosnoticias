import type { CollectionSlug } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { seedBaseFixtures, type BaseFixtures } from '../fixtures/builders.ts'

/**
 * Cubre openspec/changes/auto-slug-generation: specs/post-slug-lifecycle y
 * specs/slug-namespace-integrity - generación automática del slug desde el
 * campo fuente de cada Collection, estabilidad frente a ediciones y
 * deduplicación con sufijo.
 */
describe('generación automática de slugs', () => {
  let fixtures: BaseFixtures
  const created: { collection: CollectionSlug; id: number }[] = []

  beforeAll(async () => {
    const payload = await getTestPayload()
    fixtures = await seedBaseFixtures(payload)
  })

  afterEach(async () => {
    const payload = await getTestPayload()
    for (const { collection, id } of created.splice(0).reverse()) {
      await payload.delete({ collection, id, overrideAccess: true }).catch(() => undefined)
    }
  })

  afterAll(async () => {
    const payload = await getTestPayload()
    await payload.destroy()
  })

  function track<T extends { id: number }>(collection: CollectionSlug, doc: T): T {
    created.push({ collection, id: doc.id })
    return doc
  }

  async function createDraftPost(title: string, slug?: string) {
    const payload = await getTestPayload()
    return track(
      'posts',
      await payload.create({
        collection: 'posts',
        data: {
          title,
          ...(slug ? { slug } : {}),
          author: fixtures.writerA.id,
          primaryCategory: fixtures.categories[0].id,
        } as never,
        draft: true,
        overrideAccess: true,
      }),
    )
  }

  async function createPage(title: string, slug?: string) {
    const payload = await getTestPayload()
    return track(
      'pages',
      await payload.create({
        collection: 'pages',
        data: { title, ...(slug ? { slug } : {}) } as never,
        draft: true,
        overrideAccess: true,
      }),
    )
  }

  describe('generación desde el campo fuente', () => {
    it('Post: genera el slug desde `title` quitando acentos y signos', async () => {
      const post = await createDraftPost('Política Económica ¡Hoy! slug-gen')
      expect(post.slug).toBe('politica-economica-hoy-slug-gen')
    })

    it('Post: convierte ñ/Ñ en n', async () => {
      const post = await createDraftPost('NIÑOS de España celebran el Año Nuevo slug-gen')
      expect(post.slug).toBe('ninos-de-espana-celebran-el-ano-nuevo-slug-gen')
    })

    it('Page: genera el slug desde `title`', async () => {
      const page = await createPage('Página Institucional slug-gen')
      expect(page.slug).toBe('pagina-institucional-slug-gen')
    })

    it('Category: genera el slug desde `name`', async () => {
      const payload = await getTestPayload()
      const category = track(
        'categories',
        await payload.create({
          collection: 'categories',
          data: { name: 'Educación y Ciencia slug-gen' } as never,
          overrideAccess: true,
        }),
      )
      expect(category.slug).toBe('educacion-y-ciencia-slug-gen')
    })

    it('Tag: genera el slug desde `name`', async () => {
      const payload = await getTestPayload()
      const tag = track(
        'tags',
        await payload.create({
          collection: 'tags',
          data: { name: 'Elecciones 2027 slug-gen' } as never,
          overrideAccess: true,
        }),
      )
      expect(tag.slug).toBe('elecciones-2027-slug-gen')
    })

    it('User: genera el slug desde `displayName`', async () => {
      const payload = await getTestPayload()
      const user = track(
        'users',
        await payload.create({
          collection: 'users',
          data: {
            email: 'slug-gen.user@example.test',
            password: 'TestOnlyFixturePass123!',
            displayName: 'María José Peña slug-gen',
            role: 'writer',
          },
          overrideAccess: true,
        }),
      )
      expect(user.slug).toBe('maria-jose-pena-slug-gen')
    })
  })

  describe('estabilidad y edición manual', () => {
    it('editar el título de un Post no cambia su slug', async () => {
      const payload = await getTestPayload()
      const post = await createDraftPost('Titulo original slug-gen')

      const updated = await payload.update({
        collection: 'posts',
        id: post.id,
        data: { title: 'Titulo completamente distinto slug-gen' },
        draft: true,
        overrideAccess: true,
      })

      expect(updated.slug).toBe('titulo-original-slug-gen')
    })

    it('editar el título de un Post publicado no cambia su slug', async () => {
      const payload = await getTestPayload()
      const original = fixtures.publishedPost.slug

      const updated = await payload.update({
        collection: 'posts',
        id: fixtures.publishedPost.id,
        data: { title: `${fixtures.publishedPost.title} (editado)` },
        overrideAccess: true,
      })

      expect(updated.slug).toBe(original)

      await payload.update({
        collection: 'posts',
        id: fixtures.publishedPost.id,
        data: { title: fixtures.publishedPost.title },
        overrideAccess: true,
      })
    })

    it('no regenera el slug de un documento que quedó con `generateSlug: true`', async () => {
      // Filas creadas antes de este campo o por un schema push reciben el
      // default `true` de la columna en lugar del `false` de la migración.
      const payload = await getTestPayload()
      const post = await createDraftPost('Titulo heredado slug-gen')

      const updated = await payload.update({
        collection: 'posts',
        id: post.id,
        data: { generateSlug: true, title: 'Titulo heredado editado slug-gen' },
        draft: true,
        overrideAccess: true,
      })

      expect(updated.slug).toBe('titulo-heredado-slug-gen')
      expect(updated.generateSlug).toBe(false)
    })

    it('editar el nombre de una Category no cambia su slug', async () => {
      const payload = await getTestPayload()
      const category = track(
        'categories',
        await payload.create({
          collection: 'categories',
          data: { name: 'Categoria estable slug-gen' } as never,
          overrideAccess: true,
        }),
      )

      const updated = await payload.update({
        collection: 'categories',
        id: category.id,
        data: { name: 'Categoria renombrada slug-gen' },
        overrideAccess: true,
      })

      expect(updated.slug).toBe('categoria-estable-slug-gen')
    })

    it('respeta un slug explícito al crear', async () => {
      const post = await createDraftPost('Titulo con slug manual slug-gen', 'slug-manual-slug-gen')
      expect(post.slug).toBe('slug-manual-slug-gen')
    })

    it('normaliza un slug explícito al crear', async () => {
      const post = await createDraftPost('Titulo con slug sin normalizar slug-gen', 'Mi Slug Manual slug-gen!')
      expect(post.slug).toBe('mi-slug-manual-slug-gen')
    })

    it('permite editar el slug explícitamente', async () => {
      const payload = await getTestPayload()
      const post = await createDraftPost('Titulo editable slug-gen')

      const updated = await payload.update({
        collection: 'posts',
        id: post.id,
        data: { slug: 'nuevo-slug-editado-slug-gen' },
        draft: true,
        overrideAccess: true,
      })

      expect(updated.slug).toBe('nuevo-slug-editado-slug-gen')
    })

    it('rechaza un slug manual con formato inválido', async () => {
      const payload = await getTestPayload()
      const tag = track(
        'tags',
        await payload.create({
          collection: 'tags',
          data: { name: 'Tag formato slug-gen' } as never,
          overrideAccess: true,
        }),
      )

      await expect(
        payload.update({
          collection: 'tags',
          id: tag.id,
          data: { slug: 'Mi Slug!' },
          overrideAccess: true,
        }),
      ).rejects.toThrow()
    })
  })

  describe('deduplicación', () => {
    it('agrega `-2` cuando el título genera un slug ya usado', async () => {
      const first = await createDraftPost('Sismo en CDMX slug-gen')
      const second = await createDraftPost('Sismo en CDMX slug-gen')

      expect(first.slug).toBe('sismo-en-cdmx-slug-gen')
      expect(second.slug).toBe('sismo-en-cdmx-slug-gen-2')
    })

    it('rechaza un slug explícito duplicado en lugar de agregar sufijo', async () => {
      const payload = await getTestPayload()
      track(
        'tags',
        await payload.create({
          collection: 'tags',
          data: { name: 'Tag original slug-gen', slug: 'tag-duplicado-slug-gen' },
          overrideAccess: true,
        }),
      )

      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Tag copia slug-gen', slug: 'tag-duplicado-slug-gen' },
          overrideAccess: true,
        }),
      ).rejects.toThrow()
    })
  })

  describe('namespace raíz Categories/Pages', () => {
    it('una Page titulada como un reserved slug recibe sufijo', async () => {
      const page = await createPage('Admin')
      expect(page.slug).toBe('admin-2')
    })

    it('una Page con el título de una Category existente recibe sufijo', async () => {
      const categorySlug = fixtures.categories[0].slug
      const page = await createPage(fixtures.categories[0].name)
      expect(page.slug).toBe(`${categorySlug}-2`)
    })

    it('rechaza un slug explícito reservado en Category', async () => {
      const payload = await getTestPayload()
      await expect(
        payload.create({
          collection: 'categories',
          data: { name: 'Categoria reservada slug-gen', slug: 'admin' } as never,
          overrideAccess: true,
        }),
      ).rejects.toThrow()
    })
  })
})
