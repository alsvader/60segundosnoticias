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
        { label: 'Facebook', value: 'facebook' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Generic', value: 'generic' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'Para LinkedIn, usar la URL especial de embed (linkedin.com/embed/feed/update/urn:li:share:...) generada por el botón "Embed this post" de LinkedIn — no el link normal de la publicación. Para los demás providers, la URL normal de la publicación.',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' },
      ],
    },
  ],
}
