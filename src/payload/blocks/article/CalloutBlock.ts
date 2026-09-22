import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'calloutBlock',
  labels: {
    singular: 'Aviso destacado',
    plural: 'Avisos destacados',
  },
  interfaceName: 'CalloutBlock',
  fields: [
    {
      name: 'variant',
      label: 'Variante',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Información', value: 'info' },
        { label: 'Advertencia', value: 'warning' },
        { label: 'Importante', value: 'important' },
      ],
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
    },
    {
      name: 'content',
      label: 'Contenido',
      type: 'textarea',
    },
  ],
}
