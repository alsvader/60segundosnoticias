import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

/**
 * A User cannot be deleted while a Post still references them as `author`
 * - an Admin must reassign those Posts first. The preferred normal path to
 * retire a Writer remains `active = false`, which this hook does not touch.
 */
export const preventDeleteWithPosts: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const authoredPosts = await req.payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      author: { equals: id },
    },
  })

  if (authoredPosts.totalDocs > 0) {
    throw new APIError(
      'No se puede eliminar este User: existen Posts que lo referencian como autor.',
      400,
    )
  }
}
