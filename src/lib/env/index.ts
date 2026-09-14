import 'server-only'
import { z } from 'zod'

/**
 * `NEXT_PUBLIC_SITE_URL` es la única de estas variables que `next build`
 * necesita de verdad: Next la incrusta en el bundle de cliente durante el
 * build, así que faltarla ahí ya es un build roto - validarla en ese
 * momento es correcto, no una coincidencia de este módulo.
 */
const REQUIRED_AT_BUILD_TIME_IN_PRODUCTION = ['NEXT_PUBLIC_SITE_URL'] as const

/**
 * El resto son secretos/config puramente de runtime (Payload los lee vía
 * `process.env` al atender una petición, nunca se incrustan en el
 * bundle). Exigirlas también durante `next build` acoplaría la imagen de
 * Docker a secretos operativos que no le corresponden en build time
 * (openspec/changes/production-hardening, design.md §"Build
 * reproducibility"; Master Spec §12/§39) - `next build` importa cada
 * módulo de ruta para analizarlo, así que cualquier ruta que solo
 * necesite `DATABASE_URI` (p. ej. `/api/health`) arrastraría, si no,
 * una validación de campos que ni siquiera usa.
 */
const REQUIRED_AT_RUNTIME_IN_PRODUCTION = [
  'PREVIEW_SECRET',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
] as const

const envSchema = z
  .object({
    DATABASE_URI: z.string().min(1, 'DATABASE_URI es requerido'),
    PAYLOAD_SECRET: z.string().min(1, 'PAYLOAD_SECRET es requerido'),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    PREVIEW_SECRET: z.string().optional(),
    // Declarada por el Master Spec (§65) pero sin consumidor: toda la
    // invalidación de cache ocurre in-process (ver src/lib/cache/invalidate.ts).
    // Se conserva como reservada/opcional; no se exige en ningún entorno.
    REVALIDATION_SECRET: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (process.env.NODE_ENV !== 'production') return

    const addRequiredIssue = (key: string) =>
      ctx.addIssue({ code: 'custom', message: `${key} es requerido en producción`, path: [key] })

    for (const key of REQUIRED_AT_BUILD_TIME_IN_PRODUCTION) {
      if (!value[key]) addRequiredIssue(key)
    }

    // `next build` fija esta fase (verificado empíricamente contra esta
    // versión de Next/Turbopack); un arranque real (`next start` o el
    // `server.js` standalone) nunca la reporta, así que la validación de
    // abajo sigue aplicando ahí sin cambios.
    if (process.env.NEXT_PHASE === 'phase-production-build') return

    for (const key of REQUIRED_AT_RUNTIME_IN_PRODUCTION) {
      if (!value[key]) addRequiredIssue(key)
    }
  })

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')

    throw new Error(`Configuración de entorno inválida:\n${issues}`)
  }

  return parsed.data
}

export const env = loadEnv()
