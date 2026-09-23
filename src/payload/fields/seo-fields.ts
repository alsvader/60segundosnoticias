import type { GroupField } from 'payload'

export const seoFields: GroupField = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  fields: [
    {
      name: 'metaTitle',
      label: 'Meta título',
      type: 'text',
    },
    {
      name: 'metaDescription',
      label: 'Meta descripción',
      type: 'textarea',
    },
    {
      name: 'metaImage',
      label: 'Imagen para redes sociales',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'canonicalURL',
      label: 'URL canónica',
      type: 'text',
    },
    {
      name: 'noIndex',
      label: 'No indexar en buscadores',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
