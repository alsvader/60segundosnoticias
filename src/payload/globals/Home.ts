import type { GlobalConfig } from 'payload'

import { Banner } from '../blocks/shared/Banner.ts'
import { CategoryExplorer } from '../blocks/home/CategoryExplorer.ts'
import { EditorialIntro } from '../blocks/home/EditorialIntro.ts'
import { FeaturedPosts } from '../blocks/home/FeaturedPosts.ts'
import { HeroNews } from '../blocks/home/HeroNews.ts'
import { LatestPosts } from '../blocks/home/LatestPosts.ts'
import { PostsByCategory } from '../blocks/home/PostsByCategory.ts'
import { VideoFeature } from '../blocks/home/VideoFeature.ts'
import { isAdmin } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { invalidateHomeCache } from '../hooks/home/cache-invalidation.ts'
import { generateHomePreviewURL } from '@/lib/preview/generate-preview-url'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Portada',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    preview: generateHomePreviewURL,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [invalidateHomeCache],
  },
  fields: [
    {
      name: 'layout',
      label: 'Secciones',
      labels: { singular: 'Sección', plural: 'Secciones' },
      type: 'blocks',
      blocks: [
        EditorialIntro,
        HeroNews,
        CategoryExplorer,
        LatestPosts,
        PostsByCategory,
        FeaturedPosts,
        VideoFeature,
        Banner,
      ],
    },
    seoFields,
  ],
}
