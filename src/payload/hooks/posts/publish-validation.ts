import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError } from 'payload'

import type { Post } from '../../../payload-types.ts'

const REQUIRED_TO_PUBLISH = [
  'title',
  'slug',
  'excerpt',
  'featuredImage',
  'primaryCategory',
  'author',
  'content',
] as const satisfies readonly (keyof Post)[]

const resultingStatus = (data: Partial<Post>, originalDoc?: Post): Post['_status'] =>
  data._status ?? originalDoc?._status ?? 'draft'

const hasValue = (field: (typeof REQUIRED_TO_PUBLISH)[number], value: unknown): boolean => {
  if (field === 'content') {
    const content = value as Post['content']
    return Boolean(content?.root?.children?.length)
  }
  return value !== null && value !== undefined && value !== ''
}

/**
 * Drafts may stay partial. Only a save that leaves the Post published (the
 * draft -> published transition, or any later edit that keeps it published)
 * must satisfy the editorial fields required by the Master Spec.
 */
export const publishValidation: CollectionBeforeChangeHook<Post> = ({ data, originalDoc, req }) => {
  if (resultingStatus(data, originalDoc) !== 'published') {
    return data
  }

  const errors = REQUIRED_TO_PUBLISH.filter((field) => {
    const value = field in data ? data[field] : originalDoc?.[field]
    return !hasValue(field, value)
  }).map((field) => ({
    path: field,
    message: `"${field}" es requerido para publicar.`,
  }))

  if (errors.length > 0) {
    throw new ValidationError({ collection: 'posts', errors, req })
  }

  return data
}

/**
 * `publishedAt` is assigned once, on the first publish, and stays stable
 * afterward - across later edits, unpublish/republish, and version restore
 * (a restore must never reintroduce a stale/null value from an older
 * version).
 */
export const assignPublishedAt: CollectionBeforeChangeHook<Post> = ({ data, originalDoc }) => {
  if (originalDoc?.publishedAt) {
    return { ...data, publishedAt: originalDoc.publishedAt }
  }

  if (resultingStatus(data, originalDoc) === 'published') {
    return { ...data, publishedAt: new Date().toISOString() }
  }

  return data
}
