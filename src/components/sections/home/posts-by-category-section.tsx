import Link from 'next/link'

import { ArticleCard } from '@/components/editorial/article-card'
import { SectionHeader } from '@/components/editorial/section-header'
import { Container } from '@/components/layout/container'
import type { ResolvedPostsByCategory } from '@/lib/home/resolve-home-blocks'

type PostsByCategorySectionProps = {
  block: ResolvedPostsByCategory
}

/**
 * `horizontal` uses native `overflow-x-auto` + CSS scroll-snap (design.md
 * D-E) - no carousel dependency.
 */
export function PostsByCategorySection({ block }: PostsByCategorySectionProps) {
  const viewAll = block.viewAll ? (
    <Link
      href={block.viewAll.href}
      className="type-label-uppercase text-sm text-[var(--brand-red-600)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {block.viewAll.label}
    </Link>
  ) : undefined

  return (
    <section className="py-8 md:py-12">
      <Container className="flex flex-col gap-6">
        {block.title ? <SectionHeader title={block.title} action={viewAll} /> : viewAll}
        {block.layout === 'horizontal' ? (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {block.posts.map((post) => (
              <ArticleCard key={post.href} article={post} className="w-72 shrink-0 snap-start" />
            ))}
          </div>
        ) : block.layout === 'featured-grid' && block.posts.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <ArticleCard article={block.posts[0]} />
            <div className="flex flex-col gap-4">
              {block.posts.slice(1).map((post) => (
                <ArticleCard key={post.href} article={post} variant="compact" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {block.posts.map((post) => (
              <ArticleCard key={post.href} article={post} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
