import type { CollectionConfig } from 'payload'

import { CATEGORY_ICON_KEYS } from '../../lib/constants/category-icon-keys.ts'
import { CATEGORY_THEME_KEYS } from '../../lib/constants/category-theme-keys.ts'
import { isAdmin } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { invalidateCategoryCache, invalidateCategoryCacheOnDelete } from '../hooks/categories/cache-invalidation.ts'
import { preventDeleteWithPosts } from '../hooks/categories/prevent-delete-with-posts.ts'
import { createCategoryRedirect } from '../hooks/categories/redirect-lifecycle.ts'

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
  hooks: {
    beforeDelete: [preventDeleteWithPosts],
    afterChange: [invalidateCategoryCache, createCategoryRedirect],
    afterDelete: [invalidateCategoryCacheOnDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField({ collection: 'categories', useAsSlug: 'name', namespaceCollection: 'pages' }),
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
