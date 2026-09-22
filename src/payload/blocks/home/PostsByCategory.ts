import type { Block } from 'payload'

export const PostsByCategory: Block = {
  slug: 'postsByCategory',
  labels: {
    singular: 'Noticias por categoría',
    plural: 'Noticias por categoría',
  },
  interfaceName: 'PostsByCategoryBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    {
      name: 'category',
      label: 'Categoría',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    { name: 'limit', label: 'Límite', type: 'number', defaultValue: 6 },
    {
      name: 'layout',
      label: 'Diseño',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Cuadrícula', value: 'grid' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Cuadrícula destacada', value: 'featured-grid' },
      ],
    },
    { name: 'showViewAll', label: 'Mostrar "Ver todo"', type: 'checkbox', defaultValue: false },
  ],
}
