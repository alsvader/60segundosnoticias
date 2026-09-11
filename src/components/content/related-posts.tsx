import { ArticleCard, type ArticleCardData } from '@/components/editorial/article-card'

type RelatedPostsProps = {
  posts: ArticleCardData[]
}

/**
 * §34.2 — same `primaryCategory`, excludes the current Post, published
 * only, newest first, no manual configuration. Reuses `ArticleCardData`
 * (public-view-models), the same contract Home/Category already use — no
 * parallel type.
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="type-section-heading font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
        Te puede interesar
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <ArticleCard key={post.href} article={post} />
        ))}
      </div>
    </section>
  )
}
