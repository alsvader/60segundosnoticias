import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const CTA: Block = {
  slug: 'cta',
  interfaceName: 'CTABlock',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'link',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
  ],
}
