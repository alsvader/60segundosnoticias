import { AlertTriangle, Info, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CalloutBlock } from '@/payload-types'

type CalloutBlockViewProps = {
  block: CalloutBlock
}

const VARIANT_STYLES: Record<CalloutBlock['variant'], { container: string; icon: typeof Info }> = {
  info: { container: 'border-[var(--info)] bg-[var(--paper-100)]', icon: Info },
  warning: { container: 'border-[var(--warning)] bg-[var(--paper-100)]', icon: TriangleAlert },
  important: { container: 'border-[var(--brand-red-500)] bg-[var(--paper-100)]', icon: AlertTriangle },
}

/**
 * `variant` is a controlled enum (info/warning/important) - appearance and
 * colors are defined here by the frontend, never by Payload (§10.5).
 */
export function CalloutBlockView({ block }: CalloutBlockViewProps) {
  const { container, icon: Icon } = VARIANT_STYLES[block.variant]

  return (
    <div className={cn('my-8 flex gap-3 rounded-lg border-l-4 p-4', container)}>
      <Icon className="mt-0.5 size-5 shrink-0 text-[var(--ink-950)]" aria-hidden />
      <div className="flex flex-col gap-1">
        {block.title ? <p className="font-[var(--font-display)] font-semibold text-[var(--ink-950)]">{block.title}</p> : null}
        {block.content ? <p className="type-body text-[var(--ink-700)]">{block.content}</p> : null}
      </div>
    </div>
  )
}
