import 'server-only'

import { findPublished } from '@/lib/data/public-query'

export type SearchContentArgs = {
  query: string
  page?: number
  limit?: number
}

/**
 * Fase 9 (§36 del Master Spec): consulta la Collection `search` dedicada
 * de `@payloadcms/plugin-search` - nunca Posts/Pages directamente, y
 * nunca con un `LIKE` amplio armado a mano. `findPublished()` ya
 * garantiza `overrideAccess: false`; la Collection `search` no tiene
 * `_status` (solo contiene contenido ya publicado por política de sync
 * del plugin), así que `withPublishedConstraint()` no le agrega ningún
 * filtro adicional - eso es correcto, no un descuido.
 *
 * Deliberadamente SIN `unstable_cache`, a diferencia de cada otra
 * función de este DAL: la cardinalidad de `query` es arbitraria, así que
 * cachear por valor de búsqueda no tiene un límite razonable. Cada
 * solicitud a `/buscar` lee la base en vivo.
 *
 * `contains` sobre un campo de texto en el adaptador Postgres se traduce
 * a `ILIKE` por cada palabra de `query` (unidas con AND) dentro de ESE
 * campo - no hay coincidencia entre campos distintos ni tolerancia a
 * acentos/errores tipográficos (limitación V1 documentada).
 */
export async function searchContent({ query, page = 1, limit = 12 }: SearchContentArgs) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return { docs: [], page: 1, totalDocs: 0, totalPages: 0, query: '' }
  }

  const result = await findPublished({
    collection: 'search',
    where: {
      or: [
        { title: { contains: trimmedQuery } },
        { excerpt: { contains: trimmedQuery } },
        { searchText: { contains: trimmedQuery } },
      ],
    },
    sort: '-priority,-publishedAt',
    page,
    limit,
    depth: 0,
    select: { searchText: false },
  })

  return {
    docs: result.docs,
    page: result.page ?? 1,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    query: trimmedQuery,
  }
}
