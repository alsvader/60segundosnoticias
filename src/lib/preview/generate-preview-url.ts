import type { GeneratePreviewURL } from 'payload'

/**
 * Construye la URL que el botón "Preview" del Admin de Payload abre.
 * Deliberadamente sin `import 'server-only'` ni ninguna llamada a Payload/
 * DB: esta función es parte de la config de Collection/Global
 * (`Posts.ts`/`Pages.ts`/`Home.ts`), cargada también por `payload.config.ts`
 * bajo la CLI standalone. Solo lee `process.env.PREVIEW_SECRET` y arma un
 * path relativo - la resolución real del documento ocurre en
 * `/api/preview`, nunca aquí.
 */
function buildPreviewUrl(collection: 'posts' | 'pages' | 'home', id?: number | string): string | null {
  const secret = process.env.PREVIEW_SECRET
  if (!secret) {
    return null
  }

  const params = new URLSearchParams({ secret, collection })
  if (id !== undefined) {
    params.set('id', String(id))
  }

  return `/api/preview?${params.toString()}`
}

export const generatePostPreviewURL: GeneratePreviewURL = (doc) =>
  typeof doc.id === 'number' || typeof doc.id === 'string' ? buildPreviewUrl('posts', doc.id) : null

export const generatePagePreviewURL: GeneratePreviewURL = (doc) =>
  typeof doc.id === 'number' || typeof doc.id === 'string' ? buildPreviewUrl('pages', doc.id) : null

export const generateHomePreviewURL: GeneratePreviewURL = () => buildPreviewUrl('home')
