import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn, isOwnerOrAdmin } from '../access/roles.ts'
import { enforceUploader } from '../hooks/media/enforce-uploader.ts'
import { preventDeleteReferenced } from '../hooks/media/prevent-delete-referenced.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Archivo multimedia',
    plural: 'Multimedia',
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isOwnerOrAdmin('uploadedBy'),
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [enforceUploader],
    beforeDelete: [preventDeleteReferenced],
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
      label: 'Texto alternativo',
      type: 'text',
    },
    {
      name: 'caption',
      label: 'Pie de foto',
      type: 'text',
    },
    {
      name: 'credits',
      label: 'Créditos',
      type: 'text',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      name: 'uploadedBy',
      label: 'Subido por',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
}
