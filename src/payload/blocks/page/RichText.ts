import type { Block } from 'payload'

import { createArticleEditor } from '../../fields/article-editor.ts'

export const RichText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: createArticleEditor(),
    },
  ],
}
