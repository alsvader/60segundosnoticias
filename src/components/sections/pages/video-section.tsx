import { VideoBlockView } from '@/components/content/blocks/video-block'
import type { VideoBlock } from '@/payload-types'

type VideoSectionProps = {
  block: VideoBlock
}

/**
 * `Video` (Page) and `VideoBlock` (Article) share the exact same Payload
 * schema (`page-blocks`, `page-content-rendering`) - same provider control
 * logic reused, not duplicated.
 */
export function VideoSection({ block }: VideoSectionProps) {
  return (
    <section className="py-8 md:py-12">
      <VideoBlockView block={block} />
    </section>
  )
}
