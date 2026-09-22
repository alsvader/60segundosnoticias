import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const Banner: Block = {
  slug: 'banner',
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  interfaceName: 'BannerBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    {
      name: 'link',
      label: 'Enlace',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
    {
      name: 'variant',
      label: 'Variante',
      type: 'select',
      defaultValue: 'editorial',
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Promocional', value: 'promotional' },
        { label: 'Oscuro', value: 'dark' },
      ],
    },
  ],
}
