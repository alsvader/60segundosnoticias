import { CategoryCard } from '@/components/editorial/category-card'
import { SectionHeader } from '@/components/editorial/section-header'
import { Container } from '@/components/layout/container'
import type { ResolvedCategoryExplorer } from '@/lib/home/resolve-home-blocks'

type CategoryExplorerSectionProps = {
  block: ResolvedCategoryExplorer
}

export function CategoryExplorerSection({ block }: CategoryExplorerSectionProps) {
  return (
    <section className="py-8 md:py-12">
      <Container className="flex flex-col gap-6">
        {block.title ? <SectionHeader title={block.title} /> : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {block.categories.map((category) => (
            <CategoryCard key={category.href} category={category} />
          ))}
        </div>
        {block.viewAllLabel ? (
          <p className="type-label-uppercase self-end text-sm text-[var(--brand-red-600)]">{block.viewAllLabel}</p>
        ) : null}
      </Container>
    </section>
  )
}
