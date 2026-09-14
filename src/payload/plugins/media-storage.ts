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

export const mediaStoragePlugins: Plugin[] = isS3Configured()
  ? [
      s3Storage({
        bucket: payloadEnv.S3_BUCKET as string,
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
        config: {
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
        },
      }),
    ]
  : []
