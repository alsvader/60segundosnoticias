import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { CalloutBlockView } from '@/components/content/blocks/callout-block'
import { EmbedBlockView } from '@/components/content/blocks/embed-block'
import { GalleryBlockView } from '@/components/content/blocks/gallery-block'
import { ImageBlockView } from '@/components/content/blocks/image-block'
import { QuoteBlockView } from '@/components/content/blocks/quote-block'
import { VideoBlockView } from '@/components/content/blocks/video-block'
import type {
  CalloutBlock,
  EmbedBlock,
  GalleryBlock,
  ImageBlock,
  QuoteBlock,
  VideoBlock,
} from '@/payload-types'

/**
 * The six Article Content Blocks (article-content-rendering), keyed by
 * their block `slug` - the same dispatch shape `HomeBlockRenderer`/a
 * `switch` would use, expressed as the shape the official
 * `@payloadcms/richtext-lexical/react` converter API expects. An
 * unrecognized `blockType` simply has no entry here, so
 * `convertLexicalNodesToJSX` skips it - the same "log warning, skip
 * safely" posture as `HomeBlockRenderer`'s `default` case (§61).
 */
const articleContentConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    imageBlock: ({ node }: { node: { fields: ImageBlock } }) => <ImageBlockView block={node.fields} />,
    galleryBlock: ({ node }: { node: { fields: GalleryBlock } }) => <GalleryBlockView block={node.fields} />,
    videoBlock: ({ node }: { node: { fields: VideoBlock } }) => <VideoBlockView block={node.fields} />,
    quoteBlock: ({ node }: { node: { fields: QuoteBlock } }) => <QuoteBlockView block={node.fields} />,
    calloutBlock: ({ node }: { node: { fields: CalloutBlock } }) => <CalloutBlockView block={node.fields} />,
    embedBlock: ({ node }: { node: { fields: EmbedBlock } }) => <EmbedBlockView block={node.fields} />,
  },
})

type LexicalRendererProps = {
  content: unknown
  className?: string
}

/**
 * The ONLY place Article `content` (and the Page `RichText` block, which
 * shares the same `createArticleEditor()` config) is rendered - the
 * official React converter API, never `dangerouslySetInnerHTML`
 * (AC-CONTENT-004/005).
 */
export function LexicalRenderer({ content, className }: LexicalRendererProps) {
  return (
    <RichText
      data={content as any}
      converters={articleContentConverters}
      className={className}
    />
  )
}
