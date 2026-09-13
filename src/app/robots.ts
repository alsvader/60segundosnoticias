import type { MetadataRoute } from 'next'

import { getAbsoluteUrl } from '@/lib/url/canonical'

/**
 * §42: producción permite indexación pública y referencia el sitemap;
 * no-producción bloquea todo, vía `NODE_ENV` (entorno ya existente, sin
 * variable nueva) - nunca indexación accidental de un entorno de pruebas.
 * Política neutral respecto a crawlers de IA (Decisión 6 del usuario): sin
 * reglas por user-agent específico. `/llms.txt` nunca se bloquea.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NODE_ENV !== 'production') {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/api/preview', '/api/preview-exit'],
    },
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  }
}
