import type { Block } from 'payload'

export const VideoFeature: Block = {
  slug: 'videoFeature',
  interfaceName: 'VideoFeatureBlock',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'post',
      options: [
        { label: 'Post', value: 'post' },
        { label: 'External', value: 'external' },
      ],
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'post',
      },
    },
    {
      name: 'videoURL',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'external',
        description: 'URL de YouTube o Vimeo.',
      },
    },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'headline', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
