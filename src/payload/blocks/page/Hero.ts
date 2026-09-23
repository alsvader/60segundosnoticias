import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Encabezado principal',
    plural: 'Encabezados principales',
  },
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'eyebrow', label: 'Antetítulo', type: 'text' },
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    {
      name: 'alignment',
      label: 'Alineación',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
      ],
    },
  ],
}
