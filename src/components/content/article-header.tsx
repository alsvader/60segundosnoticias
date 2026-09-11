import { Breadcrumbs, type BreadcrumbItem } from '@/components/editorial/breadcrumbs'
import { CategoryBadge } from '@/components/editorial/category-badge'
import type { ArticleDetailData } from '@/lib/view-models/article'

type ArticleHeaderProps = {
  article: ArticleDetailData
  breadcrumbs: BreadcrumbItem[]
}

/**
 * Owns the Article's single `<h1>` (article-page, "Un único H1 en el
 * Article" — AC-ARTICLE-002/AC-A11Y-005). Covers the first four elements
 * of the §34 structure: breadcrumb, category, H1, excerpt/lead.
 */
export function ArticleHeader({ article, breadcrumbs }: ArticleHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <Breadcrumbs items={breadcrumbs} />
      <CategoryBadge
        name={article.primaryCategory.name}
        colorTheme={article.primaryCategory.colorTheme}
        icon={article.primaryCategory.icon}
        className="self-start"
      />
      <h1 className="type-h1-article font-[var(--font-display)] font-bold text-[var(--ink-950)]">{article.title}</h1>
      {article.excerpt ? <p className="type-lead text-[var(--ink-700)]">{article.excerpt}</p> : null}
    </header>
  )
}
