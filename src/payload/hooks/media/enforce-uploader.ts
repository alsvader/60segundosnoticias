import type { CollectionBeforeChangeHook } from 'payload'

import type { Media } from '../../../payload-types.ts'

/**
 * Records who uploaded a Media document, so ownership-based access
 * (`isOwnerOrAdmin('uploadedBy')`) has something to compare against. Only
 * set on create - never reassigned afterward.
 */
export const enforceUploader: CollectionBeforeChangeHook<Media> = ({ data, operation, req }) => {
  if (operation !== 'create' || !req.user) {
    return data
  }

  return { ...data, uploadedBy: req.user.id }
}
