import type { GlobalAfterChangeHook } from 'payload'

import { invalidateArticleSidebar, invalidateFooter, invalidateNavigation, invalidateSettings } from '@/lib/cache/invalidate'

/**
 * Navigation/Footer/ArticleSidebar have no draft workflow - every change is
 * already live, so each hook invalidates its own tag unconditionally
 * (§40.4, AC-CACHE-005).
 */
export const invalidateNavigationCache: GlobalAfterChangeHook = (args) => {
  invalidateNavigation()
  return args.doc
}

export const invalidateFooterCache: GlobalAfterChangeHook = (args) => {
  invalidateFooter()
  return args.doc
}

export const invalidateArticleSidebarCache: GlobalAfterChangeHook = (args) => {
  invalidateArticleSidebar()
  return args.doc
}

const LLMS_RELEVANT_FIELDS = ['branding', 'seo'] as const

function hasChangedRelevantField(doc: Record<string, unknown>, previousDoc: Record<string, unknown> | undefined): boolean {
  if (!previousDoc) return true
  return LLMS_RELEVANT_FIELDS.some((field) => JSON.stringify(doc[field]) !== JSON.stringify(previousDoc[field]))
}

/** SiteSettings has no draft workflow either - `llms` is only busted when a field `/llms.txt` actually reads (`branding`, `seo`) changed. */
export const invalidateSettingsCache: GlobalAfterChangeHook = ({ doc, previousDoc }) => {
  invalidateSettings({ affectsLlms: hasChangedRelevantField(doc, previousDoc) })
  return doc
}
