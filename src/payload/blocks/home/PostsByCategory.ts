import type { Block } from 'payload'

export const PostsByCategory: Block = {
  slug: 'postsByCategory',
  interfaceName: 'PostsByCategoryBlock',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    { name: 'limit', type: 'number', defaultValue: 6 },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Featured grid', value: 'featured-grid' },
      ],
    },
    { name: 'showViewAll', type: 'checkbox', defaultValue: false },
  ],
}
