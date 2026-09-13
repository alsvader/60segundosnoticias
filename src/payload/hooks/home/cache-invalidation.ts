import type { GlobalAfterChangeHook } from 'payload'

import { invalidateHome } from '@/lib/cache/invalidate'

/** Home change (§40.3, AC-CACHE-004): Home only, and only when the change actually made (or kept) it published - a draft-only edit invalidates nothing public. */
export const invalidateHomeCache: GlobalAfterChangeHook = ({ doc, previousDoc }) => {
  const wasPublished = previousDoc?._status === 'published'
  const isPublished = doc._status === 'published'

  if (!wasPublished && !isPublished) {
    return doc
  }

  invalidateHome()

  return doc
}
