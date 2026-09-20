/**
 * openspec/changes/production-deployment-dokploy - Etapa 4 del plan
 * (`~/.claude/plans/lucky-stargazing-pony.md`), design.md Decisión 3,
 * señal 3 ("smoke").
 *
 * Smoke GET-only contra `$PRODUCTION_URL`, invocado por el job `deploy`
 * de `release.yml` (y por `rollback.yml`) DESPUÉS de que
 * `scripts/dokploy-deploy.ts` ya confirmó las señales 1 y 2 (estado de
 * Dokploy + SHA vivo). Verifica seis rutas: `/api/health`, `/`, una
 * Category, un Article, `/buscar`, `/admin/login`. Toda respuesta SHALL
 * ser `< 400`.
 *
 * Los slugs de fixture de este repo (`/fixture-noticias/...`) no existen
 * en producción, así que Category/Article se descubren desde
 * `/sitemap.xml` en vez de hardcodearse. `src/app/sitemap.ts` emite, en
 * este orden, Home -> Categories (`getCategoryUrl`, un solo segmento de
 * ruta) -> Pages (`getPageUrl`, también un solo segmento - por eso no
 * basta con "un segmento" para distinguir Category de Page, y se toma el
 * PRIMER `<loc>` de un solo segmento, que por ese orden de emisión es
 * siempre una Category) -> Posts (`getPostUrl`, dos segmentos:
 * `/[category]/[post]`). `SMOKE_CATEGORY_PATH`/`SMOKE_ARTICLE_PATH`
 * sirven como override explícito si esa heurística de orden alguna vez
 * deja de sostenerse.
 *
 * Convención de ejecución: `node scripts/smoke-production.ts`, igual que
 * `scripts/run-migration-chain.ts` - sin paso de build, sin dependencias
 * nuevas.
 */

const HTTP_TIMEOUT_MS = 15_000
const MAX_ACCEPTABLE_STATUS = 400 // exclusivo - toda respuesta SHALL ser < 400.

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria ${name}. Requerida: PRODUCTION_URL.`)
  }
  return value
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // GET-only a propósito (design.md/plan): un smoke de producción nunca
    // muta estado.
    return await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Extrae todos los `<loc>` de `/sitemap.xml` con una regex simple en vez
 * de traer un parser XML nuevo (convención de `scripts/`: sin
 * dependencias nuevas) - `next-sitemap`/`MetadataRoute.Sitemap` emite un
 * documento bien formado con un `<loc>` por entrada, suficiente para este
 * descubrimiento.
 */
function extractSitemapLocations(xml: string): string[] {
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g)
  return [...matches].map((match) => match[1].trim())
}

function pathSegments(absoluteUrl: string): string[] {
  const { pathname } = new URL(absoluteUrl)
  return pathname.split('/').filter((segment) => segment.length > 0)
}

type DiscoveredPaths = { categoryPath: string; articlePath: string }

async function discoverCategoryAndArticlePaths(productionUrl: string): Promise<DiscoveredPaths> {
  const overrideCategory = process.env.SMOKE_CATEGORY_PATH
  const overrideArticle = process.env.SMOKE_ARTICLE_PATH

  if (overrideCategory && overrideArticle) {
    return { categoryPath: overrideCategory, articlePath: overrideArticle }
  }

  console.log('Descubriendo Category/Article reales desde /sitemap.xml...')
  const sitemapUrl = `${productionUrl.replace(/\/+$/, '')}/sitemap.xml`
  const response = await fetchWithTimeout(sitemapUrl, HTTP_TIMEOUT_MS)
  if (!response.ok) {
    throw new Error(
      `No se pudo leer ${sitemapUrl} (HTTP ${response.status}) para descubrir Category/Article. ` +
        'Defina SMOKE_CATEGORY_PATH y SMOKE_ARTICLE_PATH para evitar el descubrimiento automático.',
    )
  }
  const xml = await response.text()
  const locations = extractSitemapLocations(xml)

  let discoveredCategoryPath: string | undefined
  let discoveredArticlePath: string | undefined

  for (const location of locations) {
    const segments = pathSegments(location)
    if (segments.length === 1 && !discoveredCategoryPath) {
      discoveredCategoryPath = `/${segments[0]}`
    } else if (segments.length === 2 && !discoveredArticlePath) {
      discoveredArticlePath = `/${segments[0]}/${segments[1]}`
    }
    if (discoveredCategoryPath && discoveredArticlePath) break
  }

  const categoryPath = overrideCategory ?? discoveredCategoryPath
  const articlePath = overrideArticle ?? discoveredArticlePath

  if (!categoryPath) {
    throw new Error(
      `No se pudo descubrir una Category real desde ${sitemapUrl} (ningún <loc> de un solo segmento de ruta). ` +
        'Defina SMOKE_CATEGORY_PATH con una ruta real (p. ej. /nacional) en vez de omitir este chequeo.',
    )
  }
  if (!articlePath) {
    throw new Error(
      `No se pudo descubrir un Article real desde ${sitemapUrl} (ningún <loc> de dos segmentos de ruta). ` +
        'Defina SMOKE_ARTICLE_PATH con una ruta real (p. ej. /nacional/titulo-de-la-nota) en vez de omitir este chequeo.',
    )
  }

  return { categoryPath, articlePath }
}

type CheckResult = { name: string; path: string; status: number | null; ok: boolean; error?: string }

async function checkPath(productionUrl: string, name: string, path: string): Promise<CheckResult> {
  const url = `${productionUrl.replace(/\/+$/, '')}${path}`
  try {
    const response = await fetchWithTimeout(url, HTTP_TIMEOUT_MS)
    const ok = response.status < MAX_ACCEPTABLE_STATUS
    return { name, path, status: response.status, ok }
  } catch (error) {
    return { name, path, status: null, ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function main(): Promise<void> {
  const productionUrl = getRequiredEnv('PRODUCTION_URL')
  const { categoryPath, articlePath } = await discoverCategoryAndArticlePaths(productionUrl)

  const checks: Array<{ name: string; path: string }> = [
    { name: 'health', path: '/api/health' },
    { name: 'home', path: '/' },
    { name: 'category', path: categoryPath },
    { name: 'article', path: articlePath },
    { name: 'buscar', path: '/buscar' },
    { name: 'admin-login', path: '/admin/login' },
  ]

  console.log(`Smoke de producción contra ${productionUrl} - ${checks.length} rutas, todas SHALL responder < 400.`)

  const results: CheckResult[] = []
  for (const check of checks) {
    const result = await checkPath(productionUrl, check.name, check.path)
    results.push(result)
    const label = result.ok ? 'OK' : 'FALLÓ'
    console.log(`  [${label}] ${result.name} ${result.path} -> ${result.status ?? `error: ${result.error}`}`)
  }

  const failures = results.filter((result) => !result.ok)
  if (failures.length > 0) {
    console.error(`Smoke de producción FALLÓ: ${failures.length}/${results.length} ruta(s) no cumplieron < 400.`)
    process.exit(1)
    return
  }

  console.log('Smoke de producción OK: las 6 rutas respondieron < 400.')
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`smoke-production.ts falló: ${message}`)
  process.exit(1)
})
