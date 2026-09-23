import type {
  CheckboxField,
  CollectionSlug,
  FieldHook,
  PayloadRequest,
  RowField,
  TextField,
  TextFieldSingleValidation,
} from 'payload'
import { slugField as payloadSlugField } from 'payload'

import { isReservedSlug } from '../../lib/constants/reserved-slugs.ts'
import { SLUG_PATTERN, slugify } from '../../lib/url/slugify.ts'
import { createNamespaceSlugValidate } from './validate-namespace-slug.ts'

type Slugify = NonNullable<Parameters<typeof payloadSlugField>[0]>['slugify']

type SlugFieldOptions = {
  /** Collection that owns the field; generated slugs are made unique within it. */
  collection: CollectionSlug
  /** Top-level field the slug is generated from. */
  useAsSlug?: string
  /**
   * Collection sharing the root `/[slug]` namespace (Categories <-> Pages).
   * Enables reserved-slug and cross-collection checks.
   */
  namespaceCollection?: CollectionSlug
  required?: boolean
}

const MAX_SUFFIX_ATTEMPTS = 50

async function isSlugTaken(
  req: PayloadRequest,
  collection: CollectionSlug,
  slug: string,
  excludeId?: number | string,
): Promise<boolean> {
  const result = await req.payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    pagination: false,
    req,
  })

  return result.docs.some((doc) => doc.id !== excludeId)
}

/**
 * Slug field shared by every collection with a public slug. Built on
 * Payload's native `slugField` (hidden `generateSlug` checkbox + admin
 * lock/"generate" UI): the slug is generated from `useAsSlug` on create
 * and stays stable afterwards unless edited explicitly.
 *
 * Only values generated from `useAsSlug` get a `-2`, `-3`... suffix to
 * avoid collisions; a slug typed by the user is normalized but never
 * silently changed, so collisions there are rejected by validation.
 */
export function slugField({
  collection,
  useAsSlug = 'title',
  namespaceCollection,
  required = true,
}: SlugFieldOptions): RowField {
  const namespaceValidate = namespaceCollection
    ? createNamespaceSlugValidate(namespaceCollection)
    : undefined

  const validate: TextFieldSingleValidation = async (value, options) => {
    // An empty slug has already been filled from `useAsSlug` by the time
    // this runs, so reaching here empty means there was nothing to derive.
    if (!value) {
      return required ? 'El slug es obligatorio.' : true
    }

    if (!SLUG_PATTERN.test(value)) {
      return 'El slug solo puede contener letras minúsculas sin acentos, números y guiones.'
    }

    return namespaceValidate ? namespaceValidate(value, options) : true
  }

  const generateUniqueSlug = async (
    req: PayloadRequest,
    source: string,
    options: { currentSlug?: string; excludeId?: number | string } = {},
  ): Promise<string | undefined> => {
    const base = slugify(source)

    if (!base) {
      return undefined
    }

    for (let attempt = 1; attempt <= MAX_SUFFIX_ATTEMPTS; attempt++) {
      const candidate = attempt === 1 ? base : `${base}-${attempt}`

      if (candidate === options.currentSlug) {
        return candidate
      }

      const blocked =
        (namespaceCollection && isReservedSlug(candidate)) ||
        (await isSlugTaken(req, collection, candidate, options.excludeId)) ||
        (namespaceCollection && (await isSlugTaken(req, namespaceCollection, candidate)))

      if (!blocked) {
        return candidate
      }
    }

    return base
  }

  // Runs before Payload's `generateSlug` checkbox hook, which calls
  // `slugify` without awaiting it - so async uniqueness can't live there.
  // Pre-filling the slug here means that hook only normalizes it.
  const fillUniqueSlug: FieldHook = async ({ originalDoc, previousValue, req, siblingData, value }) => {
    if (value || previousValue) {
      return value
    }

    const source = siblingData?.[useAsSlug] ?? originalDoc?.[useAsSlug]

    if (typeof source !== 'string') {
      return value
    }

    return (await generateUniqueSlug(req, source, { excludeId: originalDoc?.id })) ?? value
  }

  // Admin "generate" button (`@payloadcms/next/client#SlugField`), served
  // through `custom.slugify` and awaited by Payload's server function.
  const slugifyFromAdmin: Slugify = ({ data, req, valueToSlugify }) =>
    typeof valueToSlugify === 'string'
      ? generateUniqueSlug(req, valueToSlugify, {
          currentSlug: typeof data?.slug === 'string' ? data.slug : undefined,
          excludeId: data?.id,
        })
      : undefined

  return payloadSlugField({
    useAsSlug,
    required,
    position: 'sidebar',
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugify(valueToSlugify) || undefined : undefined,
    overrides: (row) => {
      const [checkbox, slug] = row.fields as [CheckboxField, TextField]

      checkbox.admin = {
        ...checkbox.admin,
        description: 'Cuando está activo, el slug se genera automáticamente al guardar.',
      }
      // Payload's hook regenerates the slug on every update while the
      // checkbox is still `true`. Rows that predate this field (or got the
      // column through a schema push) default to `true`, so guard on the
      // stored slug instead: once a document has one, updates never touch it.
      checkbox.hooks = {
        ...checkbox.hooks,
        beforeChange: (checkbox.hooks?.beforeChange ?? []).map(
          (hook): FieldHook =>
            (args) =>
              args.operation === 'update' && args.originalDoc?.slug ? false : hook(args),
        ),
      }
      Object.assign(slug, {
        label: 'Slug (URL)',
        validate,
        custom: { ...slug.custom, slugify: slugifyFromAdmin },
        hooks: { ...slug.hooks, beforeValidate: [...(slug.hooks?.beforeValidate ?? []), fillUniqueSlug] },
      })

      return row
    },
  })
}
