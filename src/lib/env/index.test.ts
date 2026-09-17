import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `src/lib/env/index.ts` valida `process.env` como efecto secundario en
 * tiempo de import (`export const env = loadEnv()`) - cada escenario debe
 * fijar `process.env` y re-importar el módulo con `vi.resetModules()` para
 * observar una evaluación fresca, en vez de reutilizar el módulo ya cacheado
 * por otro test o por `tests/setup/env.ts`.
 */

const BASE_ENV = {
  DATABASE_URI: 'postgres://postgres:postgres@localhost:5433/60segundos_test',
  PAYLOAD_SECRET: 'test-only-payload-secret',
  NEXT_PUBLIC_SITE_URL: 'https://example.test',
}

const FULL_S3_ENV = {
  S3_ENDPOINT: 'https://s3.example.test',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'bucket',
  S3_ACCESS_KEY_ID: 'key',
  S3_SECRET_ACCESS_KEY: 'secret',
  S3_PUBLIC_URL: 'https://media.example.test',
}

const ENV_KEYS = [
  'NODE_ENV',
  'NEXT_PHASE',
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'PREVIEW_SECRET',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
] as const

// `NODE_ENV` es de solo lectura en el tipo `NodeJS.ProcessEnv` reciente -
// este cast es el único punto donde este archivo lo trata como mutable,
// deliberadamente, para poder simular cada combinación de entorno.
const mutableEnv = process.env as unknown as Record<string, string | undefined>

let savedEnv: Record<string, string | undefined>

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, mutableEnv[key]]))
  for (const key of ENV_KEYS) delete mutableEnv[key]
  vi.resetModules()
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete mutableEnv[key]
    else mutableEnv[key] = savedEnv[key]
  }
  vi.resetModules()
})

async function importEnv() {
  return import('./index')
}

describe('envSchema en producción', () => {
  it('lanza si falta PREVIEW_SECRET', async () => {
    Object.assign(mutableEnv, BASE_ENV, FULL_S3_ENV, { NODE_ENV: 'production' })
    await expect(importEnv()).rejects.toThrow(/PREVIEW_SECRET/)
  })

  it('lanza si falta una variable S3 requerida (S3_BUCKET)', async () => {
    const { S3_BUCKET: _omit, ...s3WithoutBucket } = FULL_S3_ENV
    Object.assign(mutableEnv, BASE_ENV, s3WithoutBucket, {
      NODE_ENV: 'production',
      PREVIEW_SECRET: 'preview-secret',
    })
    await expect(importEnv()).rejects.toThrow(/S3_BUCKET/)
  })

  it('no lanza en producción cuando todas las variables requeridas están presentes', async () => {
    Object.assign(mutableEnv, BASE_ENV, FULL_S3_ENV, {
      NODE_ENV: 'production',
      PREVIEW_SECRET: 'preview-secret',
    })
    const { env } = await importEnv()
    expect(env.DATABASE_URI).toBe(BASE_ENV.DATABASE_URI)
  })

  it('no exige las variables de solo-runtime durante el build de producción (NEXT_PHASE)', async () => {
    Object.assign(mutableEnv, BASE_ENV, {
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
    })
    const { env } = await importEnv()
    expect(env.PREVIEW_SECRET).toBeUndefined()
  })
})

describe('envSchema fuera de producción', () => {
  it('no lanza en desarrollo sin PREVIEW_SECRET ni variables S3', async () => {
    Object.assign(mutableEnv, BASE_ENV, { NODE_ENV: 'development' })
    const { env } = await importEnv()
    expect(env.PREVIEW_SECRET).toBeUndefined()
    expect(env.S3_BUCKET).toBeUndefined()
  })

  it('no lanza en test sin PREVIEW_SECRET ni variables S3', async () => {
    Object.assign(mutableEnv, BASE_ENV, { NODE_ENV: 'test' })
    const { env } = await importEnv()
    expect(env.PREVIEW_SECRET).toBeUndefined()
  })

  it('siempre exige DATABASE_URI y PAYLOAD_SECRET, sin importar el entorno', async () => {
    Object.assign(mutableEnv, { NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: BASE_ENV.NEXT_PUBLIC_SITE_URL })
    await expect(importEnv()).rejects.toThrow(/DATABASE_URI|PAYLOAD_SECRET/)
  })
})
