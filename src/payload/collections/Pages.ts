import type { CollectionConfig } from 'payload'

import { Banner } from '../blocks/page/Banner.ts'
import { CTA } from '../blocks/page/CTA.ts'
import { FAQ } from '../blocks/page/FAQ.ts'
import { Gallery } from '../blocks/page/Gallery.ts'
import { Hero } from '../blocks/page/Hero.ts'
import { ImageText } from '../blocks/page/ImageText.ts'
import { RichText } from '../blocks/page/RichText.ts'
import { Video } from '../blocks/page/Video.ts'
import { isAdmin, isLoggedIn } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { createNamespaceSlugValidate } from '../fields/validate-namespace-slug.ts'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isLoggedIn,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({ validate: createNamespaceSlugValidate('categories') }),
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Hero, RichText, ImageText, Gallery, Video, CTA, FAQ, Banner],
    },
    seoFields,
  ],
}
