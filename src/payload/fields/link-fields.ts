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
    type: 'text',
    required: true,
  },
  {
    name: 'type',
    type: 'select',
    required: true,
    options: [
      { label: 'Category', value: 'category' },
      { label: 'Page', value: 'page' },
      { label: 'External', value: 'external' },
    ],
  },
  {
    name: 'category',
    type: 'relationship',
    relationTo: 'categories',
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
  },
  {
    name: 'url',
    type: 'text',
  },
  {
    name: 'openInNewTab',
    type: 'checkbox',
    defaultValue: false,
  },
]
