import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'imageBlock',
  labels: {
    singular: 'Imagen',
    plural: 'Imágenes',
  },
  interfaceName: 'ImageBlock',
  fields: [
    {
      name: 'image',
      label: 'Imagen',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      label: 'Pie de foto',
      type: 'text',
    },
    {
      name: 'credits',
      label: 'Créditos',
      type: 'text',
    },
    {
      name: 'size',
      label: 'Tamaño',
      type: 'select',
      defaultValue: 'large',
      options: [
        { label: 'Chica', value: 'small' },
        { label: 'Mediana', value: 'medium' },
        { label: 'Grande', value: 'large' },
        { label: 'Extra grande (ancho completo)', value: 'full' },
      ],
    },
  ],
}
