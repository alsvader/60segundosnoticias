import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

/**
 * A Category cannot be deleted while a Post still references it (as
 * `primaryCategory` or inside `additionalCategories`) - an Admin must
 * resolve those references first.
 */
export const preventDeleteWithPosts: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const referencingPosts = await req.payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      or: [
        { primaryCategory: { equals: id } },
        { additionalCategories: { equals: id } },
      ],
    },
  })

  if (referencingPosts.totalDocs > 0) {
    throw new APIError(
      'No se puede eliminar esta Category: existen Posts que la referencian.',
      400,
    )
  }
}
