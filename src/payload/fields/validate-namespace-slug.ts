import type { CollectionSlug, TextFieldSingleValidation } from 'payload'

import { isReservedSlug } from '../../lib/constants/reserved-slugs.ts'

/**
 * Slug validation shared by Categories and Pages: both live in the root
 * `/[slug]` namespace, so they must reject reserved slugs and must not
 * collide with each other. Shape/uniqueness-per-collection comes from
 * `slugField` itself; this only adds the cross-cutting namespace checks.
 */
export function createNamespaceSlugValidate(
  otherCollection: CollectionSlug,
): TextFieldSingleValidation {
  return async (value, { req, id }) => {
    if (!value) {
      return true
    }

    if (isReservedSlug(value)) {
      return `El slug "${value}" está reservado y no puede usarse.`
    }

    const collision = await req.payload.find({
      collection: otherCollection,
      where: {
        slug: { equals: value },
      },
      limit: 1,
      depth: 0,
      req,
    })

    const collidesWithOtherDoc = collision.docs.some((doc) => doc.id !== id)

    if (collidesWithOtherDoc) {
      return `El slug "${value}" ya está en uso en ${otherCollection}.`
    }

    return true
  }
}
