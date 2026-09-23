import type { Block } from 'payload'

import { createArticleEditor } from '../../fields/article-editor.ts'

export const RichText: Block = {
  slug: 'richText',
  labels: {
    singular: 'Texto enriquecido',
    plural: 'Textos enriquecidos',
  },
  interfaceName: 'RichTextBlock',
  fields: [
    {
      name: 'content',
      label: 'Contenido',
      type: 'richText',
      editor: createArticleEditor(),
    },
  ],
}
