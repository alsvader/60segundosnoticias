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
