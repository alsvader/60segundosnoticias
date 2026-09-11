import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'videoBlock',
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Uploaded', value: 'uploaded' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.provider === 'youtube' || siblingData?.provider === 'vimeo',
      },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.provider === 'uploaded',
      },
    },
    {
      name: 'portrait',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Marca esta opción para video vertical (formato Shorts/Reels) — por ejemplo un video subido en 9:16 o un Vimeo vertical. Los enlaces de YouTube Shorts se detectan automáticamente y no necesitan esta casilla.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
