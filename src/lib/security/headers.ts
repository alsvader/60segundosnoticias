/**
 * Producción (openspec/changes/production-hardening, capacidad
 * `production-security-headers`, AC-SEC-009): headers de seguridad HTTP
 * derivados del uso real de embeds de terceros en el sitio, no de una
 * lista genérica.
 *
 * `BASE_SECURITY_HEADERS`/`buildSecurityHeaders()` se consumen desde
 * `next.config.ts` (build time, headers estáticos que no dependen de
 * ninguna variable de runtime). `buildContentSecurityPolicy()`/
 * `getMediaOrigin()` se exportan aparte porque, además, los consume
 * `proxy.ts` en cada petición: `next.config.ts` congela su valor
 * resuelto en el build de `output: standalone` (openspec/changes/
 * s3-next-image-compatibility, design.md), lo cual es incorrecto para
 * una directiva que depende de `S3_PUBLIC_URL`, una variable
 * exclusivamente de runtime. Ambos puntos de entrada leen `process.env`
 * directamente en vez de `src/lib/env` (guardado con `server-only`)
 * porque `next.config.ts` corre en Node plano fuera del bundler de Next.
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

export function getMediaOrigin(): string | undefined {
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
export function buildContentSecurityPolicy(): string {
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
 * incluidas las propias de Next) de los headers públicos: el Admin no se
 * audita aquí y una política pensada para el sitio público no debe
 * arriesgar romperlo (ver design.md, decisión 5). Los headers base sí
 * aplican a todo el sitio, incluido el Admin.
 *
 * `Content-Security-Policy` deliberadamente NO está aquí: se establece
 * en `proxy.ts` en cada petición, con el mismo patrón de rutas públicas
 * de abajo, porque depende de `S3_PUBLIC_URL` (solo-runtime) - ver el
 * comentario de arriba y openspec/changes/s3-next-image-compatibility.
 */
export function buildSecurityHeaders(): Array<{
  headers: Array<{ key: string; value: string }>
  source: string
}> {
  const publicPageHeaders: Array<{ key: string; value: string }> = []

  if (isSiteConfiguredForHttps()) {
    publicPageHeaders.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains',
    })
  }

  const groups = [{ headers: BASE_SECURITY_HEADERS, source: '/:path*' }]

  // Next rechaza en build time una entrada de `headers()` con un
  // arreglo `headers` vacío ("headers field cannot be empty for
  // route") - confirmado empíricamente. `publicPageHeaders` puede
  // quedar vacío ahora que la CSP vive en `proxy.ts`, si además no hay
  // HTTPS configurado (sin HSTS). Omitir la entrada por completo en ese
  // caso, en vez de emitir un `headers()` inválido.
  if (publicPageHeaders.length > 0) {
    groups.push({ headers: publicPageHeaders, source: '/((?!admin|api).*)' })
  }

  return groups
}
