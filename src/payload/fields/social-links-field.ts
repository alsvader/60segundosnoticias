import type { ArrayField } from 'payload'

export const socialLinksField: ArrayField = {
  name: 'socialLinks',
  label: 'Redes sociales',
  labels: { singular: 'Red social', plural: 'Redes sociales' },
  type: 'array',
  fields: [
    {
      name: 'platform',
      label: 'Plataforma',
      type: 'select',
      required: true,
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'X', value: 'x' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
    },
  ],
}
