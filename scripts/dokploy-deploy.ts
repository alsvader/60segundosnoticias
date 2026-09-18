/**
 * openspec/changes/production-deployment-dokploy - Etapas 3 y 4 del plan
 * (`~/.claude/plans/lucky-stargazing-pony.md`), design.md Decisiones 1 y 3.
 *
 * Entrega una imagen ya calificada (release.yml) al servicio Compose de
 * Dokploy y espera, con evidencia real, a que la release nueva haya
 * quedado sirviendo tráfico - nunca a que Dokploy diga "listo" a secas.
 *
 * Flujo: `compose.one` (leer) -> enmascarar cada secreto apenas se recibe
 * -> reescribir `RUNNER_IMAGE`/`MIGRATOR_IMAGE` con
 * `rewriteDokployEnvBlob` (única función que toca el blob - nunca
 * split/join, ver `src/lib/deploy/dokploy-env.ts`) -> `compose.update` ->
 * **re-leer y verificar byte a byte** que quedó igual a lo que se
 * intentó escribir, abortando antes de desplegar si no coincide ->
 * `compose.deploy` -> esperar dos señales obligatorias (estado de
 * Dokploy con transición exigida + SHA vivo con 3 lecturas consecutivas).
 * La tercera señal (smoke) vive en `scripts/smoke-production.ts` y la
 * invoca por separado el job `deploy` de `release.yml` - este script
 * nunca la ejecuta.
 *
 * Nunca imprime el blob de entorno completo: solo su `sha256` antes/
 * después, y un `::add-mask::` por cada valor de más de 4 caracteres
 * (salvo las dos claves de imagen, que son públicas por diseño). El
 * token de Dokploy se lee solo de `process.env.DOKPLOY_TOKEN`, nunca de
 * `process.argv`. `freshVolumes` NUNCA se envía a `compose.deploy` -
 * destruiría el volumen de Postgres si algún día vuelve a vivir en este
 * stack (ver `assertDeployRequestNeverSendsFreshVolumes` abajo).
 *
 * Convención de ejecución: `node scripts/dokploy-deploy.ts`, igual que
 * `scripts/run-migration-chain.ts` - sin paso de build, sin dependencias
 * nuevas (solo módulos nativos de Node + `rewriteDokployEnvBlob`, que
 * tampoco tiene dependencias externas).
 */
import { createHash } from 'node:crypto'
import { appendFileSync } from 'node:fs'

import { rewriteDokployEnvBlob } from '../src/lib/deploy/dokploy-env.ts'

// ---------------------------------------------------------------------------
// ADVERTENCIA - SIN VERIFICAR contra el Swagger real de la instancia del
// operador (`<DOKPLOY_URL>/swagger`, prerrequisito manual de la Etapa 7 del
// plan). Todo lo que sigue en este archivo razona en términos de "¿hubo
// una transición de estado terminal reconocida?", nunca del valor
// concreto que devuelve la API - salvo en este bloque, que es
// deliberadamente el único lugar donde el nombre y los valores del campo
// de estado están hardcodeados. Si el Swagger real contradice esto,
// corregir solo aquí.
//
// Si el nombre de campo es incorrecto, `extractComposeStatus` siempre
// devuelve `undefined`, y por diseño ("estado ausente/desconocido =>
// sigue desplegando, nunca éxito") el script degrada de forma segura:
// nunca reporta éxito falso, pero sí agota el tope de 15 minutos y falla
// con `DOKPLOY_STATUS_TIMEOUT`. Esa falla, si ocurre en la Etapa 7, es la
// señal de que hay que corregir esta constante.
// ---------------------------------------------------------------------------
const DOKPLOY_STATUS_FIELD = 'status'
const DOKPLOY_DONE_STATUSES = new Set(['done'])
const DOKPLOY_ERROR_STATUSES = new Set(['error'])

// Ídem: sin confirmar si `compose.deploy` devuelve un id de despliegue, y
// bajo qué nombre. Se prueban estos candidatos en orden y se reporta
// "desconocido" en el resumen si ninguno aparece - nunca se inventa un id.
const DEPLOYMENT_ID_CANDIDATE_FIELDS = ['deploymentId', 'id']

// Tiempos de sondeo (design.md, Decisión 3 / plan, Etapa 4).
const STATUS_FIRST_PHASE_MS = 60_000
const STATUS_FIRST_INTERVAL_MS = 5_000
const STATUS_SECOND_INTERVAL_MS = 10_000
const STATUS_CAP_MS = 15 * 60_000

const SHA_POLL_INTERVAL_MS = 5_000
const SHA_REQUIRED_CONSECUTIVE_MATCHES = 3
const SHA_CAP_MS = 10 * 60_000

const HTTP_TIMEOUT_MS = 20_000

type JsonRecord = Record<string, unknown>

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Falta la variable de entorno obligatoria ${name}. Variables requeridas: DOKPLOY_URL, DOKPLOY_TOKEN, ` +
        'DOKPLOY_COMPOSE_ID, RUNNER_IMAGE, MIGRATOR_IMAGE, GIT_SHA, PRODUCTION_URL. El token de Dokploy SHALL ' +
        'llegar por variable de entorno, nunca por argumento de proceso.',
    )
  }
  return value
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * `::add-mask::` es un comando de workflow de GitHub Actions: una vez
 * emitido para un valor, Actions lo redacta en cualquier log posterior de
 * esta corrida, incluyendo el texto de errores HTTP que pudieran
 * eco-repetirlo. Por eso enmascarar "apenas se recibe" (antes de tocar el
 * blob) importa, no solo antes de imprimir el blob mismo.
 */
const ENV_LINE_PATTERN = /^[ \t]*(?:export[ \t]+)?([A-Za-z_][A-Za-z0-9_]*)[ \t]*=([^\r\n]*)$/

function maskSecretsInEnvBlob(blob: string): void {
  for (const line of blob.split(/\r\n|\n|\r/)) {
    const match = ENV_LINE_PATTERN.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    if (key === 'RUNNER_IMAGE' || key === 'MIGRATOR_IMAGE') continue
    const value = rawValue.trim()
    if (value.length > 4) {
      console.log(`::add-mask::${value}`)
    }
  }
}

function appendStepSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    appendFileSync(summaryPath, markdown)
  } else {
    // Ejecución local/manual sin runner de Actions: degrade a stdout en
    // vez de perder el resumen.
    console.log(markdown)
  }
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
async function dokployApiCall(params: {
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

async function fetchComposeOne(dokployUrl: string, token: string, composeId: string): Promise<JsonRecord> {
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
function extractEnvBlob(compose: JsonRecord): string {
  const raw = compose.env
  if (raw === null || raw === undefined) return ''
  if (typeof raw !== 'string') {
    throw new Error(`compose.one devolvió un campo "env" con tipo inesperado (${typeof raw}) - no es seguro continuar.`)
  }
  return raw
}

function extractComposeStatus(compose: JsonRecord): string | undefined {
  const value = compose[DOKPLOY_STATUS_FIELD]
  return typeof value === 'string' ? value : undefined
}

function extractDeploymentId(response: JsonRecord | undefined): string | undefined {
  if (!response) return undefined
  for (const field of DEPLOYMENT_ID_CANDIDATE_FIELDS) {
    const value = response[field]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return undefined
}

/**
 * SIN VERIFICAR: si `compose.update` acepta un patch parcial
 * `{composeId, env}` o exige de vuelta el objeto completo que devolvió
 * `compose.one`. Los endpoints `compose.*` de Dokploy siguen el patrón de
 * tRPC (`router.procedure`), donde las mutaciones suelen validar contra
 * un esquema completo y no aceptan patches parciales arbitrarios - por
 * eso el primer intento reenvía el objeto completo leído de `compose.one`
 * con `env` sobrescrito. Si Dokploy lo rechaza (HTTP 4xx, probablemente
 * por un campo de solo lectura que el esquema de entrada no espera), se
 * degrada a un patch mínimo `{composeId, env}`. Si ese también falla, se
 * aborta con un error explícito - nunca se adivina una tercera forma.
 */
async function updateComposeEnv(params: {
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
function assertDeployRequestNeverSendsFreshVolumes(body: JsonRecord): void {
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

type StatusOutcome = { outcome: 'done' | 'error' | 'timeout'; finalStatus: string | undefined }

/**
 * Sondeo cada 5s el primer minuto, luego cada 10s, tope 15 min (design.md
 * Decisión 3 / plan Etapa 4). Exige una TRANSICIÓN respecto al estado
 * previo a `compose.deploy` - un valor terminal que ya estaba ahí de un
 * despliegue anterior nunca cuenta como éxito de esta corrida. Estado
 * ausente o no reconocido como terminal (`DOKPLOY_DONE_STATUSES`/
 * `DOKPLOY_ERROR_STATUSES`) siempre se trata como "sigue desplegando".
 */
async function waitForDokployStatusTransition(params: {
  dokployUrl: string
  token: string
  composeId: string
  previousStatus: string | undefined
}): Promise<StatusOutcome> {
  const start = Date.now()
  while (Date.now() - start < STATUS_CAP_MS) {
    const elapsed = Date.now() - start
    const interval = elapsed < STATUS_FIRST_PHASE_MS ? STATUS_FIRST_INTERVAL_MS : STATUS_SECOND_INTERVAL_MS
    await sleep(interval)

    const compose = await fetchComposeOne(params.dokployUrl, params.token, params.composeId)
    const currentStatus = extractComposeStatus(compose)
    console.log(`compose.one: estado actual = ${currentStatus ?? '(ausente)'} (previo = ${params.previousStatus ?? '(ausente)'})`)

    if (currentStatus !== undefined && currentStatus !== params.previousStatus) {
      if (DOKPLOY_DONE_STATUSES.has(currentStatus)) return { outcome: 'done', finalStatus: currentStatus }
      if (DOKPLOY_ERROR_STATUSES.has(currentStatus)) return { outcome: 'error', finalStatus: currentStatus }
      // Transición a un valor intermedio no reconocido como terminal
      // (p. ej. "running") - seguir esperando el estado terminal real.
    }
  }
  return { outcome: 'timeout', finalStatus: undefined }
}

type HealthProbe = { reachable: boolean; httpStatus?: number; sha: string | null }

async function probeHealth(productionUrl: string): Promise<HealthProbe> {
  try {
    const response = await fetchWithTimeout(`${productionUrl.replace(/\/+$/, '')}/api/health`, { method: 'GET' }, HTTP_TIMEOUT_MS)
    const body = (await response.json().catch(() => null)) as { sha?: unknown } | null
    const sha = body && typeof body.sha === 'string' ? body.sha : null
    return { reachable: true, httpStatus: response.status, sha }
  } catch {
    return { reachable: false, sha: null }
  }
}

type ShaOutcome = { outcome: 'matched' | 'timeout'; lastObservedSha: string | null; everReachable: boolean }

/**
 * Sondeo cada 5s hasta 3 coincidencias CONSECUTIVAS de HTTP 200 + `sha`
 * exacto, tope 10 min tras la señal de estado (design.md Decisión 3). Las
 * 3 lecturas consecutivas existen porque, durante la ventana de reemplazo
 * del container, la release vieja y la nueva pueden contestar
 * alternadamente - una sola lectura en 200 no es evidencia suficiente.
 */
async function waitForLiveShaMatch(params: { productionUrl: string; gitSha: string }): Promise<ShaOutcome> {
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

type FailureClass = 'MIGRATION_FAILED_OLD_SERVING' | 'SITE_UNREACHABLE' | 'NEW_SHA_NEVER_LIVE' | 'ENV_VERIFICATION_MISMATCH'

function buildFailureMessage(failureClass: FailureClass, detail: string): string {
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

async function main(): Promise<void> {
  const dokployUrl = getRequiredEnv('DOKPLOY_URL')
  const dokployToken = getRequiredEnv('DOKPLOY_TOKEN')
  const composeId = getRequiredEnv('DOKPLOY_COMPOSE_ID')
  const runnerImage = getRequiredEnv('RUNNER_IMAGE')
  const migratorImage = getRequiredEnv('MIGRATOR_IMAGE')
  const gitSha = getRequiredEnv('GIT_SHA')
  const productionUrl = getRequiredEnv('PRODUCTION_URL')

  const commonSummaryLines = [
    `- **Git SHA**: \`${gitSha}\``,
    `- **runner image**: \`${runnerImage}\``,
    `- **migrator image**: \`${migratorImage}\``,
  ]

  // SHA vivo antes de tocar nada - tolera falla (primer despliegue nunca
  // tuvo una release previa que responder). Se usa solo para el resumen
  // y para clasificar fallas, nunca para decidir si desplegar.
  const shaBeforeProbe = await probeHealth(productionUrl)
  const shaBeforeAttempt = shaBeforeProbe.reachable ? shaBeforeProbe.sha ?? '(sin campo sha)' : '(sitio inalcanzable)'
  commonSummaryLines.push(`- **SHA vivo antes del intento**: \`${shaBeforeAttempt}\``)

  console.log('Leyendo configuración actual del Compose vía compose.one...')
  const composeBefore = await fetchComposeOne(dokployUrl, dokployToken, composeId)
  const blobBefore = extractEnvBlob(composeBefore)
  maskSecretsInEnvBlob(blobBefore)
  console.log(`env blob sha256 (antes): ${sha256(blobBefore)}`)

  const previousStatus = extractComposeStatus(composeBefore)
  console.log(`Estado de Dokploy antes de desplegar: ${previousStatus ?? '(ausente)'}`)

  const { blob: newBlob, changes } = rewriteDokployEnvBlob({ blob: blobBefore, runnerImage, migratorImage })
  console.log(`env blob sha256 (nuevo, a escribir): ${sha256(newBlob)}`)
  for (const change of changes) {
    console.log(`  - ${change.key}: ${change.action} (${change.occurrences} ocurrencia(s) reescritas)`)
  }

  console.log('Escribiendo el nuevo env vía compose.update...')
  await updateComposeEnv({ dokployUrl, token: dokployToken, composeId, currentCompose: composeBefore, newEnvBlob: newBlob })

  console.log('Re-leyendo compose.one para verificar byte a byte antes de desplegar...')
  const composeAfterUpdate = await fetchComposeOne(dokployUrl, dokployToken, composeId)
  const blobAfterUpdate = extractEnvBlob(composeAfterUpdate)
  maskSecretsInEnvBlob(blobAfterUpdate)
  console.log(`env blob sha256 (releído tras compose.update): ${sha256(blobAfterUpdate)}`)

  if (blobAfterUpdate !== newBlob) {
    const detail = `sha256 esperado=${sha256(newBlob)}, sha256 releído=${sha256(blobAfterUpdate)}.`
    appendStepSummary(
      [
        '## Despliegue a Dokploy - FALLÓ (verificación de env)',
        '',
        `- **Clase de falla**: \`ENV_VERIFICATION_MISMATCH\``,
        ...commonSummaryLines,
        '- **deploymentId**: n/a (nunca se llamó a compose.deploy)',
        `- **Logs de Dokploy**: ${dokployUrl} (servicio Compose \`${composeId}\` - no se confirmó la ruta exacta del dashboard, ver design.md Open Questions)`,
        '- **Rollback**: no aplica - no se desplegó nada. El env de Dokploy puede haber quedado en un estado inesperado; revisar manualmente antes de reintentar.',
        '',
        buildFailureMessage('ENV_VERIFICATION_MISMATCH', detail),
        '',
      ].join('\n'),
    )
    console.error(buildFailureMessage('ENV_VERIFICATION_MISMATCH', detail))
    process.exit(1)
    return
  }

  console.log('Verificación byte a byte OK. Disparando compose.deploy...')
  const deployRequestBody: JsonRecord = {
    composeId,
    title: `Deploy ${gitSha}`,
    description: `Despliegue automatizado desde release.yml - runner=${runnerImage} migrator=${migratorImage}`,
  }
  assertDeployRequestNeverSendsFreshVolumes(deployRequestBody)
  const deployResponse = await dokployApiCall({
    dokployUrl,
    token: dokployToken,
    procedure: 'compose.deploy',
    method: 'POST',
    body: deployRequestBody,
  })
  const deploymentId = extractDeploymentId(deployResponse)
  console.log(`compose.deploy disparado. deploymentId=${deploymentId ?? '(desconocido - ver Open Questions de design.md)'}`)

  console.log('Esperando la señal 1 (transición de estado en Dokploy)...')
  const statusOutcome = await waitForDokployStatusTransition({ dokployUrl, token: dokployToken, composeId, previousStatus })

  const dokployLogsLine = `- **Logs de Dokploy**: ${dokployUrl} (servicio Compose \`${composeId}\` - no se confirmó la ruta exacta del dashboard, ver design.md Open Questions)`
  const rollbackLine = `- **Rollback**: NO se intentó ningún rollback/restart/stop automático. Para revertir manualmente: ejecutar el workflow \`rollback.yml\` (workflow_dispatch) con \`sha=<SHA anterior conocido>\` y \`reason\` describiendo esta falla.`

  function writeFailureSummary(failureClass: FailureClass, detail: string): void {
    const message = buildFailureMessage(failureClass, detail)
    appendStepSummary(
      [
        '## Despliegue a Dokploy - FALLÓ',
        '',
        `- **Clase de falla**: \`${failureClass}\``,
        ...commonSummaryLines,
        `- **deploymentId**: \`${deploymentId ?? 'desconocido'}\``,
        dokployLogsLine,
        rollbackLine,
        '',
        message,
        '',
      ].join('\n'),
    )
    console.error(message)
  }

  if (statusOutcome.outcome !== 'done') {
    // Estado de error o tope de 15 min sin transición: en ambos casos se
    // usa /api/health para distinguir "la anterior sigue sirviendo" de
    // "sitio caído" - la clasificación de falla que exige el diseño.
    const healthProbe = await probeHealth(productionUrl)
    const dokployDetail =
      statusOutcome.outcome === 'error'
        ? `Dokploy reportó el estado terminal "${statusOutcome.finalStatus}"`
        : 'Dokploy nunca confirmó una transición de estado dentro del tope de 15 minutos'

    if (!healthProbe.reachable) {
      writeFailureSummary('SITE_UNREACHABLE', dokployDetail)
    } else {
      writeFailureSummary('MIGRATION_FAILED_OLD_SERVING', dokployDetail)
    }
    process.exit(1)
    return
  }

  console.log(`Dokploy confirmó el estado terminal "${statusOutcome.finalStatus}". Esperando la señal 2 (SHA vivo)...`)
  const shaOutcome = await waitForLiveShaMatch({ productionUrl, gitSha })

  if (shaOutcome.outcome !== 'matched') {
    if (!shaOutcome.everReachable) {
      writeFailureSummary('SITE_UNREACHABLE', 'Dokploy reportó el despliegue como completado')
    } else {
      writeFailureSummary('NEW_SHA_NEVER_LIVE', `Dokploy reportó el despliegue como completado (último SHA observado: ${shaOutcome.lastObservedSha ?? '(ausente)'})`)
    }
    process.exit(1)
    return
  }

  appendStepSummary(
    [
      '## Despliegue a Dokploy - éxito',
      '',
      ...commonSummaryLines,
      `- **deploymentId**: \`${deploymentId ?? 'desconocido'}\``,
      `- **SHA desplegado y verificado vivo**: \`${gitSha}\` (3 lecturas consecutivas de /api/health)`,
      dokployLogsLine,
      '',
    ].join('\n'),
  )
  console.log(`Despliegue verificado: ${gitSha} está vivo en ${productionUrl}.`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`dokploy-deploy.ts falló: ${message}`)
  appendStepSummary(
    [
      '## Despliegue a Dokploy - FALLÓ (error inesperado)',
      '',
      `- **Error**: ${message}`,
      '- **Rollback**: NO se intentó ningún rollback/restart/stop automático ante este error inesperado.',
      '',
    ].join('\n'),
  )
  process.exit(1)
})
