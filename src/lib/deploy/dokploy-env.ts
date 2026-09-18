/**
 * openspec/changes/production-deployment-dokploy: reescritura del blob de
 * entorno que Dokploy guarda para el Compose service (`RUNNER_IMAGE`/
 * `MIGRATOR_IMAGE`). Es la pieza más delicada del cambio - un error aquí
 * corrompe la configuración de producción o, peor, hace posible desplegar
 * el alias mutable `-main` en vez del tag inmutable por SHA. Por eso:
 *
 * - Función pura, sin I/O: quien la llama (`scripts/dokploy-deploy.ts`) es
 *   responsable de leer el blob real vía `compose.one`, escribirlo vía
 *   `compose.update`, y **re-leer y verificar byte a byte** que quedó
 *   igual a lo que se intentó escribir antes de disparar `compose.deploy`.
 * - Nunca se hace `split('\n')`/`join('\n')`: eso normalizaría/perdería
 *   `\r\n` y arriesgaría alterar bytes de líneas que no le corresponden
 *   tocar a este cambio. Todo reemplazo es una regex anclada por línea con
 *   `[^\r\n]*` (nunca `.*`), para que un CRLF sobreviva intacto.
 * - El valor nuevo se valida contra la forma exacta de un tag inmutable
 *   por SHA (`<registry>/<repo>:(runner|migrator)-<sha40>`) antes de
 *   escribir nada. Este es el control de seguridad que hace
 *   estructuralmente imposible desplegar `runner-main`/`migrator-main`.
 */

export type DokployImageKey = 'RUNNER_IMAGE' | 'MIGRATOR_IMAGE'

type ImageKind = 'runner' | 'migrator'

const KEY_BY_KIND: Record<ImageKind, DokployImageKey> = {
  runner: 'RUNNER_IMAGE',
  migrator: 'MIGRATOR_IMAGE',
}

/**
 * Forma exacta de un tag inmutable por SHA. `[a-z0-9.\-_/]+` cubre
 * `registry.example.com/org/repo` (host + namespace + repo, todo en
 * minúsculas, como emite GHCR); `[0-9a-f]{40}` es un SHA de Git completo,
 * nunca su forma corta ni `main`.
 */
const IMAGE_REFERENCE_PATTERN = /^[a-z0-9.\-_/]+:(runner|migrator)-[0-9a-f]{40}$/

/**
 * Forma *genérica* de "algo que parece una referencia de imagen"
 * (`repo:tag`), deliberadamente más laxa que `IMAGE_REFERENCE_PATTERN`.
 * Se usa solo para decidir si vale la pena reescribir el valor *actual*
 * que ya está en el blob - si no tiene ni esta forma mínima, es más
 * probable que el ancla haya coincidido con la continuación de un valor
 * multilínea que con la línea real de `RUNNER_IMAGE`/`MIGRATOR_IMAGE`, y
 * abortar es más seguro que sobrescribir a ciegas.
 */
const IMAGE_LIKE_PATTERN = /^[A-Za-z0-9.\-_/]+:[A-Za-z0-9.\-_]+$/

export type EnvKeyChange = {
  key: DokployImageKey
  /** `null` cuando la clave no existía en el blob (primer despliegue). */
  previousValue: string | null
  newValue: string
  /** Número de líneas que coincidieron con el ancla y se reescribieron. 0 cuando se agregó al final. */
  occurrences: number
  action: 'replaced' | 'appended'
}

export type RewriteDokployEnvBlobArgs = {
  /** Blob tal como lo devuelve `compose.one` - newline-delimited `KEY=VALUE`, potencialmente con CRLF. */
  blob: string
  /** Tag inmutable nuevo para `RUNNER_IMAGE`. */
  runnerImage: string
  /** Tag inmutable nuevo para `MIGRATOR_IMAGE`. */
  migratorImage: string
}

export type RewriteDokployEnvBlobResult = {
  blob: string
  changes: EnvKeyChange[]
}

function assertValidImageReference(value: string, kind: ImageKind): void {
  const match = IMAGE_REFERENCE_PATTERN.exec(value)
  if (!match || match[1] !== kind) {
    throw new Error(
      `Referencia de imagen inválida para ${KEY_BY_KIND[kind]}: "${value}". ` +
        `Se esperaba "<registry>/<repo>:${kind}-<sha-de-40-hex>" (nunca el alias mutable "-main").`,
    )
  }
}

/**
 * Ancla por línea: inicio de línea, indentación opcional, `export`
 * opcional (dotenv lo tolera), la clave exacta, espacios opcionales antes
 * del `=`, el propio `=`. El valor capturado (grupo 2) es todo lo que
 * sigue hasta el fin de línea, sin cruzar `\r`/`\n` - así un CRLF nunca se
 * toca. `gm` para recorrer todas las líneas del blob completo.
 */
function buildKeyPattern(key: DokployImageKey): RegExp {
  return new RegExp(`^([ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=)([^\\r\\n]*)$`, 'gm')
}

function replaceOrAppendKey(blob: string, key: DokployImageKey, newValue: string): { blob: string; change: EnvKeyChange } {
  const pattern = buildKeyPattern(key)
  let occurrences = 0
  let previousValue: string | null = null

  const rewritten = blob.replace(pattern, (_match, prefix: string, currentValue: string) => {
    // Un valor vacío (`RUNNER_IMAGE=`) es el estado natural del primer
    // setup: el operador declara la variable en Dokploy antes de que
    // exista ningún SHA que poner ahí. Se trata como "sin asignar" y se
    // reescribe. Solo se aborta ante un valor no vacío que además no
    // parece una referencia de imagen, que es la señal de que el ancla
    // coincidió con la continuación de un valor multilínea entre comillas.
    if (currentValue.trim() !== '' && !IMAGE_LIKE_PATTERN.test(currentValue)) {
      throw new Error(
        `No se reescribe ${key}: el valor actual "${currentValue}" no tiene forma de referencia de imagen ` +
          `("repo:tag"). Podría ser la continuación de un valor multilínea entre comillas en vez de la línea ` +
          `real de ${key} - abortar es más seguro que sobrescribir a ciegas.`,
      )
    }
    occurrences += 1
    previousValue = currentValue
    return `${prefix}${newValue}`
  })

  if (occurrences === 0) {
    // Primer despliegue: la clave no existe todavía en el blob. Se agrega
    // al final, con un salto de línea inicial solo si el blob no termina
    // ya en uno - nunca se toca ningún byte existente.
    const needsLeadingNewline = blob.length > 0 && !blob.endsWith('\n')
    const appended = `${needsLeadingNewline ? '\n' : ''}${key}=${newValue}`
    return {
      blob: blob + appended,
      change: { key, previousValue: null, newValue, occurrences: 0, action: 'appended' },
    }
  }

  return {
    blob: rewritten,
    change: { key, previousValue, newValue, occurrences, action: 'replaced' },
  }
}

/**
 * Reescribe `RUNNER_IMAGE`/`MIGRATOR_IMAGE` dentro del blob de entorno de
 * Dokploy, preservando cada byte que no le corresponde tocar a este
 * cambio. Lanza si `runnerImage`/`migratorImage` no tienen la forma exacta
 * de un tag inmutable por SHA, o si el valor actual de alguna clave ya
 * presente no parece una referencia de imagen (ver `replaceOrAppendKey`).
 */
export function rewriteDokployEnvBlob({ blob, runnerImage, migratorImage }: RewriteDokployEnvBlobArgs): RewriteDokployEnvBlobResult {
  assertValidImageReference(runnerImage, 'runner')
  assertValidImageReference(migratorImage, 'migrator')

  const afterRunner = replaceOrAppendKey(blob, 'RUNNER_IMAGE', runnerImage)
  const afterMigrator = replaceOrAppendKey(afterRunner.blob, 'MIGRATOR_IMAGE', migratorImage)

  return {
    blob: afterMigrator.blob,
    changes: [afterRunner.change, afterMigrator.change],
  }
}
