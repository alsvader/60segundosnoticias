import type { Block } from 'payload'

export const Banner: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'linkLabel', type: 'text' },
    { name: 'linkURL', type: 'text' },
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
