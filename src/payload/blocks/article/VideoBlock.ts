import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'videoBlock',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'provider',
      label: 'Proveedor',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Subido', value: 'uploaded' },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.provider === 'youtube' || siblingData?.provider === 'vimeo',
      },
    },
    {
      name: 'video',
      label: 'Video',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.provider === 'uploaded',
      },
    },
    {
      name: 'portrait',
      label: 'Video vertical',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Marca esta opción para video vertical (formato Shorts/Reels) — por ejemplo un video subido en 9:16 o un Vimeo vertical. Los enlaces de YouTube Shorts se detectan automáticamente y no necesitan esta casilla.',
      },
    },
    {
      name: 'poster',
      label: 'Imagen de portada',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'caption',
      label: 'Pie de foto',
      type: 'text',
    },
  ],
}
