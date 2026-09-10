import type { Block } from 'payload'

export const LatestPosts: Block = {
  slug: 'latestPosts',
  interfaceName: 'LatestPostsBlock',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'limit', type: 'number', defaultValue: 6 },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Opcional: restringe a una categoría.',
      },
    },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
        { label: 'Mixed', value: 'mixed' },
      ],
    },
  ],
}
