import type { Plugin } from 'payload'

import { s3Storage } from '@payloadcms/storage-s3'

import { payloadEnv } from '../../lib/env/payload.ts'

/**
 * Fase 10 (openspec/changes/production-hardening, AC-STOR-001..003): en
 * producción, Media SHALL usar Object Storage compatible con S3 (R2
 * recomendado por §4.3 del Master Spec, sin acoplarse a un proveedor
 * concreto vía `S3_ENDPOINT`). Activo solo si las seis variables `S3_*`
 * están presentes; si no, `media-collection` sigue usando almacenamiento
 * local sin cambios (comportamiento de desarrollo intacto).
 */
function isS3Configured(): boolean {
  return Boolean(
    payloadEnv.S3_ENDPOINT &&
      payloadEnv.S3_REGION &&
      payloadEnv.S3_BUCKET &&
      payloadEnv.S3_ACCESS_KEY_ID &&
      payloadEnv.S3_SECRET_ACCESS_KEY &&
      payloadEnv.S3_PUBLIC_URL,
  )
}

const s3Configured = isS3Configured()

/**
 * openspec/changes/payload-s3-importmap: `s3Storage()` must be called in
 * EVERY environment (never behind `isS3Configured() ? [...] : []`), passing
 * `enabled: s3Configured` instead. `@payloadcms/plugin-cloud-storage`'s
 * `initClientUploads()` registers `S3ClientUploadHandler` in
 * `config.admin.dependencies` unconditionally, before it even looks at
 * `enabled` (see node_modules/@payloadcms/storage-s3, `s3Storage()`: it
 * calls `initClientUploads(...)` first, and only checks
 * `isPluginDisabled` afterward) - its own comment says this is deliberate,
 * "to avoid import map discrepancies between dev and prod". Gating the
 * plugin's presence itself (the previous code) meant dev (no S3 vars) and
 * production/E2E (S3 vars) produced two structurally different configs,
 * so the committed `importMap.js` oscillated depending on which
 * environment last regenerated it - confirmed by running
 * `pnpm payload generate:importmap` with and without S3 vars and diffing
 * the result, and by the running dev container's logs re-writing the file
 * back to the no-S3 shape every time its own (S3-less) dev config
 * recompiled the Admin route. `bucket`/`config` below are structurally
 * required by `s3Storage()`'s type but are read only inside
 * `getStorageClient()`, which - confirmed from the same source - is never
 * called on the `enabled: false` path (it early-returns before
 * `createS3Adapter()`, the only caller of `getStorageClient()`); disabled
 * mode also never sets `disableLocalStorage: true` (only done past that
 * same early return), so local Media upload is untouched when S3 is not
 * configured.
 */
const DISABLED_S3_PLACEHOLDER = {
  bucket: 'local-storage-disabled-placeholder',
  config: {},
} as const

export const mediaStoragePlugins: Plugin[] = [
  s3Storage({
    bucket: s3Configured ? (payloadEnv.S3_BUCKET as string) : DISABLED_S3_PLACEHOLDER.bucket,
    collections: {
      media: {
        disablePayloadAccessControl: true,
        // Sirve directo desde el Object Storage/CDN configurado, no a
        // través de una ruta de Payload: el App Container permanece
        // stateless y sin hacer de proxy de lectura para archivos.
        generateFileURL: ({ filename, prefix }) =>
          `${payloadEnv.S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
      },
    },
    config: s3Configured
      ? {
          credentials: {
            accessKeyId: payloadEnv.S3_ACCESS_KEY_ID as string,
            secretAccessKey: payloadEnv.S3_SECRET_ACCESS_KEY as string,
          },
          endpoint: payloadEnv.S3_ENDPOINT,
          // Requerido por la mayoría de proveedores S3-compatibles
          // (R2, MinIO) cuando se usa un `endpoint` explícito distinto de
          // AWS.
          forcePathStyle: true,
          region: payloadEnv.S3_REGION,
        }
      : DISABLED_S3_PLACEHOLDER.config,
    enabled: s3Configured,
  }),
]
