import type { CollectionConfig } from 'payload'

import { CATEGORY_ICON_KEYS } from '../../lib/constants/category-icon-keys.ts'
import { CATEGORY_THEME_KEYS } from '../../lib/constants/category-theme-keys.ts'
import { isAdmin } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { createNamespaceSlugValidate } from '../fields/validate-namespace-slug.ts'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField({ validate: createNamespaceSlugValidate('pages') }),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'colorTheme',
      type: 'select',
      options: [...CATEGORY_THEME_KEYS],
    },
    {
      name: 'icon',
      type: 'select',
      options: [...CATEGORY_ICON_KEYS],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
    },
    seoFields,
  ],
}
