# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM deps AS builder
# `next build` incrusta `NEXT_PUBLIC_SITE_URL` en el bundle de cliente, y
# `payload.config.ts` exige `DATABASE_URI`/`PAYLOAD_SECRET` para construir
# su config incluso en build time (comportamiento previo a esta fase, sin
# cambios) - ninguna de las tres es un secreto de producción real cuando
# se usa para este paso: `DATABASE_URI`/`PAYLOAD_SECRET` aquí solo
# necesitan tener forma válida, no apuntar a una base alcanzable (ver
# design.md, verificación de reproducibilidad de build). Los secretos de
# runtime reales (`PREVIEW_SECRET`, `S3_*`) NO se declaran aquí a
# propósito - no le corresponden al build, ver src/lib/env/index.ts.
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SITE_URL
ENV DATABASE_URI=$DATABASE_URI
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY . .
RUN pnpm build

# Job de un solo uso: aplica `src/payload/migrations` contra `DATABASE_URI`
# antes de que arranque una nueva release (openspec/changes/
# production-hardening, capacidad `production-deployment`). Deriva de
# `deps`, no de `builder`: no necesita el build de Next, solo el CLI de
# Payload y el código fuente completo de la misma release. No expone
# puerto ni define un CMD de servidor - nunca es el App Container normal.
FROM deps AS migrator
# Sin esto, Payload puede tratar el proceso como desarrollo y ofrecer
# reconciliar drift de push-mode de forma interactiva - un prompt sin
# TTY que cuelga el job indefinidamente contra una base de producción,
# verificado directamente (openspec/changes/production-hardening).
ENV NODE_ENV=production
COPY . .
CMD ["pnpm", "payload", "migrate"]

# Runtime de producción: standalone de Next.js, no-root, sin herramientas
# de desarrollo. No incluye el CLI de Payload/migraciones a propósito -
# ver stage `migrator` (openspec/changes/production-hardening, capacidad
# `production-docker-image`).
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# La imagen base `node:24-bookworm-slim` ya define un usuario `node`
# (uid/gid 1000) sin privilegios - se reutiliza en vez de crear uno nuevo.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Se declara al final, después de todos los `COPY`, a propósito: así solo
# invalida la última capa (metadata) en cada commit, en vez de reventar el
# caché de las capas de `COPY`/`pnpm build` de arriba. Nunca en el stage
# `builder` por la misma razón. No es `NEXT_PUBLIC_*`: no se incrusta en
# el bundle de cliente, solo queda disponible vía `process.env` en runtime
# para que `/api/health` reporte qué SHA está realmente vivo
# (openspec/changes/production-deployment-dokploy).
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD ["node", "-e", "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
