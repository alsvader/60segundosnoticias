import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrWriter } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { createArticleEditor } from '../fields/article-editor.ts'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Noticia',
    plural: 'Noticias',
  },
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (req.user) {
        return true
      }
      return {
        _status: {
          equals: 'published',
        },
      }
    },
    create: isAdminOrWriter,
    update: isAdminOrWriter,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
    },
    {
      name: 'additionalCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: createArticleEditor(),
    },
    {
      name: 'source',
      type: 'text',
    },
    {
      name: 'photoCredits',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'readingTimeMinutes',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    seoFields,
  ],
}
