import type { Block } from 'payload'

export const FeaturedPosts: Block = {
  slug: 'featuredPosts',
  interfaceName: 'FeaturedPostsBlock',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Selección editorial explícita. No se deriva del campo "featured" de Posts.',
      },
    },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Carousel', value: 'carousel' },
        { label: 'Editorial', value: 'editorial' },
      ],
    },
  ],
}
