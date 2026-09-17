import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/tags'
import { getAllCategories } from '@/lib/data/categories'
import { getPublishedPagesForLlms } from '@/lib/data/pages'
import { getPublishedPostsForLlms } from '@/lib/data/posts'
import { getSettings } from '@/lib/data/settings'
import { getAbsoluteUrl, getCategoryUrl, getPageUrl, getPostUrl } from '@/lib/url/canonical'

/** llms.txt v2 (llmstxt.org) recomienda un listado curado, no un volcado histórico completo - 25 es el punto medio del rango sugerido (AC-LLM-005). */
const RECENT_POSTS_LIMIT = 25

/**
 * Escapa caracteres con significado estructural en Markdown (corchetes,
 * paréntesis - romperían `[label](url)`) y colapsa saltos de línea, para
 * que texto editorial libre (título/extracto/descripción) no pueda
 * corromper la estructura de encabezados/listas/enlaces del documento
 * (AC-LLM: "caracteres especiales no corrompen el documento").
 */
export function escapeMarkdownInline(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/([[\]()])/g, '\\$1')
    .trim()
}

export function formatLink(label: string, url: string, note?: string): string {
  const safeLabel = escapeMarkdownInline(label)
  const safeNote = note ? escapeMarkdownInline(note) : undefined
  return safeNote ? `- [${safeLabel}](${url}): ${safeNote}` : `- [${safeLabel}](${url})`
}

async function buildLlmsTxtContent(): Promise<string> {
  const [settings, categories, posts, pages] = await Promise.all([
    getSettings(),
    getAllCategories(),
    getPublishedPostsForLlms({ limit: RECENT_POSTS_LIMIT }),
    getPublishedPagesForLlms(),
  ])

  const siteName = settings.branding?.siteName || '60 Segundos Noticias'
  const summary = settings.branding?.tagline || settings.seo?.defaultMetaDescription || 'Portal editorial y multimedia.'

  const lines: string[] = [`# ${escapeMarkdownInline(siteName)}`, '', `> ${escapeMarkdownInline(summary)}`, '']

  if (categories.length > 0) {
    lines.push('## Categorías', '')
    for (const category of categories) {
      lines.push(formatLink(category.name, getAbsoluteUrl(getCategoryUrl(category.slug))))
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Últimas noticias', '')
    for (const post of posts) {
      lines.push(formatLink(post.title, getAbsoluteUrl(getPostUrl(post.primaryCategorySlug, post.slug)), post.excerpt))
    }
    lines.push('')
  }

  if (pages.length > 0) {
    lines.push('## Páginas', '')
    for (const page of pages) {
      lines.push(formatLink(page.title, getAbsoluteUrl(getPageUrl(page.slug))))
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}

/** Envuelto en `unstable_cache`, tag `llms` - cada hook de invalidación de Post/Category/Page/SiteSettings ya revalida ese tag explícitamente. */
export const getLlmsTxtContent = unstable_cache(buildLlmsTxtContent, ['llms-txt'], { tags: [CACHE_TAGS.llms] })
