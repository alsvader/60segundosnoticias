import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { linkFields } from '../fields/link-fields.ts'
import { socialLinksField } from '../fields/social-links-field.ts'
import { invalidateFooterCache } from '../hooks/shell/cache-invalidation.ts'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pie de página',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [invalidateFooterCache],
  },
  fields: [
    {
      name: 'logo',
      label: 'Logotipo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      name: 'columns',
      label: 'Columnas',
      labels: { singular: 'Columna', plural: 'Columnas' },
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          label: 'Enlaces',
          labels: { singular: 'Enlace', plural: 'Enlaces' },
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    socialLinksField,
    {
      name: 'legalLinks',
      label: 'Enlaces legales',
      labels: { singular: 'Enlace legal', plural: 'Enlaces legales' },
      type: 'array',
      fields: linkFields,
    },
    {
      name: 'copyright',
      label: 'Derechos de autor',
      type: 'text',
    },
  ],
}
