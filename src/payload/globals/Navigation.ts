import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { linkFields } from '../fields/link-fields.ts'
import { socialLinksField } from '../fields/social-links-field.ts'
import { invalidateNavigationCache } from '../hooks/shell/cache-invalidation.ts'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navegación',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [invalidateNavigationCache],
  },
  fields: [
    {
      name: 'logo',
      label: 'Logotipo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'items',
      label: 'Elementos del menú',
      labels: { singular: 'Elemento', plural: 'Elementos' },
      type: 'array',
      fields: [
        ...linkFields,
        {
          // One level only - the Master Spec's "Más" item needs a single
          // level of children, not arbitrarily nested submenus.
          name: 'children',
          label: 'Subelementos',
          labels: { singular: 'Subelemento', plural: 'Subelementos' },
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    socialLinksField,
    {
      name: 'cta',
      label: 'Botón de llamada a la acción',
      type: 'group',
      fields: [
        {
          name: 'label',
          label: 'Texto',
          type: 'text',
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
        },
      ],
    },
  ],
}
