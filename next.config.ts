import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

import { buildSecurityHeaders } from './src/lib/security/headers.ts'

const nextConfig: NextConfig = {
  // Runtime de producción mínimo (openspec/changes/production-hardening,
  // capacidad `production-docker-image`): el stage `runner` del Dockerfile
  // se basa en este artefacto, no en el árbol de dependencias completo.
  output: 'standalone',
  async headers() {
    return buildSecurityHeaders()
  },
}

export default withPayload(nextConfig)
