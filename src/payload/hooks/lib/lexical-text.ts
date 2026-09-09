/**
 * Best-effort text extraction from a Payload Lexical document, including
 * text carried by embedded Article Content Blocks (Quote/Callout/Image-
 * like caption fields). Approximate by design - the Master Spec only
 * requires the reading-time estimate to be consistent and automatic, not
 * a byte-perfect word count.
 */

type LexicalNode = {
  children?: LexicalNode[]
  fields?: Record<string, unknown>
  text?: string
  type?: string
}

const TEXT_LIKE_BLOCK_FIELD_KEYS = ['quote', 'title', 'content', 'caption', 'text']

const extractFromValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(extractFromValue).join(' ')
  }
  if (value && typeof value === 'object') {
    return extractFromNode(value as LexicalNode)
  }
  return ''
}

const extractFromNode = (node: LexicalNode): string => {
  const parts: string[] = []

  if (typeof node.text === 'string') {
    parts.push(node.text)
  }

  if (Array.isArray(node.children)) {
    parts.push(...node.children.map(extractFromNode))
  }

  if (node.type === 'block' && node.fields && typeof node.fields === 'object') {
    for (const key of TEXT_LIKE_BLOCK_FIELD_KEYS) {
      const value = node.fields[key]
      if (value) {
        parts.push(extractFromValue(value))
      }
    }
  }

  return parts.join(' ')
}

export const extractLexicalText = (content: unknown): string => {
  if (!content || typeof content !== 'object') {
    return ''
  }
  const root = (content as { root?: LexicalNode }).root
  if (!root) {
    return ''
  }
  return extractFromNode(root)
}

export const countWords = (text: string): number => {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}
