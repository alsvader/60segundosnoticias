import { z } from 'zod'

/**
 * Minimal env accessor used exclusively by `payload.config.ts`.
 *
 * `payload.config.ts` must also load from the standalone Payload CLI
 * (generate:types, migrate:create), which runs outside Next.js's bundler.
 * The app-wide `src/lib/env` module is guarded with `server-only`, which
 * unconditionally throws outside that bundler - so it cannot be reused
 * here. This module intentionally duplicates just the two variables
 * Payload's own config needs; the app-wide module and its guard are
 * unchanged and remain the source of truth for the Next.js runtime.
 */
const payloadEnvSchema = z.object({
  DATABASE_URI: z.string().min(1, 'DATABASE_URI es requerido'),
  PAYLOAD_SECRET: z.string().min(1, 'PAYLOAD_SECRET es requerido'),
  // Object Storage S3-compatible para Media en producción. Opcionales aquí
  // (igual que en src/lib/env/index.ts): si faltan, Media SHALL seguir
  // usando almacenamiento local - ver src/payload/plugins/media-storage.ts.
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
})

function loadPayloadEnv() {
  const parsed = payloadEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')

    throw new Error(`Configuración de entorno inválida:\n${issues}`)
  }

  return parsed.data
}

export const payloadEnv = loadPayloadEnv()
