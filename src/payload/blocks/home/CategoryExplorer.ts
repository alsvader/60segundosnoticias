import type { Block } from 'payload'

export const CategoryExplorer: Block = {
  slug: 'categoryExplorer',
  labels: {
    singular: 'Explorador de categorías',
    plural: 'Exploradores de categorías',
  },
  interfaceName: 'CategoryExplorerBlock',
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    {
      name: 'categories',
      label: 'Categorías',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categorías a mostrar, en el orden seleccionado.',
      },
    },
    { name: 'showViewAll', label: 'Mostrar "Ver todo"', type: 'checkbox', defaultValue: false },
    {
      name: 'viewAllLabel',
      label: 'Texto de "Ver todo"',
      type: 'text',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showViewAll),
      },
    },
  ],
}
