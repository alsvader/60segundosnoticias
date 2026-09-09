import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

/**
 * By default, deleting a Media document referenced by a Post's
 * `featuredImage`/`seo.metaImage` silently sets that reference to `null`
 * at the database level (`ON DELETE SET NULL`) - including on an already
 * published Post whose `featuredImage` was required to publish it in the
 * first place. That does not satisfy AC-MEDIA-005 ("Media referenciada no
 * se elimina silenciosamente"), so this hook blocks the deletion instead.
 *
 * Scoped to Posts only (the collection this change already modifies
 * extensively, and the one whose publish validation depends on
 * `featuredImage`) - protecting Media referenced from Pages/Categories/
 * User avatars is out of scope for this change.
 */
export const preventDeleteReferenced: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const referencingPosts = await req.payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      or: [{ featuredImage: { equals: id } }, { 'seo.metaImage': { equals: id } }],
    },
  })

  if (referencingPosts.totalDocs > 0) {
    throw new APIError(
      'No se puede eliminar este Media: existen Posts que lo referencian.',
      400,
    )
  }
}
