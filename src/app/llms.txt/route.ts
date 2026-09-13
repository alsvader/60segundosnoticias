import { getLlmsTxtContent } from '@/lib/seo/llms-txt'

/**
 * LLM / Agent Discoverability (§41.6, AC-LLM-001..006) - documento
 * Markdown curado y acotado, complementario a metadata/JSON-LD/sitemap/
 * robots, nunca un sustituto. No garantiza posicionamiento, citación ni
 * inclusión en entrenamiento de modelos.
 */
export async function GET(): Promise<Response> {
  const content = await getLlmsTxtContent()

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
