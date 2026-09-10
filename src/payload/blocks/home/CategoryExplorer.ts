import type { Block } from 'payload'

export const CategoryExplorer: Block = {
  slug: 'categoryExplorer',
  interfaceName: 'CategoryExplorerBlock',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categorías a mostrar, en el orden seleccionado.',
      },
    },
    { name: 'showViewAll', type: 'checkbox', defaultValue: false },
    {
      name: 'viewAllLabel',
      type: 'text',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showViewAll),
      },
    },
  ],
}
