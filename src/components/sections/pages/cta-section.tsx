import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { resolveLink } from '@/lib/url/resolve-link'
import type { CTABlock } from '@/payload-types'

type CTASectionProps = {
  block: CTABlock
}

export function CTASection({ block }: CTASectionProps) {
  const link = resolveLink(block.link)

  return (
    <section className="py-8 md:py-12">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--paper-100)] p-8 text-center">
        <h2 className="type-section-heading font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
          {block.title}
        </h2>
        {block.description ? <p className="type-body max-w-prose text-[var(--ink-700)]">{block.description}</p> : null}
        {link ? (
          <Button asChild>
            <Link href={link.href} target={link.openInNewTab ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}>
              {link.label}
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
