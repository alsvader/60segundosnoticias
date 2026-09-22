import type { Block } from 'payload'

export const LatestPosts: Block = {
  slug: 'latestPosts',
  labels: {
    singular: 'Últimas noticias',
    plural: 'Últimas noticias',
  },
  interfaceName: 'LatestPostsBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    { name: 'limit', label: 'Límite', type: 'number', defaultValue: 6 },
    {
      name: 'category',
      label: 'Categoría',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Opcional: restringe a una categoría.',
      },
    },
    {
      name: 'layout',
      label: 'Diseño',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Cuadrícula', value: 'grid' },
        { label: 'Lista', value: 'list' },
        { label: 'Mixto', value: 'mixed' },
      ],
    },
  ],
}
