import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { CalloutBlock } from '../blocks/article/CalloutBlock.ts'
import { EmbedBlock } from '../blocks/article/EmbedBlock.ts'
import { GalleryBlock } from '../blocks/article/GalleryBlock.ts'
import { ImageBlock } from '../blocks/article/ImageBlock.ts'
import { QuoteBlock } from '../blocks/article/QuoteBlock.ts'
import { VideoBlock } from '../blocks/article/VideoBlock.ts'

/**
 * Shared Lexical editor config: the controlled set of Article Content
 * Blocks, used both by `Posts.content` and by the Page `RichText` block
 * (per spec: the RichText block reuses the same enriched-content control).
 * No arbitrary HTML/script insertion is possible through this feature set.
 */
export function createArticleEditor() {
  return lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      BlocksFeature({
        blocks: [ImageBlock, GalleryBlock, VideoBlock, QuoteBlock, CalloutBlock, EmbedBlock],
      }),
    ],
  })
}
