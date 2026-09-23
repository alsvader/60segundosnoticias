import type { Block } from 'payload'

export const FeaturedPosts: Block = {
  slug: 'featuredPosts',
  labels: {
    singular: 'Noticias destacadas',
    plural: 'Noticias destacadas',
  },
  interfaceName: 'FeaturedPostsBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    {
      name: 'posts',
      label: 'Noticias',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Selección editorial explícita. No se deriva del campo "featured" de Posts.',
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
        { label: 'Carrusel', value: 'carousel' },
        { label: 'Editorial', value: 'editorial' },
      ],
    },
  ],
}
