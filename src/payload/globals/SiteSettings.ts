import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { invalidateSettingsCache } from '../hooks/shell/cache-invalidation.ts'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Configuración del sitio',
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
      label: 'Identidad de marca',
      type: 'group',
      fields: [
        {
          name: 'siteName',
          label: 'Nombre del sitio',
          type: 'text',
          required: true,
        },
        {
          name: 'tagline',
          label: 'Eslogan',
          type: 'text',
        },
        {
          name: 'logo',
          label: 'Logotipo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'logoDark',
          label: 'Logotipo (modo oscuro)',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'favicon',
          label: 'Favicon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'contact',
      label: 'Contacto',
      type: 'group',
      fields: [
        {
          name: 'publicEmail',
          label: 'Correo público',
          type: 'email',
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'text',
        },
        {
          name: 'whatsapp',
          label: 'WhatsApp',
          type: 'text',
        },
      ],
    },
    {
      name: 'social',
      label: 'Redes sociales',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          label: 'Facebook',
          type: 'text',
        },
        {
          name: 'instagram',
          label: 'Instagram',
          type: 'text',
        },
        {
          name: 'x',
          label: 'X',
          type: 'text',
        },
        {
          name: 'youtube',
          label: 'YouTube',
          type: 'text',
        },
        {
          name: 'tiktok',
          label: 'TikTok',
          type: 'text',
        },
      ],
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'defaultMetaTitle',
          label: 'Meta título predeterminado',
          type: 'text',
        },
        {
          name: 'defaultMetaDescription',
          label: 'Meta descripción predeterminada',
          type: 'textarea',
        },
        {
          name: 'defaultMetaImage',
          label: 'Imagen para redes sociales predeterminada',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'siteURL',
          label: 'URL del sitio',
          type: 'text',
        },
      ],
    },
    {
      name: 'organization',
      label: 'Organización',
      type: 'group',
      fields: [
        {
          name: 'organizationName',
          label: 'Nombre de la organización',
          type: 'text',
        },
        {
          name: 'organizationLogo',
          label: 'Logotipo de la organización',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
