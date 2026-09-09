import type { Block } from 'payload'

export const EmbedBlock: Block = {
  slug: 'embedBlock',
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'generic',
      options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'X', value: 'x' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Generic', value: 'generic' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
