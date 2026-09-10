import 'server-only'

import type { CollectionSlug, GlobalSlug, TypedCollectionSelect, Where } from 'payload'

import { getPayload } from '@/lib/payload/get-payload'

const PUBLISHED_STATUS_COLLECTIONS: ReadonlySet<CollectionSlug> = new Set(['posts', 'pages'])

function withPublishedConstraint(collection: CollectionSlug, where?: Where): Where | undefined {
  if (!PUBLISHED_STATUS_COLLECTIONS.has(collection)) {
    return where
  }

  const publishedOnly: Where = { _status: { equals: 'published' } }
  return where ? { and: [where, publishedOnly] } : publishedOnly
}

type FindPublishedArgs<TSlug extends CollectionSlug, TSelect extends TypedCollectionSelect[TSlug]> = {
  collection: TSlug
  where?: Where
  depth?: number
  limit?: number
  page?: number
  sort?: string
  /**
   * Payload's field-projection API (exclude mode: any `false` value
   * returns every other field; verified against the installed Payload
   * 3.87.1 select-mode logic in node_modules/payload/dist/utilities/
   * getSelectMode.js). Use to skip heavy fields (e.g. Lexical `content`)
   * on list queries - never to weaken the access boundary above.
   */
  select?: TSelect
}

/**
 * The ONLY way public/anonymous code in this app SHALL read Collections
 * from Payload. Always executes with `overrideAccess: false` -
 * hardcoded, never a parameter - so no call site can accidentally bypass
 * collection access and leak drafts. `posts`/`pages` additionally get an
 * explicit `_status: published` constraint merged into `where`, as
 * defense in depth independent of the collection's own access control.
 *
 * A future trusted preview/admin read (Phase 8 Draft Mode) SHALL use a
 * separate, explicitly named function instead of adding an
 * `overrideAccess` parameter here.
 */
export async function findPublished<TSlug extends CollectionSlug, TSelect extends TypedCollectionSelect[TSlug]>(
  args: FindPublishedArgs<TSlug, TSelect>,
) {
  const payload = await getPayload()

  return payload.find({
    collection: args.collection,
    where: withPublishedConstraint(args.collection, args.where),
    depth: args.depth,
    limit: args.limit,
    page: args.page,
    sort: args.sort,
    select: args.select,
    overrideAccess: false,
  })
}

/**
 * Convenience wrapper over `findPublished` for a single-document lookup
 * (e.g. by slug). Still goes through the same safe defaults.
 */
export async function findOnePublished<TSlug extends CollectionSlug, TSelect extends TypedCollectionSelect[TSlug]>(
  args: FindPublishedArgs<TSlug, TSelect>,
) {
  const result = await findPublished({ ...args, limit: 1 })
  return result.docs[0] ?? null
}

/**
 * The ONLY way public/anonymous code in this app SHALL read Globals from
 * Payload. Same `overrideAccess: false` guarantee as `findPublished`.
 */
export async function findGlobalPublished<TSlug extends GlobalSlug>(slug: TSlug, depth?: number) {
  const payload = await getPayload()

  return payload.findGlobal({
    slug,
    depth,
    overrideAccess: false,
  })
}
