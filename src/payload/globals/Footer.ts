import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { linkFields } from '../fields/link-fields.ts'
import { socialLinksField } from '../fields/social-links-field.ts'
import { invalidateFooterCache } from '../hooks/shell/cache-invalidation.ts'

export const Footer: GlobalConfig = {
  slug: 'footer',
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
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'columns',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    socialLinksField,
    {
      name: 'legalLinks',
      type: 'array',
      fields: linkFields,
    },
    {
      name: 'copyright',
      type: 'text',
    },
  ],
}
