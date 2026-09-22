import type { Block } from 'payload'

export const VideoFeature: Block = {
  slug: 'videoFeature',
  labels: {
    singular: 'Video destacado',
    plural: 'Videos destacados',
  },
  interfaceName: 'VideoFeatureBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    {
      name: 'source',
      label: 'Origen',
      type: 'select',
      required: true,
      defaultValue: 'post',
      options: [
        { label: 'Noticia', value: 'post' },
        { label: 'Externo', value: 'external' },
      ],
    },
    {
      name: 'post',
      label: 'Noticia',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'post',
      },
    },
    {
      name: 'videoURL',
      label: 'URL del video',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'external',
        description: 'URL de YouTube o Vimeo.',
      },
    },
    { name: 'thumbnail', label: 'Miniatura', type: 'upload', relationTo: 'media' },
    { name: 'headline', label: 'Titular', type: 'text' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ],
}
