import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { linkFields } from '../fields/link-fields.ts'
import { socialLinksField } from '../fields/social-links-field.ts'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        ...linkFields,
        {
          // One level only - the Master Spec's "Más" item needs a single
          // level of children, not arbitrarily nested submenus.
          name: 'children',
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    socialLinksField,
    {
      name: 'cta',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
  ],
}
