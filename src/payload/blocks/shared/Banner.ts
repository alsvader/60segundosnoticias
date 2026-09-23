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
    {
      name: 'image',
      label: 'Imagen',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Opcional. Sin imagen, el contenido se muestra centrado.',
      },
    },
    {
      name: 'link',
      label: 'Botón (CTA)',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional. Destino interno o externo del botón principal.',
      },
    },
    {
      name: 'variant',
      label: 'Variante',
      type: 'select',
      defaultValue: 'editorial',
      admin: {
        description: 'Editorial: papel claro. Promocional: rojo de marca. Oscuro: fondo negro.',
      },
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Promocional', value: 'promotional' },
        { label: 'Oscuro', value: 'dark' },
      ],
    },
  ],
}
