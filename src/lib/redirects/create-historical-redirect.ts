import type { PayloadRequest } from 'payload'

import { normalizePath } from '@/lib/url/canonical'

const MAX_CHAIN_HOPS = 5

type CreateHistoricalRedirectArgs = {
  req: PayloadRequest
  /** The URL that stopped resolving (old slug/category/page path). */
  from: string
  /** The URL it should now redirect to (new slug/category/page path). */
  to: string
}

type RedirectChainDoc = { id: number }

/**
 * Helper único de creación/aplanado de redirect (design.md Decisión 5),
 * invocado desde los hooks `afterChange` de Posts/Categories/Pages cuando
 * cambia una URL canónica pública. Usa `req.payload` directamente (nunca
 * `src/lib/data/redirects.ts`, que permanece exclusivo de la app Next.js) -
 * deliberadamente sin `import 'server-only'`, porque los hooks de Payload
 * también se ejecutan bajo la CLI standalone (`payload run`/`migrate`).
 *
 * No genera redirect en `delete` (§30.8) - los llamadores solo invocan
 * esto en `afterChange`, nunca en `afterDelete`.
 */
export async function createHistoricalRedirect({ req, from, to }: CreateHistoricalRedirectArgs): Promise<void> {
  const normalizedFrom = normalizePath(from)
  const requestedTo = normalizePath(to)

  if (requestedTo === normalizedFrom) {
    return
  }

  // Aplanado hacia adelante: si el destino solicitado ya es el origen de
  // un redirect activo existente, seguir esa cadena en vez de encadenar
  // (A -> B -> C se convierte en A -> C). Si la cadena termina volviendo a
  // `normalizedFrom` (un ciclo - típicamente una URL que cambió y luego
  // volvió a su valor original), los redirects recorridos para llegar ahí
  // quedaron obsoletos (su propio `from` volvió a ser una ruta vigente) y
  // se desactivan - nunca se eliminan - y se usa el destino solicitado
  // originalmente en su lugar. Acotado a MAX_CHAIN_HOPS para no seguir un
  // ciclo indefinidamente si los datos existentes están malformados.
  let finalTarget = requestedTo
  const visited = new Set<string>([normalizedFrom])
  const traversedDocs: RedirectChainDoc[] = []

  for (let hop = 0; hop < MAX_CHAIN_HOPS; hop += 1) {
    if (visited.has(finalTarget)) {
      for (const doc of traversedDocs) {
        await req.payload.update({ collection: 'redirects', id: doc.id, data: { active: false }, overrideAccess: true })
      }
      finalTarget = requestedTo
      break
    }
    visited.add(finalTarget)

    const next = await req.payload.find({
      collection: 'redirects',
      where: { and: [{ from: { equals: finalTarget } }, { active: { equals: true } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const nextDoc = next.docs[0]
    if (!nextDoc) {
      break
    }

    traversedDocs.push(nextDoc)
    finalTarget = normalizePath(nextDoc.to)
  }

  // Autorredirect residual: si incluso el destino solicitado originalmente
  // coincide con el propio origen (no debería ocurrir dado el check
  // inicial, pero se mantiene como defensa), no hay nada que redirigir.
  if (finalTarget === normalizedFrom) {
    return
  }

  // Aplanado hacia atrás: cualquier redirect activo existente que ya
  // apuntaba a `normalizedFrom` (que está a punto de convertirse él mismo
  // en un origen de redirect) se repunta directo al destino final, en vez
  // de quedar encadenado a través de él.
  const pointingAtOldFrom = await req.payload.find({
    collection: 'redirects',
    where: { and: [{ to: { equals: normalizedFrom } }, { active: { equals: true } }] },
    limit: 0,
    depth: 0,
    overrideAccess: true,
  })

  for (const doc of pointingAtOldFrom.docs) {
    if (doc.to !== finalTarget && doc.from !== finalTarget) {
      await req.payload.update({
        collection: 'redirects',
        id: doc.id,
        data: { to: finalTarget },
        overrideAccess: true,
      })
    }
  }

  // Upsert: si ya existe un redirect activo con este `from` (por ejemplo,
  // el mismo documento cambió de slug más de una vez), se actualiza en vez
  // de crear uno duplicado - `from` es único e indexado.
  const existingForFrom = await req.payload.find({
    collection: 'redirects',
    where: { from: { equals: normalizedFrom } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingDoc = existingForFrom.docs[0]
  if (existingDoc) {
    if (existingDoc.to !== finalTarget || !existingDoc.active) {
      await req.payload.update({
        collection: 'redirects',
        id: existingDoc.id,
        data: { to: finalTarget, active: true },
        overrideAccess: true,
      })
    }
    return
  }

  await req.payload.create({
    collection: 'redirects',
    // §17: redirects generados automáticamente por cambios canónicos SHALL usar permanent redirect / 301.
    data: { from: normalizedFrom, to: finalTarget, statusCode: '301', active: true },
    overrideAccess: true,
  })
}
