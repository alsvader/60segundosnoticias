import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const CTA: Block = {
  slug: 'cta',
  labels: {
    singular: 'Llamado a la acción',
    plural: 'Llamados a la acción',
  },
  interfaceName: 'CTABlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    {
      name: 'link',
      label: 'Enlace',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
  ],
}
