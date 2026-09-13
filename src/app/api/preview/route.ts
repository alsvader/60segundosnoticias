import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { resolvePreviewDocument } from '@/lib/preview/resolve-preview-document'
import { getPageUrl, getPostUrl } from '@/lib/url/canonical'

/**
 * §31 del Master Spec / `specs/preview/spec.md`. Flujo:
 * valida `PREVIEW_SECRET` -> resuelve el documento con la sesión Payload
 * autenticada (nunca `overrideAccess: true`) -> calcula el destino desde
 * el documento ya resuelto (nunca de un parámetro de la solicitud, AC-SEC-007)
 * -> habilita Draft Mode -> redirige.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const collection = searchParams.get('collection')
  const id = searchParams.get('id')

  const expectedSecret = process.env.PREVIEW_SECRET
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response('Invalid preview secret', { status: 401 })
  }

  const resolved = await resolvePreviewDocument(request.headers, collection, id)

  if (resolved.type === 'not-found') {
    return new Response('Not found or not authorized', { status: 404 })
  }

  let destination: string | null = null

  if (resolved.type === 'home') {
    destination = '/'
  } else if (resolved.type === 'page') {
    destination = getPageUrl(resolved.doc.slug)
  } else {
    const primaryCategory = resolved.doc.primaryCategory
    destination = primaryCategory && typeof primaryCategory === 'object' ? getPostUrl(primaryCategory.slug, resolved.doc.slug) : null
  }

  if (!destination) {
    return new Response('Document is missing data required to preview it', { status: 422 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(destination)
}
