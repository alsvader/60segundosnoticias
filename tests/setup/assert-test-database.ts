/**
 * Guard obligatorio antes de cualquier operación destructiva (reset/drop/
 * truncate) contra una base de datos usada por la suite de pruebas.
 *
 * Exige AMBAS condiciones para reducir el riesgo de un error de
 * configuración silencioso (ver openspec/changes/testing-qa-performance/
 * design.md, Decisión 3 y el riesgo de colisión de proyectos de Docker
 * Compose documentado ahí mismo):
 *   1. El nombre de la base de datos termina en el sufijo de prueba.
 *   2. El host y el puerto coinciden con el servicio Postgres de pruebas
 *      declarado (compose.test.yml, puerto 5433).
 */

const TEST_DB_NAME_SUFFIX = '_test'
const TEST_DB_HOST = 'localhost'
const TEST_DB_PORT = '5433'

export class UnsafeTestDatabaseError extends Error {
  constructor(uri: string, reason: string) {
    super(
      `Operación destructiva de pruebas rechazada para "${redact(uri)}": ${reason}. ` +
        `Se esperaba una base de datos con nombre terminado en "${TEST_DB_NAME_SUFFIX}" ` +
        `en ${TEST_DB_HOST}:${TEST_DB_PORT} (ver compose.test.yml).`,
    )
    this.name = 'UnsafeTestDatabaseError'
  }
}

function redact(uri: string): string {
  try {
    const parsed = new URL(uri)
    parsed.password = parsed.password ? '***' : ''
    return parsed.toString()
  } catch {
    return '<uri inválida>'
  }
}

/**
 * Lanza `UnsafeTestDatabaseError` si `uri` no es inequívocamente una base
 * de datos de pruebas. No hace red ni valida que la base exista - solo
 * valida la forma del URI.
 */
export function assertTestDatabase(uri: string | undefined): asserts uri is string {
  if (!uri) {
    throw new UnsafeTestDatabaseError('', 'DATABASE_URI no está definido')
  }

  let parsed: URL
  try {
    parsed = new URL(uri)
  } catch {
    throw new UnsafeTestDatabaseError(uri, 'DATABASE_URI no es un URI válido')
  }

  const dbName = parsed.pathname.replace(/^\//, '')
  if (!dbName.endsWith(TEST_DB_NAME_SUFFIX)) {
    throw new UnsafeTestDatabaseError(
      uri,
      `el nombre de base de datos "${dbName}" no termina en "${TEST_DB_NAME_SUFFIX}"`,
    )
  }

  const host = parsed.hostname
  const port = parsed.port || '5432'
  if (host !== TEST_DB_HOST || port !== TEST_DB_PORT) {
    throw new UnsafeTestDatabaseError(
      uri,
      `el host/puerto "${host}:${port}" no coincide con el servicio de pruebas ` +
        `"${TEST_DB_HOST}:${TEST_DB_PORT}"`,
    )
  }
}
