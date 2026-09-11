import { LexicalRenderer } from '@/components/content/lexical-renderer'
import type { RichTextBlock } from '@/payload-types'

type RichTextSectionProps = {
  block: RichTextBlock
}

/**
 * Reuses the exact same Lexical renderer as the Article body
 * (page-content-rendering, "RichText de Page reutiliza el renderizado
 * seguro de Lexical de Article") — `RichText` Page Block shares
 * `createArticleEditor()` with `Posts.content`, so no second rendering
 * stack exists.
 */
export function RichTextSection({ block }: RichTextSectionProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto w-full max-w-[70ch]">
        <LexicalRenderer content={block.content} />
      </div>
    </section>
  )
}
