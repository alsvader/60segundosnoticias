/**
 * Producción (openspec/changes/production-hardening, capacidad
 * `production-security-headers`, AC-SEC-009): headers de seguridad HTTP
 * derivados del uso real de embeds de terceros en el sitio, no de una
 * lista genérica. Cargado desde `next.config.ts`, que corre en Node plano
 * fuera del bundler de Next - no puede importar `src/lib/env` (guardado
 * con `server-only`), así que lee `process.env` directamente, igual que
 * `src/lib/env/payload.ts` hace para `payload.config.ts`.
 *
 * Fuentes verificadas contra el código real, no supuestas:
 * - `src/lib/editorial/video-provider.ts` (YouTube/Vimeo, vía Vidstack)
 * - `src/lib/editorial/embed-provider.ts` + `embed-block-client.tsx` +
 *   `tiktok-embed.tsx` + `facebook-video-embed.tsx` (Instagram/X/TikTok/
 *   Facebook/LinkedIn, vía `react-social-media-embed` + componentes propios)
 *
 * Cada proveedor social corre dentro de su propio `<iframe>` (`frame-src`);
 * sus scripts de carga (`widgets.js`, `embed.js`, `sdk.js`) se ejecutan en
 * el documento propio (`script-src`), pero el contenido que cargan dentro
 * de su iframe vive en el contexto de ESE origen, no en el nuestro - no
 * necesitan entradas en `img-src`/`connect-src` de esta política.
 */

const YOUTUBE_FRAME_SOURCES = ['https://www.youtube.com', 'https://www.youtube-nocookie.com']
const VIMEO_FRAME_SOURCE = 'https://player.vimeo.com'
const INSTAGRAM_FRAME_SOURCE = 'https://www.instagram.com'
const INSTAGRAM_SCRIPT_SOURCE = 'https://www.instagram.com'
const TWITTER_FRAME_SOURCE = 'https://platform.twitter.com'
const TWITTER_SCRIPT_SOURCE = 'https://platform.twitter.com'
const FACEBOOK_FRAME_SOURCE = 'https://www.facebook.com'
const FACEBOOK_SCRIPT_SOURCE = 'https://connect.facebook.net'
const LINKEDIN_FRAME_SOURCE = 'https://www.linkedin.com'
const TIKTOK_FRAME_SOURCE = 'https://www.tiktok.com'

const EMBED_FRAME_SOURCES = [
  ...YOUTUBE_FRAME_SOURCES,
  VIMEO_FRAME_SOURCE,
  INSTAGRAM_FRAME_SOURCE,
  TWITTER_FRAME_SOURCE,
  FACEBOOK_FRAME_SOURCE,
  LINKEDIN_FRAME_SOURCE,
  TIKTOK_FRAME_SOURCE,
]

const EMBED_SCRIPT_SOURCES = [INSTAGRAM_SCRIPT_SOURCE, TWITTER_SCRIPT_SOURCE, FACEBOOK_SCRIPT_SOURCE]

function getMediaOrigin(): string | undefined {
  const publicUrl = process.env.S3_PUBLIC_URL
  if (!publicUrl) return undefined
  try {
    return new URL(publicUrl).origin
  } catch {
    return undefined
  }
}

function isSiteConfiguredForHttps(): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return false
  try {
    return new URL(siteUrl).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * `'unsafe-inline'` en `script-src`/`style-src` es una concesión
 * deliberada, no un descuido: el App Router de Next incrusta datos de
 * hidratación inline, y `EmbedStyle` (de `react-social-media-embed`)
 * inserta un `<style>` inline en nuestro propio documento. Servir un
 * `script-src` estricto vía nonce requeriría `middleware.ts`, que esta
 * fase decide explícitamente no introducir solo para headers (ver
 * design.md, decisión 5). Ningún origen de script queda con wildcard, y
 * la lista de orígenes permitidos sí es estricta.
 */
function buildContentSecurityPolicy(): string {
  const mediaOrigin = getMediaOrigin()

  const directives: Record<string, string[]> = {
    'base-uri': ["'self'"],
    'connect-src': ["'self'", ...(mediaOrigin ? [mediaOrigin] : [])],
    'default-src': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'frame-src': EMBED_FRAME_SOURCES,
    'img-src': ["'self'", 'data:', 'blob:', ...(mediaOrigin ? [mediaOrigin] : [])],
    'object-src': ["'none'"],
    'script-src': ["'self'", "'unsafe-inline'", ...EMBED_SCRIPT_SOURCES],
    'style-src': ["'self'", "'unsafe-inline'"],
  }

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

const BASE_SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
]

/**
 * Excluye `/admin` y `/api` (Payload Admin y todas las rutas API,
 * incluidas las propias de Next) de la CSP pública: el Admin no se
 * audita aquí y una CSP pensada para el sitio público no debe arriesgar
 * romperlo (ver design.md, decisión 5). Los headers base sí aplican a
 * todo el sitio, incluido el Admin.
 */
export function buildSecurityHeaders(): Array<{
  headers: Array<{ key: string; value: string }>
  source: string
}> {
  const publicPageHeaders = [{ key: 'Content-Security-Policy', value: buildContentSecurityPolicy() }]

  if (isSiteConfiguredForHttps()) {
    publicPageHeaders.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains',
    })
  }

  return [
    { headers: BASE_SECURITY_HEADERS, source: '/:path*' },
    { headers: publicPageHeaders, source: '/((?!admin|api).*)' },
  ]
}
