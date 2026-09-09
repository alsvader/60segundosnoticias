import type { CollectionBeforeValidateHook } from 'payload'

import type { Post } from '../../../payload-types.ts'

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Generates `slug` from `title` only when the Post does not have one yet.
 * Never regenerates an existing slug when `title` changes later - editing
 * the slug afterward is always an explicit, separate action.
 */
export const generateSlugFromTitle: CollectionBeforeValidateHook<Post> = ({ data, originalDoc }) => {
  const hasExistingSlug = Boolean(originalDoc?.slug)
  const hasIncomingSlug = Boolean(data?.slug)

  if (hasExistingSlug || hasIncomingSlug || !data?.title) {
    return data
  }

  return { ...data, slug: slugify(data.title) }
}
