import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles.ts'
import { slugField } from '../fields/slug-field.ts'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Etiqueta',
    plural: 'Etiquetas',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField({ collection: 'tags', useAsSlug: 'name' }),
  ],
}
