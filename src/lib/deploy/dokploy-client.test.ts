import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  assertDeployRequestNeverSendsFreshVolumes,
  buildFailureMessage,
  classifyShaPhaseFailure,
  classifyStatusPhaseFailure,
  extractComposeStatus,
  extractDeploymentId,
  extractEnvBlob,
  findSecretsToMaskInEnvBlob,
  waitForDokployStatusTransition,
  waitForLiveShaMatch,
} from './dokploy-client'

/**
 * Los dos sondeos (`waitForDokployStatusTransition`/`waitForLiveShaMatch`)
 * duermen segundos reales entre intentos - se usan los timers falsos de
 * vitest para que estas pruebas corran en milisegundos, avanzando el
 * reloj manualmente en vez de esperar de verdad.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('findSecretsToMaskInEnvBlob', () => {
  it('encuentra los valores a enmascarar, salvo las dos claves de imagen', () => {
    const blob = ['DATABASE_URI=postgres://user:pass@db:5432/app', 'RUNNER_IMAGE=ghcr.io/x/y:runner-abc', 'PAYLOAD_SECRET=shhhhh', 'PORT=3000', ''].join('\n')

    const secrets = findSecretsToMaskInEnvBlob(blob)

    expect(secrets).toContain('postgres://user:pass@db:5432/app')
    expect(secrets).toContain('shhhhh')
    expect(secrets).not.toContain('ghcr.io/x/y:runner-abc')
    // "3000" tiene 4 caracteres exactos - el umbral es "más de 4", así que no se enmascara.
    expect(secrets).not.toContain('3000')
  })

  it('ignora líneas que no tienen forma de asignación', () => {
    const blob = ['# comentario largo que no es una asignación', 'DATABASE_URI=postgres://x', ''].join('\n')

    // El comentario no matchea el patrón de línea (empieza con "#", no con una clave válida).
    expect(findSecretsToMaskInEnvBlob(blob)).toEqual(['postgres://x'])
  })
})

describe('extractComposeStatus / extractEnvBlob / extractDeploymentId', () => {
  it('extractEnvBlob devuelve el string, string vacío si env es null/undefined, y lanza si no es string', () => {
    expect(extractEnvBlob({ env: 'A=1' })).toBe('A=1')
    expect(extractEnvBlob({ env: null })).toBe('')
    expect(extractEnvBlob({})).toBe('')
    expect(() => extractEnvBlob({ env: 42 })).toThrow(/tipo inesperado/)
  })

  it('extractComposeStatus devuelve undefined si el campo no es string', () => {
    expect(extractComposeStatus({ composeStatus: 'done' })).toBe('done')
    expect(extractComposeStatus({ composeStatus: 7 })).toBeUndefined()
    expect(extractComposeStatus({})).toBeUndefined()
  })

  it('extractComposeStatus ignora `status` - ese nombre solo existe dentro de `deployments[]`, nunca top-level', () => {
    expect(extractComposeStatus({ status: 'done' })).toBeUndefined()
  })

  it('extractDeploymentId prueba los candidatos en orden y devuelve undefined si ninguno aparece', () => {
    expect(extractDeploymentId({ deploymentId: 'abc' })).toBe('abc')
    expect(extractDeploymentId({ id: 'xyz' })).toBe('xyz')
    expect(extractDeploymentId({ deploymentId: 'abc', id: 'xyz' })).toBe('abc')
    expect(extractDeploymentId({})).toBeUndefined()
    expect(extractDeploymentId(undefined)).toBeUndefined()
  })
})

describe('assertDeployRequestNeverSendsFreshVolumes', () => {
  it('no lanza cuando el cuerpo no incluye freshVolumes', () => {
    expect(() => assertDeployRequestNeverSendsFreshVolumes({ composeId: 'x' })).not.toThrow()
  })

  it('lanza si el cuerpo incluye freshVolumes, sin importar su valor', () => {
    expect(() => assertDeployRequestNeverSendsFreshVolumes({ composeId: 'x', freshVolumes: false })).toThrow(/freshVolumes/)
    expect(() => assertDeployRequestNeverSendsFreshVolumes({ composeId: 'x', freshVolumes: true })).toThrow(/NUNCA SHALL enviarse/)
  })
})

describe('buildFailureMessage', () => {
  it('produce un mensaje distinto y con contenido reconocible por cada clase de falla', () => {
    // Los mensajes son strings de una sola línea (sin salto de línea), así
    // que `.` ya cruza todo el texto sin necesitar la flag `s` (dotAll) -
    // esa flag exige un `target` de TypeScript más reciente que el de este
    // proyecto.
    expect(buildFailureMessage('ENV_VERIFICATION_MISMATCH', 'detalle-1')).toMatch(/verificación byte a byte.*detalle-1.*no se desplegó nada/i)
    expect(buildFailureMessage('MIGRATION_FAILED_OLD_SERVING', 'detalle-2')).toMatch(/migración falló.*detalle-2.*sigue sirviendo tráfico/i)
    expect(buildFailureMessage('SITE_UNREACHABLE', 'detalle-3')).toMatch(/sitio quedó inalcanzable.*detalle-3/i)
    expect(buildFailureMessage('NEW_SHA_NEVER_LIVE', 'detalle-4')).toMatch(/nunca quedó viva.*detalle-4/i)
  })
})

describe('classifyStatusPhaseFailure / classifyShaPhaseFailure - una rama por clase de falla', () => {
  it('señal 1: Dokploy reportó error pero el sitio sigue respondiendo => MIGRATION_FAILED_OLD_SERVING', () => {
    const result = classifyStatusPhaseFailure({ statusOutcome: { outcome: 'error', finalStatus: 'error' }, healthProbeReachable: true })
    expect(result.failureClass).toBe('MIGRATION_FAILED_OLD_SERVING')
    expect(result.detail).toMatch(/estado terminal "error"/)
  })

  it('señal 1: Dokploy reportó error y el sitio está inalcanzable => SITE_UNREACHABLE', () => {
    const result = classifyStatusPhaseFailure({ statusOutcome: { outcome: 'error', finalStatus: 'error' }, healthProbeReachable: false })
    expect(result.failureClass).toBe('SITE_UNREACHABLE')
  })

  it('señal 1: tope de 15 min sin transición (sitio alcanzable) => MIGRATION_FAILED_OLD_SERVING, con el detalle correcto', () => {
    const result = classifyStatusPhaseFailure({ statusOutcome: { outcome: 'timeout', finalStatus: undefined }, healthProbeReachable: true })
    expect(result.failureClass).toBe('MIGRATION_FAILED_OLD_SERVING')
    expect(result.detail).toMatch(/nunca confirmó una transición/)
  })

  it('señal 2: Dokploy completó pero el sitio nunca respondió => SITE_UNREACHABLE', () => {
    const result = classifyShaPhaseFailure({ shaOutcome: { outcome: 'timeout', lastObservedSha: null, everReachable: false } })
    expect(result.failureClass).toBe('SITE_UNREACHABLE')
  })

  it('señal 2: Dokploy completó, el sitio respondió, pero el SHA nuevo nunca quedó vivo => NEW_SHA_NEVER_LIVE', () => {
    const oldSha = 'b'.repeat(40)
    const result = classifyShaPhaseFailure({ shaOutcome: { outcome: 'timeout', lastObservedSha: oldSha, everReachable: true } })
    expect(result.failureClass).toBe('NEW_SHA_NEVER_LIVE')
    expect(result.detail).toContain(oldSha)
  })
})

describe('waitForDokployStatusTransition', () => {
  const params = { dokployUrl: 'https://dokploy.example', token: 't', composeId: 'c1' }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('un estado "done" repetido sin transición respecto al previo nunca se reporta como éxito', async () => {
    // El estado ya estaba en "done" ANTES de compose.deploy - la primera
    // lectura post-deploy sigue viendo "done" (sin transición real), y
    // solo hasta que aparece un valor NUEVO se cuenta como señal.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ composeStatus: 'done' })) // sin transición - stale
      .mockResolvedValueOnce(jsonResponse({ composeStatus: 'running' })) // transición a intermedio - sigue esperando
      .mockResolvedValueOnce(jsonResponse({ composeStatus: 'done' })) // transición real a terminal
    vi.stubGlobal('fetch', fetchMock)

    const promise = waitForDokployStatusTransition({ ...params, previousStatus: 'done' })
    await vi.advanceTimersByTimeAsync(5_000)
    await vi.advanceTimersByTimeAsync(5_000)
    await vi.advanceTimersByTimeAsync(5_000)
    const result = await promise

    expect(result).toEqual({ outcome: 'done', finalStatus: 'done' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('reporta "error" en la primera transición a un estado de error', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ composeStatus: 'error' }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = waitForDokployStatusTransition({ ...params, previousStatus: 'running' })
    await vi.advanceTimersByTimeAsync(5_000)

    expect(await promise).toEqual({ outcome: 'error', finalStatus: 'error' })
  })

  it('un estado ausente o desconocido nunca cuenta como éxito - agota el tope y reporta timeout', async () => {
    // `mockImplementation` (no `mockResolvedValue`) para que cada llamada
    // reciba un `Response` fresco - el cuerpo de un `Response` solo puede
    // leerse una vez, y el sondeo real hace decenas de llamadas.
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    const promise = waitForDokployStatusTransition({ ...params, previousStatus: undefined })
    // Tope: 15 minutos. Primeros 60s a intervalos de 5s (12), resto a intervalos de 10s.
    await vi.advanceTimersByTimeAsync(15 * 60_000 + 1_000)

    expect(await promise).toEqual({ outcome: 'timeout', finalStatus: undefined })
  })
})

describe('waitForLiveShaMatch', () => {
  const params = { productionUrl: 'https://prod.example', gitSha: 'a'.repeat(40) }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('exige 3 coincidencias CONSECUTIVAS antes de reportar éxito - una alternancia con el SHA viejo reinicia el conteo', async () => {
    const oldSha = 'b'.repeat(40)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ sha: params.gitSha })) // 1/3
      .mockResolvedValueOnce(jsonResponse({ sha: params.gitSha })) // 2/3
      .mockResolvedValueOnce(jsonResponse({ sha: oldSha })) // la vieja contesta - reinicia el conteo
      .mockResolvedValueOnce(jsonResponse({ sha: params.gitSha })) // 1/3
      .mockResolvedValueOnce(jsonResponse({ sha: params.gitSha })) // 2/3
      .mockResolvedValueOnce(jsonResponse({ sha: params.gitSha })) // 3/3 - éxito
    vi.stubGlobal('fetch', fetchMock)

    const promise = waitForLiveShaMatch(params)
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(5_000)
    }
    const result = await promise

    expect(result).toEqual({ outcome: 'matched', lastObservedSha: params.gitSha, everReachable: true })
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('un sitio siempre inalcanzable agota el tope y reporta timeout con everReachable=false', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)

    const promise = waitForLiveShaMatch(params)
    await vi.advanceTimersByTimeAsync(10 * 60_000 + 1_000)

    const result = await promise
    expect(result.outcome).toBe('timeout')
    expect(result.everReachable).toBe(false)
  })
})
