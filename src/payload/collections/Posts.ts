import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin, isAdminOrWriter, isOwnerOrAdmin } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { createArticleEditor } from '../fields/article-editor.ts'
import { invalidatePostCache, invalidatePostCacheOnDelete } from '../hooks/posts/cache-invalidation.ts'
import { enforceAuthor } from '../hooks/posts/enforce-author.ts'
import { assignPublishedAt, publishValidation } from '../hooks/posts/publish-validation.ts'
import { computeReadingTime } from '../hooks/posts/reading-time.ts'
import { createPostRedirect } from '../hooks/posts/redirect-lifecycle.ts'
import { generateSlugFromTitle } from '../hooks/posts/slug-lifecycle.ts'
import { generatePostPreviewURL } from '@/lib/preview/generate-preview-url'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Noticia',
    plural: 'Noticias',
  },
  admin: {
    useAsTitle: 'title',
    preview: generatePostPreviewURL,
  },
  versions: {
    drafts: true,
  },
  access: {
    read: (({ req }) => {
      if (req.user?.role === 'admin') {
        return true
      }
      if (req.user) {
        const publishedFilter: Where = { _status: { equals: 'published' } }
        const ownPostsFilter: Where = { author: { equals: req.user.id } }
        return { or: [publishedFilter, ownPostsFilter] }
      }
      return {
        _status: {
          equals: 'published',
        },
      }
    }) as Access,
    create: isAdminOrWriter,
    update: isOwnerOrAdmin('author'),
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [generateSlugFromTitle],
    beforeChange: [enforceAuthor, publishValidation, assignPublishedAt, computeReadingTime],
    afterChange: [invalidatePostCache, createPostRedirect],
    afterDelete: [invalidatePostCacheOnDelete],
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
