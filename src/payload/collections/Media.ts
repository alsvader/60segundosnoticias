import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 768 },
      { name: 'tablet', width: 1200 },
      { name: 'desktop', width: 1600 },
      { name: 'hero', width: 2000 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'credits',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
