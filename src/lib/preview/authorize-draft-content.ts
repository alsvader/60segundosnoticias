import type { Post } from '@/payload-types'

type PreviewUser = { id: number; role?: string | null } | null | undefined

function extractUserId(value: number | { id: number } | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return value.id
  return undefined
}

/**
 * Defensa en profundidad explícita, no un parche sobre una fuga
 * confirmada: verificado en vivo (con credenciales de Admin reales) que
 * `payload.findByID()`/`find()` con `draft: true` + `overrideAccess: false`
 * + `user` YA resuelve correctamente por sí solo - un Writer que no es
 * autor ni Admin recibe de vuelta la versión *publicada* del Post, nunca
 * la revisión en Draft pendiente, incluso cuando el Post en general sigue
 * publicado. Esta función hace explícito y verificable en código ese
 * mismo invariante de seguridad (autor o Admin, nunca otro usuario, ve
 * contenido de una revisión en Draft), en vez de depender únicamente del
 * comportamiento interno de Payload.
 */
export function canViewDraftRevision(post: Pick<Post, '_status' | 'author'>, user: PreviewUser): boolean {
  if (post._status !== 'draft') {
    return true
  }

  if (!user) {
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  return extractUserId(post.author) === user.id
}
