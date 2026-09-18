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
 * stack (ver `assertDeployRequestNeverSendsFreshVolumes`).
 *
 * Convención de ejecución: `node scripts/dokploy-deploy.ts`, igual que
 * `scripts/run-migration-chain.ts` - sin paso de build, sin dependencias
 * nuevas (solo módulos nativos de Node + los dos módulos de
 * `src/lib/deploy/`, que tampoco tienen dependencias externas).
 *
 * La lógica real (llamadas al API, sondeos, clasificación de fallas)
 * vive en `src/lib/deploy/dokploy-client.ts`, no aquí - ese módulo es lo
 * que `dokploy-client.test.ts` prueba con `fetch` simulado; este archivo
 * es solo el punto de entrada que lee env vars y orquesta el flujo.
 */
import { appendFileSync } from 'node:fs'

import {
  assertDeployRequestNeverSendsFreshVolumes,
  buildFailureMessage,
  classifyShaPhaseFailure,
  classifyStatusPhaseFailure,
  dokployApiCall,
  extractComposeStatus,
  extractDeploymentId,
  extractEnvBlob,
  fetchComposeOne,
  findSecretsToMaskInEnvBlob,
  probeHealth,
  sha256,
  updateComposeEnv,
  waitForDokployStatusTransition,
  waitForLiveShaMatch,
  type FailureClass,
  type JsonRecord,
} from '../src/lib/deploy/dokploy-client.ts'
import { rewriteDokployEnvBlob } from '../src/lib/deploy/dokploy-env.ts'

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

function maskSecretsInEnvBlob(blob: string): void {
  for (const value of findSecretsToMaskInEnvBlob(blob)) {
    console.log(`::add-mask::${value}`)
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
    // Estado de error o tope de 15 min sin transición: `classifyStatusPhaseFailure`
    // usa /api/health para distinguir "la anterior sigue sirviendo" de
    // "sitio caído" - la clasificación de falla que exige el diseño.
    const healthProbe = await probeHealth(productionUrl)
    const { failureClass, detail } = classifyStatusPhaseFailure({ statusOutcome, healthProbeReachable: healthProbe.reachable })
    writeFailureSummary(failureClass, detail)
    process.exit(1)
    return
  }

  console.log(`Dokploy confirmó el estado terminal "${statusOutcome.finalStatus}". Esperando la señal 2 (SHA vivo)...`)
  const shaOutcome = await waitForLiveShaMatch({ productionUrl, gitSha })

  if (shaOutcome.outcome !== 'matched') {
    const { failureClass, detail } = classifyShaPhaseFailure({ shaOutcome })
    writeFailureSummary(failureClass, detail)
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
