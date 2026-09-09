import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URI: z.string().min(1, 'DATABASE_URI es requerido'),
  PAYLOAD_SECRET: z.string().min(1, 'PAYLOAD_SECRET es requerido'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  PREVIEW_SECRET: z.string().optional(),
  REVALIDATION_SECRET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
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
