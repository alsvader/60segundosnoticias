import { searchPlugin } from '@payloadcms/plugin-search'

import type { Page, Post } from '@/payload-types'

import { anyone, isAdmin } from '../access/roles.ts'
import { buildPageSearchDoc, buildPostSearchDoc } from './build-search-doc.ts'

/**
 * Fase 9 (§36 del Master Spec): backend de indexación V1 sobre PostgreSQL,
 * sin servicio de búsqueda externo. Solo Posts y Pages publicados
 * (`syncDrafts: false`, `deleteDrafts: true` - Categories nunca se
 * registran como collection indexada; su `name`/`slug` solo llegan al
 * registro de un Post a través de `buildPostSearchDoc()`).
 *
 * `priority` (usado para Posts > Pages en igualdad de condiciones) lo
 * fija el propio plugin a partir de `defaultPriorities` - `beforeSync`
 * no necesita (ni debe) tocarlo.
 */
export const search = searchPlugin({
  collections: ['posts', 'pages'],
  syncDrafts: false,
  deleteDrafts: true,
  defaultPriorities: {
    posts: 10,
    pages: 5,
  },
  beforeSync: async ({ collectionSlug, originalDoc, payload, searchDoc }) => {
    if (collectionSlug === 'posts') {
      return { ...searchDoc, ...(await buildPostSearchDoc(payload, originalDoc as Post)) }
    }
    if (collectionSlug === 'pages') {
      return { ...searchDoc, ...buildPageSearchDoc(originalDoc as Page) }
    }
    return searchDoc
  },
  searchOverrides: {
    fields: ({ defaultFields }) => [
      ...defaultFields,
      { name: 'excerpt', type: 'text', admin: { readOnly: true } },
      { name: 'searchText', type: 'textarea', admin: { readOnly: true } },
      { name: 'slug', type: 'text', admin: { readOnly: true } },
      { name: 'categorySlug', type: 'text', admin: { readOnly: true } },
      { name: 'categoryName', type: 'text', admin: { readOnly: true } },
      { name: 'publishedAt', type: 'date', admin: { readOnly: true } },
    ],
    // El índice de Search es estado derivado/generado por el sistema, no
    // contenido editorial: solo Admin puede mutarlo directamente (lo
    // necesita, además, para poder usar la acción "Reindex" del propio
    // plugin, que exige `update` + `delete`). `read` queda público, igual
    // que Categories/Media - el índice, por política de sync, ya solo
    // contiene contenido publicado.
    access: {
      create: isAdmin,
      read: anyone,
      update: isAdmin,
      delete: isAdmin,
    },
  },
})
