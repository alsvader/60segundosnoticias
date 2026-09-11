import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'imageBlock',
  interfaceName: 'ImageBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'credits',
      type: 'text',
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'large',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Extra Large (ancho completo)', value: 'full' },
      ],
    },
  ],
}
