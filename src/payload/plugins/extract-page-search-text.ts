import type { Page } from '@/payload-types'

import { extractLexicalText } from '../hooks/lib/lexical-text.ts'

type PageLayoutBlock = NonNullable<Page['layout']>[number]

const joinText = (...values: Array<string | null | undefined>): string =>
  values.filter((value): value is string => Boolean(value && value.trim())).join(' ')

/**
 * Page Blocks carry their public text as plain scalar fields sitting
 * directly on each `layout` entry (Hero/ImageText/CTA/FAQ/Banner) -
 * outside any Lexical tree. Only `richText` needs `extractLexicalText()`;
 * every other block type is a flat object walk, not a second Lexical
 * parser.
 */
const extractPageBlockText = (block: PageLayoutBlock): string => {
  switch (block.blockType) {
    case 'hero':
      return joinText(block.eyebrow, block.title, block.description)
    case 'richText':
      return extractLexicalText(block.content)
    case 'imageText':
      return joinText(block.eyebrow, block.title, block.content)
    case 'galleryBlock':
      return joinText(...block.images.map((image) => image.caption))
    case 'videoBlock':
      return joinText(block.caption)
    case 'cta':
      return joinText(block.title, block.description, block.link?.label)
    case 'faq':
      return joinText(...(block.items ?? []).flatMap((item) => [item.question, item.answer]))
    case 'banner':
      return joinText(block.title, block.description, block.link?.label)
    default:
      return ''
  }
}

export const extractPageSearchText = (layout: Page['layout']): string =>
  joinText(...(layout ?? []).map(extractPageBlockText))
