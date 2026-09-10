import { BannerSection } from '@/components/sections/banner-section'
import { CategoryExplorerSection } from '@/components/sections/home/category-explorer-section'
import { EditorialIntroSection } from '@/components/sections/home/editorial-intro-section'
import { FeaturedPostsSection } from '@/components/sections/home/featured-posts-section'
import { HeroNewsSection } from '@/components/sections/home/hero-news-section'
import { LatestPostsSection } from '@/components/sections/home/latest-posts-section'
import { PostsByCategorySection } from '@/components/sections/home/posts-by-category-section'
import { VideoFeatureSection } from '@/components/sections/home/video-feature-section'
import type { ResolvedHomeBlock } from '@/lib/home/resolve-home-blocks'

type HomeBlockRendererProps = {
  blocks: ResolvedHomeBlock[]
}

/**
 * Exhaustive switch over the resolved Home block union (design.md D6). No
 * Payload query, no DAL import - blocks arrive already resolved. An
 * unrecognized `type` is logged and skipped rather than thrown, so one
 * malformed block never takes down the rest of Home (§61).
 */
export function HomeBlockRenderer({ blocks }: HomeBlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'editorial-intro':
            return <EditorialIntroSection key={block.key} editorialIntro={block} />
          case 'hero-news':
            return <HeroNewsSection key={block.key} hero={block} />
          case 'category-explorer':
            return <CategoryExplorerSection key={block.key} block={block} />
          case 'latest-posts':
            return <LatestPostsSection key={block.key} block={block} />
          case 'posts-by-category':
            return <PostsByCategorySection key={block.key} block={block} />
          case 'featured-posts':
            return <FeaturedPostsSection key={block.key} block={block} />
          case 'video-feature':
            return <VideoFeatureSection key={block.key} block={block} />
          case 'banner':
            return <BannerSection key={block.key} banner={block.banner} />
          default: {
            const unknown: never = block
            console.warn('HomeBlockRenderer: skipping unresolvable block', unknown)
            return null
          }
        }
      })}
    </>
  )
}
