import type { CollectionAfterChangeHook } from 'payload'

import type { Page } from '../../../payload-types.ts'
import { createHistoricalRedirect } from '@/lib/redirects/create-historical-redirect'
import { getPageUrl } from '@/lib/url/canonical'

/**
 * Genera un redirect histórico cuando cambia el `slug` de una Page que ya
 * estaba publicada - alcance aprobado explícitamente para esta change
 * (Decisión 4 del usuario), simétrico al tratamiento de Post/Category.
 */
export const createPageRedirect: CollectionAfterChangeHook<Page> = async ({ doc, previousDoc, req }) => {
  if (previousDoc?._status !== 'published' || previousDoc.slug === doc.slug) {
    return doc
  }

  await createHistoricalRedirect({
    req,
    from: getPageUrl(previousDoc.slug),
    to: getPageUrl(doc.slug),
  })

  return doc
}
