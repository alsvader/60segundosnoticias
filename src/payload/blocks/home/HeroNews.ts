import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const HeroNews: Block = {
  slug: 'heroNews',
  labels: {
    singular: 'Noticia principal',
    plural: 'Noticias principales',
  },
  interfaceName: 'HeroNewsBlock',
  fields: [
    { name: 'eyebrow', label: 'Antetítulo', type: 'text' },
    { name: 'headline', label: 'Titular', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    {
      name: 'cta',
      label: 'Botón de llamada a la acción',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
    {
      name: 'contentMode',
      label: 'Modo de contenido',
      type: 'select',
      required: true,
      defaultValue: 'automatic',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automático', value: 'automatic' },
      ],
    },
    {
      name: 'mainPost',
      label: 'Noticia principal',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'manual',
        description: 'Historia principal.',
      },
    },
    {
      name: 'secondaryPosts',
      label: 'Noticias secundarias',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'manual',
        description: 'Hasta 3 historias secundarias.',
      },
    },
    {
      name: 'sourceCategory',
      label: 'Categoría de origen',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'automatic',
        description: 'Opcional: restringe a una categoría. Sin seleccionar, usa las publicaciones más recientes de cualquier categoría.',
      },
    },
    {
      name: 'limit',
      label: 'Límite',
      type: 'number',
      defaultValue: 4,
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'automatic',
        description: 'Historia principal + secundarias, en total.',
      },
    },
  ],
}
