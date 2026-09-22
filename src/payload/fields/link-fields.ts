import type { ArrayField } from 'payload'

/**
 * The reusable link model referenced by Master Spec §27/§28: a link is
 * either a Category, a Page, or an external URL. Shared between
 * Navigation items and Footer columns/legal links so both Globals use
 * the exact same shape instead of Footer inventing a plain label/url pair.
 */
export const linkFields: ArrayField['fields'] = [
  {
    name: 'label',
    label: 'Texto',
    type: 'text',
    required: true,
  },
  {
    name: 'type',
    label: 'Tipo de enlace',
    type: 'select',
    required: true,
    options: [
      { label: 'Categoría', value: 'category' },
      { label: 'Página', value: 'page' },
      { label: 'Externo', value: 'external' },
    ],
  },
  {
    name: 'category',
    label: 'Categoría',
    type: 'relationship',
    relationTo: 'categories',
  },
  {
    name: 'page',
    label: 'Página',
    type: 'relationship',
    relationTo: 'pages',
  },
  {
    name: 'url',
    label: 'URL',
    type: 'text',
  },
  {
    name: 'openInNewTab',
    label: 'Abrir en nueva pestaña',
    type: 'checkbox',
    defaultValue: false,
  },
]

/**
 * Same shape as `linkFields`, with `label`/`type` no longer required -
 * for a single optional CTA (HeroNews.cta, Banner.link) where leaving the
 * whole group empty must be valid. Payload enforces a field's own
 * `required` regardless of whether its parent group is required, so
 * reusing `linkFields` as-is here would force every Hero/Banner to always
 * carry a CTA (verified empirically: saving a real Home document with an
 * empty `cta` group failed field-level validation on `cta.label`/
 * `cta.type` alone). Still one model, one field list - only the
 * required-ness differs for this consumer.
 */
export const optionalLinkFields: ArrayField['fields'] = linkFields.map((field) =>
  'name' in field && (field.name === 'label' || field.name === 'type') ? { ...field, required: false } : field,
)
