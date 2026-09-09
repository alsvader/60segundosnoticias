import type { ArrayField } from 'payload'

export const socialLinksField: ArrayField = {
  name: 'socialLinks',
  type: 'array',
  fields: [
    {
      name: 'platform',
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
      type: 'text',
      required: true,
    },
  ],
}
