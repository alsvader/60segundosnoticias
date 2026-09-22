import type { Block } from 'payload'

export const FAQ: Block = {
  slug: 'faq',
  labels: {
    singular: 'Preguntas frecuentes',
    plural: 'Preguntas frecuentes',
  },
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'items',
      label: 'Preguntas',
      labels: { singular: 'Pregunta', plural: 'Preguntas' },
      type: 'array',
      fields: [
        { name: 'question', label: 'Pregunta', type: 'text', required: true },
        { name: 'answer', label: 'Respuesta', type: 'textarea', required: true },
      ],
    },
  ],
}
