import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { FAQBlock } from '@/payload-types'

type FAQSectionProps = {
  block: FAQBlock
}

/**
 * Accessible accordion primitive based on shadcn/Radix (§16.3) - keyboard
 * navigable, expanded/collapsed state exposed via `aria-expanded`
 * (page-content-rendering, "FAQ accesible").
 */
export function FAQSection({ block }: FAQSectionProps) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <section className="py-8 md:py-12">
      <Accordion type="single" collapsible className="mx-auto w-full max-w-[70ch]">
        {items.map((item, index) => (
          <AccordionItem key={item.id ?? index} value={item.id ?? String(index)}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
