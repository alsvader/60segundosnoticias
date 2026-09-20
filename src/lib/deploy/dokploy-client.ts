/**
 * openspec/changes/production-deployment-dokploy - piezas de
 * `scripts/dokploy-deploy.ts` extraídas a un módulo para poder probarlas
 * con `vitest` (mismo patrón que `src/lib/deploy/dokploy-env.ts`): un
 * script ejecutado con `node scripts/dokploy-deploy.ts` no expone nada
 * importable por sí mismo, y las funciones aquí dependen de `fetch`
 * global o son puras - ambos casos testeables sin infraestructura real.
 *
 * El script sigue siendo el único punto de entrada real; este módulo no
 * tiene ningún efecto por sí solo al importarse.
 */
import { createHash } from 'node:crypto'

export type JsonRecord = Record<string, unknown>

// ---------------------------------------------------------------------------
// VERIFICADO contra el Swagger real de la instancia del operador
// (`<DOKPLOY_URL>/swagger`, tarea 7.1): el nombre del campo de estado y
// sus valores terminales coinciden con lo asumido aquí - no se necesitó
// ningún cambio. Todo lo que sigue en este archivo razona en términos de
// "¿hubo una transición de estado terminal reconocida?", nunca del valor
// concreto que devuelve la API - salvo en este bloque, que es
// deliberadamente el único lugar donde el nombre y los valores del campo
// de estado están hardcodeados. Si una instancia distinta de Dokploy
// alguna vez contradice esto, corregir solo aquí.
//
// Si el nombre de campo fuera incorrecto, `extractComposeStatus` siempre
// devolvería `undefined`, y por diseño ("estado ausente/desconocido =>
// sigue desplegando, nunca éxito") el script degradaría de forma segura:
// nunca reportaría éxito falso, pero sí agotaría el tope de 15 minutos y
// fallaría con `DOKPLOY_STATUS_TIMEOUT`. Esa falla seguiría siendo la
// señal de que hay que revisar esta constante.
// ---------------------------------------------------------------------------
export const DOKPLOY_STATUS_FIELD = 'status'
export const DOKPLOY_DONE_STATUSES = new Set(['done'])
export const DOKPLOY_ERROR_STATUSES = new Set(['error'])

// Ídem, verificado (tarea 7.1): `compose.deploy` sí devuelve un id de
// despliegue bajo uno de estos candidatos, probados en orden. Se reporta
// "desconocido" en el resumen si ninguno aparece - nunca se inventa un id.
export const DEPLOYMENT_ID_CANDIDATE_FIELDS = ['deploymentId', 'id']

// Tiempos de sondeo (design.md, Decisión 3 / plan, Etapa 4).
export const STATUS_FIRST_PHASE_MS = 60_000
export const STATUS_FIRST_INTERVAL_MS = 5_000
export const STATUS_SECOND_INTERVAL_MS = 10_000
export const STATUS_CAP_MS = 15 * 60_000

export const SHA_POLL_INTERVAL_MS = 5_000
export const SHA_REQUIRED_CONSECUTIVE_MATCHES = 3
export const SHA_CAP_MS = 10 * 60_000

export const HTTP_TIMEOUT_MS = 20_000

export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * `::add-mask::` es un comando de workflow de GitHub Actions: una vez
 * emitido para un valor, Actions lo redacta en cualquier log posterior de
 * esta corrida, incluyendo el texto de errores HTTP que pudieran
 * eco-repetirlo. Por eso enmascarar "apenas se recibe" (antes de tocar el
 * blob) importa, no solo antes de imprimir el blob mismo.
 *
 * Devuelve la lista de valores a enmascarar en vez de llamar a
 * `console.log` directamente, para que sea trivial de probar sin capturar
 * stdout - el script (`dokploy-deploy.ts`) es quien realmente emite
 * `::add-mask::` por cada uno.
 */
const ENV_LINE_PATTERN = /^[ \t]*(?:export[ \t]+)?([A-Za-z_][A-Za-z0-9_]*)[ \t]*=([^\r\n]*)$/

export function findSecretsToMaskInEnvBlob(blob: string): string[] {
  const values: string[] = []
  for (const line of blob.split(/\r\n|\n|\r/)) {
    const match = ENV_LINE_PATTERN.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    if (key === 'RUNNER_IMAGE' || key === 'MIGRATOR_IMAGE') continue
    const value = rawValue.trim()
    if (value.length > 4) {
      values.push(value)
    }
  }
  return values
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Base URL: `<DOKPLOY_URL>/api`. Auth: header `x-api-key` (verificado contra docs.dokploy.com). */
export async function dokployApiCall(params: {
  dokployUrl: string
  token: string
  procedure: 'compose.one' | 'compose.update' | 'compose.deploy'
  method: 'GET' | 'POST'
  query?: Record<string, string>
  body?: JsonRecord
}): Promise<JsonRecord | undefined> {
  const base = params.dokployUrl.replace(/\/+$/, '')
  const url = new URL(`${base}/api/${params.procedure}`)
  if (params.query) {
    for (const [key, value] of Object.entries(params.query)) url.searchParams.set(key, value)
  }

  const response = await fetchWithTimeout(
    url.toString(),
    {
      method: params.method,
      headers: {
        'x-api-key': params.token,
        ...(params.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    },
    HTTP_TIMEOUT_MS,
  )

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Dokploy API ${params.procedure} respondió HTTP ${response.status}: ${text.slice(0, 500)}`)
  }
  if (!text) return undefined
  return JSON.parse(text) as JsonRecord
}

export async function fetchComposeOne(dokployUrl: string, token: string, composeId: string): Promise<JsonRecord> {
  const result = await dokployApiCall({
    dokployUrl,
    token,
    procedure: 'compose.one',
    method: 'GET',
    query: { composeId },
  })
  if (!result) {
    throw new Error('compose.one devolvió una respuesta vacía - se esperaba el objeto de configuración del Compose.')
  }
  return result
}

/** Nombre de campo confirmado contra la descripción del API (task): `env`, `string | null`. */
export function extractEnvBlob(compose: JsonRecord): string {
  const raw = compose.env
  if (raw === null || raw === undefined) return ''
  if (typeof raw !== 'string') {
    throw new Error(`compose.one devolvió un campo "env" con tipo inesperado (${typeof raw}) - no es seguro continuar.`)
  }
  return raw
}

export function extractComposeStatus(compose: JsonRecord): string | undefined {
  const value = compose[DOKPLOY_STATUS_FIELD]
  return typeof value === 'string' ? value : undefined
}

export function extractDeploymentId(response: JsonRecord | undefined): string | undefined {
  if (!response) return undefined
  for (const field of DEPLOYMENT_ID_CANDIDATE_FIELDS) {
    const value = response[field]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return undefined
}

/**
 * Verificado contra el Swagger real (tarea 7.1): el comportamiento de
 * `compose.update` frente al objeto completo vs. un patch parcial
 * coincide con lo asumido aquí - no se necesitó ningún cambio en esta
 * función. Los endpoints `compose.*` de Dokploy siguen el patrón de
 * tRPC (`router.procedure`), donde las mutaciones suelen validar contra
 * un esquema completo y no aceptan patches parciales arbitrarios - por
 * eso el primer intento reenvía el objeto completo leído de `compose.one`
 * con `env` sobrescrito. Si Dokploy lo rechaza (HTTP 4xx, probablemente
 * por un campo de solo lectura que el esquema de entrada no espera), se
 * degrada a un patch mínimo `{composeId, env}`. Si ese también falla, se
 * aborta con un error explícito - nunca se adivina una tercera forma.
 */
export async function updateComposeEnv(params: {
  dokployUrl: string
  token: string
  composeId: string
  currentCompose: JsonRecord
  newEnvBlob: string
}): Promise<void> {
  const fullBody: JsonRecord = { ...params.currentCompose, composeId: params.composeId, env: params.newEnvBlob }
  try {
    console.log('compose.update: intento 1 (objeto completo leído de compose.one, con "env" sobrescrito).')
    await dokployApiCall({
      dokployUrl: params.dokployUrl,
      token: params.token,
      procedure: 'compose.update',
      method: 'POST',
      body: fullBody,
    })
    return
  } catch (error) {
    console.warn(
      `compose.update: el intento 1 (objeto completo) falló (${(error as Error).message}). ` +
        'Degradando a un patch mínimo {composeId, env} - ver el comentario de updateComposeEnv sobre esta suposición.',
    )
  }

  const minimalBody: JsonRecord = { composeId: params.composeId, env: params.newEnvBlob }
  await dokployApiCall({
    dokployUrl: params.dokployUrl,
    token: params.token,
    procedure: 'compose.update',
    method: 'POST',
    body: minimalBody,
  })
}

/**
 * Aserción explícita y permanente: `compose.deploy` NUNCA SHALL recibir
 * `freshVolumes`. Enviarlo destruiría cualquier volumen nombrado del
 * stack (hoy no hay ninguno con estado real desde que Postgres salió del
 * Compose, pero la aserción se mantiene barata a propósito - ver
 * design.md, Risks).
 */
export function assertDeployRequestNeverSendsFreshVolumes(body: JsonRecord): void {
  if ('freshVolumes' in body) {
    throw new Error(
      'Invariante violado: el cuerpo de compose.deploy incluye "freshVolumes". Esto NUNCA SHALL enviarse - ' +
        'destruiría volúmenes con estado. Abortando antes de la llamada real.',
    )
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export type StatusOutcome = { outcome: 'done' | 'error' | 'timeout'; finalStatus: string | undefined }

/**
 * Sondeo cada 5s el primer minuto, luego cada 10s, tope 15 min (design.md
 * Decisión 3 / plan Etapa 4). Exige una TRANSICIÓN respecto al estado
 * previo a `compose.deploy` - un valor terminal que ya estaba ahí de un
 * despliegue anterior nunca cuenta como éxito de esta corrida. Estado
 * ausente o no reconocido como terminal (`DOKPLOY_DONE_STATUSES`/
 * `DOKPLOY_ERROR_STATUSES`) siempre se trata como "sigue desplegando".
 */
export async function waitForDokployStatusTransition(params: {
  dokployUrl: string
  token: string
  composeId: string
  previousStatus: string | undefined
}): Promise<StatusOutcome> {
  const start = Date.now()
  // `lastSeenStatus` se actualiza en cada lectura (no solo el valor
  // ORIGINAL previo a `compose.deploy`): una secuencia real
  // done(viejo) -> running -> done(nuevo) SHALL contar el segundo "done"
  // como una transición genuina, aunque coincida textualmente con el
  // valor viejo - ya se observó un estado intermedio distinto en el
  // camino. Comparar siempre contra el valor original fijo dejaría ese
  // segundo "done" sin detectar jamás. La garantía que sí se preserva:
  // un "done" que NUNCA cambia (se repite igual en cada lectura, sin
  // pasar nunca por otro valor) sigue sin contar como éxito de esta
  // corrida - `currentStatus === lastSeenStatus` en todas las vueltas.
  let lastSeenStatus = params.previousStatus
  while (Date.now() - start < STATUS_CAP_MS) {
    const elapsed = Date.now() - start
    const interval = elapsed < STATUS_FIRST_PHASE_MS ? STATUS_FIRST_INTERVAL_MS : STATUS_SECOND_INTERVAL_MS
    await sleep(interval)

    const compose = await fetchComposeOne(params.dokployUrl, params.token, params.composeId)
    const currentStatus = extractComposeStatus(compose)
    console.log(`compose.one: estado actual = ${currentStatus ?? '(ausente)'} (último visto = ${lastSeenStatus ?? '(ausente)'})`)

    if (currentStatus !== undefined && currentStatus !== lastSeenStatus) {
      if (DOKPLOY_DONE_STATUSES.has(currentStatus)) return { outcome: 'done', finalStatus: currentStatus }
      if (DOKPLOY_ERROR_STATUSES.has(currentStatus)) return { outcome: 'error', finalStatus: currentStatus }
      // Transición a un valor intermedio no reconocido como terminal
      // (p. ej. "running") - seguir esperando el estado terminal real.
    }
    if (currentStatus !== undefined) lastSeenStatus = currentStatus
  }
  return { outcome: 'timeout', finalStatus: undefined }
}

export type HealthProbe = { reachable: boolean; httpStatus?: number; sha: string | null }

export async function probeHealth(productionUrl: string): Promise<HealthProbe> {
  try {
    const response = await fetchWithTimeout(`${productionUrl.replace(/\/+$/, '')}/api/health`, { method: 'GET' }, HTTP_TIMEOUT_MS)
    const body = (await response.json().catch(() => null)) as { sha?: unknown } | null
    const sha = body && typeof body.sha === 'string' ? body.sha : null
    return { reachable: true, httpStatus: response.status, sha }
  } catch {
    return { reachable: false, sha: null }
  }
}

export type ShaOutcome = { outcome: 'matched' | 'timeout'; lastObservedSha: string | null; everReachable: boolean }

/**
 * Sondeo cada 5s hasta 3 coincidencias CONSECUTIVAS de HTTP 200 + `sha`
 * exacto, tope 10 min tras la señal de estado (design.md Decisión 3). Las
 * 3 lecturas consecutivas existen porque, durante la ventana de reemplazo
 * del container, la release vieja y la nueva pueden contestar
 * alternadamente - una sola lectura en 200 no es evidencia suficiente.
 */
export async function waitForLiveShaMatch(params: { productionUrl: string; gitSha: string }): Promise<ShaOutcome> {
  const start = Date.now()
  let consecutive = 0
  let lastObservedSha: string | null = null
  let everReachable = false

  while (Date.now() - start < SHA_CAP_MS) {
    const probe = await probeHealth(params.productionUrl)
    if (probe.reachable) {
      everReachable = true
      lastObservedSha = probe.sha
      if (probe.httpStatus === 200 && probe.sha === params.gitSha) {
        consecutive += 1
        console.log(`/api/health: sha=${probe.sha} coincide (${consecutive}/${SHA_REQUIRED_CONSECUTIVE_MATCHES} consecutivas).`)
        if (consecutive >= SHA_REQUIRED_CONSECUTIVE_MATCHES) {
          return { outcome: 'matched', lastObservedSha, everReachable }
        }
      } else {
        consecutive = 0
        console.log(`/api/health: sin coincidencia (http=${probe.httpStatus ?? 'n/a'}, sha=${probe.sha ?? '(ausente)'}).`)
      }
    } else {
      consecutive = 0
      console.log('/api/health: inalcanzable en este intento.')
    }
    await sleep(SHA_POLL_INTERVAL_MS)
  }
  return { outcome: 'timeout', lastObservedSha, everReachable }
}

export type FailureClass = 'MIGRATION_FAILED_OLD_SERVING' | 'SITE_UNREACHABLE' | 'NEW_SHA_NEVER_LIVE' | 'ENV_VERIFICATION_MISMATCH'

export type DeployFailureClassification = { failureClass: FailureClass; detail: string }

/**
 * Clasificación de falla para la señal 1 (estado de Dokploy). Se alcanza
 * cuando `waitForDokployStatusTransition` termina en `error` o `timeout`
 * - nunca en `done`. Distingue "la release anterior sigue sirviendo" de
 * "sitio caído" sondeando `/api/health` una vez más en ese momento -
 * exactamente la clasificación que exige el diseño (nunca inferirla solo
 * del estado de Dokploy, que no sabe nada del sitio público real).
 */
export function classifyStatusPhaseFailure(params: { statusOutcome: StatusOutcome; healthProbeReachable: boolean }): DeployFailureClassification {
  const detail =
    params.statusOutcome.outcome === 'error'
      ? `Dokploy reportó el estado terminal "${params.statusOutcome.finalStatus}"`
      : 'Dokploy nunca confirmó una transición de estado dentro del tope de 15 minutos'
  return params.healthProbeReachable ? { failureClass: 'MIGRATION_FAILED_OLD_SERVING', detail } : { failureClass: 'SITE_UNREACHABLE', detail }
}

/**
 * Clasificación de falla para la señal 2 (SHA vivo). Se alcanza solo
 * después de que Dokploy ya confirmó `done` - por lo tanto nunca se
 * confunde con una falla de migración; distingue "nunca respondió" de
 * "respondió, pero nunca con el SHA nuevo 3 veces consecutivas".
 */
export function classifyShaPhaseFailure(params: { shaOutcome: ShaOutcome }): DeployFailureClassification {
  if (!params.shaOutcome.everReachable) {
    return { failureClass: 'SITE_UNREACHABLE', detail: 'Dokploy reportó el despliegue como completado' }
  }
  return {
    failureClass: 'NEW_SHA_NEVER_LIVE',
    detail: `Dokploy reportó el despliegue como completado (último SHA observado: ${params.shaOutcome.lastObservedSha ?? '(ausente)'})`,
  }
}

export function buildFailureMessage(failureClass: FailureClass, detail: string): string {
  switch (failureClass) {
    case 'ENV_VERIFICATION_MISMATCH':
      return `La verificación byte a byte del env de Dokploy tras compose.update no coincidió con lo que se intentó escribir. ${detail} Se abortó ANTES de llamar a compose.deploy - no se desplegó nada.`
    case 'MIGRATION_FAILED_OLD_SERVING':
      return `La migración falló: ${detail} y /api/health todavía devuelve el SHA anterior - la release anterior sigue sirviendo tráfico.`
    case 'SITE_UNREACHABLE':
      return `El sitio quedó inalcanzable: ${detail} y no fue posible obtener ninguna respuesta de /api/health durante la verificación.`
    case 'NEW_SHA_NEVER_LIVE':
      return `Desplegado pero la nueva release nunca quedó viva: ${detail} y el SHA nuevo nunca alcanzó 3 lecturas consecutivas en /api/health antes del tope de tiempo.`
  }
}
