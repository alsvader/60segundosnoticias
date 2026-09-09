import type { Block } from 'payload'

export const ImageText: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'content', type: 'textarea' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
