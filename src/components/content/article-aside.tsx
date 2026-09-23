import { ArticleCard, type ArticleCardData } from '@/components/editorial/article-card'

type ArticleAsideProps = {
  heading: string
  posts: ArticleCardData[]
}

/**
 * Sidebar counterpart to `RelatedPosts` — a vertical `compact` list shown
 * beside the article content instead of a grid below it. Site-wide
 * configuration (which posts, heading) lives in the `ArticleSidebar`
 * Global; this component stays presentational.
 */
export function ArticleAside({ heading, posts }: ArticleAsideProps) {
  if (posts.length === 0) return null

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
      <h2 className="type-section-heading font-[var(--font-display)] font-semibold text-[var(--ink-950)]">
        {heading}
      </h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <ArticleCard key={post.href} article={post} variant="compact" />
        ))}
      </div>
    </aside>
  )
}
