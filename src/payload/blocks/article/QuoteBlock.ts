import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quoteBlock',
  labels: {
    singular: 'Cita',
    plural: 'Citas',
  },
  interfaceName: 'QuoteBlock',
  fields: [
    {
      name: 'quote',
      label: 'Cita',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      label: 'Autor',
      type: 'text',
    },
    {
      name: 'source',
      label: 'Fuente',
      type: 'text',
    },
  ],
}
