import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { invalidateSettingsCache } from '../hooks/shell/cache-invalidation.ts'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [invalidateSettingsCache],
  },
  fields: [
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
        },
        {
          name: 'tagline',
          type: 'text',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'logoDark',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'publicEmail',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'whatsapp',
          type: 'text',
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'x',
          type: 'text',
        },
        {
          name: 'youtube',
          type: 'text',
        },
        {
          name: 'tiktok',
          type: 'text',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'defaultMetaTitle',
          type: 'text',
        },
        {
          name: 'defaultMetaDescription',
          type: 'textarea',
        },
        {
          name: 'defaultMetaImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'siteURL',
          type: 'text',
        },
      ],
    },
    {
      name: 'organization',
      type: 'group',
      fields: [
        {
          name: 'organizationName',
          type: 'text',
        },
        {
          name: 'organizationLogo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
