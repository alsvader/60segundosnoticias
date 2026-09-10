import type { Block } from 'payload'

import { optionalLinkFields } from '../../fields/link-fields.ts'

export const HeroNews: Block = {
  slug: 'heroNews',
  interfaceName: 'HeroNewsBlock',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'headline', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'cta',
      type: 'group',
      fields: optionalLinkFields,
      admin: {
        description: 'Opcional.',
      },
    },
    {
      name: 'contentMode',
      type: 'select',
      required: true,
      defaultValue: 'automatic',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
      ],
    },
    {
      name: 'mainPost',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'manual',
        description: 'Historia principal.',
      },
    },
    {
      name: 'secondaryPosts',
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
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'automatic',
        description: 'Opcional: restringe a una categoría. Sin seleccionar, usa las publicaciones más recientes de cualquier categoría.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      admin: {
        condition: (_, siblingData) => siblingData?.contentMode === 'automatic',
        description: 'Historia principal + secundarias, en total.',
      },
    },
  ],
}
