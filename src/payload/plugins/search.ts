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
const DEFAULT_FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  priority: 'Prioridad',
  doc: 'Documento',
}

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
    labels: {
      singular: 'Resultado de búsqueda',
      plural: 'Índice de búsqueda',
    },
    admin: {
      description:
        'Resultados de búsqueda generados automáticamente a partir de las Noticias y Páginas publicadas. Los usa el buscador del sitio y se actualizan solos al crear o editar contenido.',
    },
    fields: ({ defaultFields }) => [
      // Solo cambia el label de los campos que define el plugin; `name`
      // y el resto de la configuración quedan intactos.
      ...defaultFields.map((field) =>
        'name' in field && field.name in DEFAULT_FIELD_LABELS
          ? { ...field, label: DEFAULT_FIELD_LABELS[field.name] }
          : field,
      ),
      { name: 'excerpt', label: 'Extracto', type: 'text', admin: { readOnly: true } },
      { name: 'searchText', label: 'Texto indexado', type: 'textarea', admin: { readOnly: true } },
      { name: 'slug', label: 'Slug (URL)', type: 'text', admin: { readOnly: true } },
      { name: 'categorySlug', label: 'Slug de la categoría', type: 'text', admin: { readOnly: true } },
      { name: 'categoryName', label: 'Nombre de la categoría', type: 'text', admin: { readOnly: true } },
      { name: 'publishedAt', label: 'Fecha de publicación', type: 'date', admin: { readOnly: true } },
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
