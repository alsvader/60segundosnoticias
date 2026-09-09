import type { CollectionBeforeChangeHook } from 'payload'

import type { Post } from '../../../payload-types.ts'
import { countWords, extractLexicalText } from '../lib/lexical-text.ts'

const WORDS_PER_MINUTE = 200

/**
 * Always recomputes `readingTimeMinutes` from `content` server-side,
 * overriding whatever the client sent - `admin.readOnly` on the field only
 * blocks the Admin UI form, not direct API writes.
 */
export const computeReadingTime: CollectionBeforeChangeHook<Post> = ({ data }) => {
  const text = extractLexicalText(data.content)
  const words = countWords(text)
  const readingTimeMinutes = words === 0 ? 0 : Math.ceil(words / WORDS_PER_MINUTE)

  return { ...data, readingTimeMinutes }
}
