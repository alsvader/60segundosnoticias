import type { CollectionBeforeChangeHook } from 'payload'

import type { Post } from '../../../payload-types.ts'

/**
 * A Writer always becomes the author of a Post they create, and can never
 * reassign `author` afterward - Admin controls that field freely. Enforced
 * here (not just in the Admin UI) so it also holds for direct REST/GraphQL/
 * Local API writes.
 */
export const enforceAuthor: CollectionBeforeChangeHook<Post> = ({ data, originalDoc, operation, req }) => {
  if (req.user?.role !== 'writer') {
    return data
  }

  if (operation === 'create') {
    return { ...data, author: req.user.id }
  }

  if ('author' in data) {
    return { ...data, author: originalDoc?.author ?? null }
  }

  return data
}
