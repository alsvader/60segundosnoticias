import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const Banner: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'link',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'editorial',
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Promotional', value: 'promotional' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}
