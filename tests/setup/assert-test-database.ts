/**
 * Guard obligatorio antes de cualquier operación destructiva (reset/drop/
 * truncate) contra una base de datos usada por la suite de pruebas.
 *
 * Exige AMBAS condiciones para reducir el riesgo de un error de
 * configuración silencioso (ver openspec/changes/testing-qa-performance/
 * design.md, Decisión 3 y el riesgo de colisión de proyectos de Docker
 * Compose documentado ahí mismo):
 *   1. El nombre de la base de datos termina en el sufijo de prueba.
 *   2. El host y el puerto coinciden con uno de los servicios Postgres de
 *      prueba reconocidos explícitamente (nunca un host/puerto genérico
 *      aceptado por defecto).
 *
 * Dos pares host/puerto reconocidos, cada uno atado a un compose file
 * concreto: `compose.test.yml` (`localhost:5433`, invocado desde el host
 * para `test:migrations`/`test:integration`/`test:e2e:server`) y
 * `compose.prod.yaml --profile self-hosted` (`db:5432`, el nombre de
 * servicio dentro de la red de Compose, usado únicamente por
 * `scripts/docker-smoke.sh` contra su Postgres desechable) - ver
 * openspec/changes/runtime-public-rendering, sección Docker.
 */

const TEST_DB_NAME_SUFFIX = '_test'
const RECOGNIZED_TEST_DB_HOSTS: ReadonlyArray<{ host: string; port: string }> = [
  { host: 'localhost', port: '5433' },
  { host: 'db', port: '5432' },
]

export class UnsafeTestDatabaseError extends Error {
  constructor(uri: string, reason: string) {
    const expected = RECOGNIZED_TEST_DB_HOSTS.map(({ host, port }) => `${host}:${port}`).join(' o ')
    super(
      `Operación destructiva de pruebas rechazada para "${redact(uri)}": ${reason}. ` +
        `Se esperaba una base de datos con nombre terminado en "${TEST_DB_NAME_SUFFIX}" ` +
        `en ${expected} (ver compose.test.yml / compose.prod.yaml --profile self-hosted).`,
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
  const isRecognizedHost = RECOGNIZED_TEST_DB_HOSTS.some((candidate) => candidate.host === host && candidate.port === port)
  if (!isRecognizedHost) {
    const expected = RECOGNIZED_TEST_DB_HOSTS.map(({ host, port }) => `${host}:${port}`).join(' o ')
    throw new UnsafeTestDatabaseError(
      uri,
      `el host/puerto "${host}:${port}" no coincide con ningún servicio de pruebas reconocido ` + `(${expected})`,
    )
  }
}
