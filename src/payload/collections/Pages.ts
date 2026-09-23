import type { CollectionConfig } from 'payload'

import { Banner } from '../blocks/shared/Banner.ts'
import { CTA } from '../blocks/page/CTA.ts'
import { FAQ } from '../blocks/page/FAQ.ts'
import { Gallery } from '../blocks/page/Gallery.ts'
import { Hero } from '../blocks/page/Hero.ts'
import { ImageText } from '../blocks/page/ImageText.ts'
import { RichText } from '../blocks/page/RichText.ts'
import { Video } from '../blocks/page/Video.ts'
import { isAdmin, isLoggedIn } from '../access/roles.ts'
import { invalidatePageCache, invalidatePageCacheOnDelete } from '../hooks/pages/cache-invalidation.ts'
import { generatePagePreviewURL } from '@/lib/preview/generate-preview-url'
import { createPageRedirect } from '../hooks/pages/redirect-lifecycle.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Página',
    plural: 'Páginas',
  },
  admin: {
    useAsTitle: 'title',
    preview: generatePagePreviewURL,
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
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isLoggedIn,
  },
  hooks: {
    afterChange: [invalidatePageCache, createPageRedirect],
    afterDelete: [invalidatePageCacheOnDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
    },
    slugField({ collection: 'pages', namespaceCollection: 'categories' }),
    {
      name: 'layout',
      label: 'Secciones',
      labels: { singular: 'Sección', plural: 'Secciones' },
      type: 'blocks',
      blocks: [Hero, RichText, ImageText, Gallery, Video, CTA, FAQ, Banner],
    },
    seoFields,
  ],
}
