import type { Block } from 'payload'

export const ImageText: Block = {
  slug: 'imageText',
  labels: {
    singular: 'Imagen y texto',
    plural: 'Imagen y texto',
  },
  interfaceName: 'ImageTextBlock',
  fields: [
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    { name: 'eyebrow', label: 'Antetítulo', type: 'text' },
    { name: 'title', label: 'Título', type: 'text' },
    { name: 'content', label: 'Contenido', type: 'textarea' },
    {
      name: 'imagePosition',
      label: 'Posición de la imagen',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Derecha', value: 'right' },
      ],
    },
  ],
}
