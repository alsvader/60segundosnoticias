import type { QuoteBlock } from '@/payload-types'

type QuoteBlockViewProps = {
  block: QuoteBlock
}

export function QuoteBlockView({ block }: QuoteBlockViewProps) {
  return (
    <blockquote className="type-h3 my-8 border-l-4 border-[var(--brand-red-500)] pl-6 font-[var(--font-display)] text-[var(--ink-950)]">
      <p>“{block.quote}”</p>
      {block.author || block.source ? (
        <footer className="type-metadata mt-3 font-sans text-[var(--ink-700)]">
          {block.author}
          {block.author && block.source ? ' · ' : null}
          {block.source}
        </footer>
      ) : null}
    </blockquote>
  )
}
