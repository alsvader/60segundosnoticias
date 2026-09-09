## Why

El repositorio completó Phase -1 (bootstrap del entorno de IA/SDD) pero no contiene todavía ninguna implementación de aplicación: no existe `package.json`, ni `src/`, ni configuración de Next.js/Payload. Para poder implementar cualquier funcionalidad editorial (Phase 2 en adelante) primero necesitamos una base técnica real: una aplicación Next.js + Payload que arranque, se conecte a PostgreSQL, valide su configuración y pueda ejecutarse de forma reproducible vía Docker. Sin esta base, ningún change posterior tiene dónde apoyarse.

## What Changes

- Bootstrap de la aplicación Next.js (App Router) con TypeScript, integrando Payload CMS dentro de la misma aplicación (sin backend separado).
- Selección y fijación de versiones estables y mutuamente compatibles del stack (Next.js, React, Payload CMS y paquetes `@payloadcms/*`, adaptador PostgreSQL, Tailwind CSS, shadcn/ui CLI, pnpm, PostgreSQL) registradas en `package.json`/`pnpm-lock.yaml`.
- Inicialización de Payload con el adaptador oficial de PostgreSQL (`@payloadcms/db-postgres`), sin ninguna Collection ni Global todavía.
- Inicialización de Tailwind CSS y shadcn/ui como capa base de primitivos (sin construir el Design System editorial completo).
- Validación de variables de entorno críticas al arrancar/build (p. ej. `DATABASE_URI`, `PAYLOAD_SECRET`), evitando exponer valores privados como `NEXT_PUBLIC_*`.
- Endpoint `/api/health` que confirma que la aplicación está operativa sin filtrar información sensible.
- Entorno de desarrollo local reproducible vía Docker Compose: servicios `app` y `db`, comunicación `app` → `db:5432` (nunca `localhost` dentro de Docker), volumen nombrado para persistencia de PostgreSQL, healthchecks para ambos servicios y soporte de Fast Refresh/hot reload mediante montaje de fuente.
- Dockerfile multi-stage estableciendo como mínimo las etapas `base`, `deps`, `development` y `builder`; el hardening completo de la etapa `runner` de producción queda fuera de este change.
- Estructura de carpetas mínima bajo `src/` según el árbol conceptual del Master Spec, creando únicamente las carpetas que tienen contenido real en esta fase.

Ningún cambio de esta lista es **BREAKING** porque no existe implementación previa que romper.

## Capabilities

### New Capabilities

- `app-bootstrap`: Next.js y Payload CMS operando como una sola aplicación (Payload Admin accesible, ruta base de Next.js renderizando), con TypeScript y build de producción sin errores.
- `environment-validation`: Validación de variables de entorno críticas al arrancar/hacer build, con fallo explícito ante configuración faltante o inválida y separación estricta entre variables públicas y privadas.
- `health-check`: Endpoint `/api/health` que reporta el estado operativo de la aplicación sin exponer secretos ni información interna sensible.
- `local-docker-environment`: Entorno de desarrollo local reproducible vía Docker Compose (`app` + `db`), con healthchecks, persistencia de datos de PostgreSQL entre reinicios, comunicación interna `app` → `db:5432` y soporte de Fast Refresh.

### Modified Capabilities

_(ninguna: no existe implementación previa cuyo comportamiento se esté modificando)._

## Impact

- **Código nuevo:** esqueleto de `src/app/` (layout base, página base, ruta `api/health`), configuración de Payload (`payload.config.ts`) sin collections/globals, configuración de Next.js, Tailwind y shadcn (`components.json`), validación de entorno (`src/lib/env/`).
- **Infraestructura:** `Dockerfile` multi-stage (etapas de desarrollo/build), `compose.yaml` con servicios `app`+`db`, `.dockerignore`, `.env.example`.
- **Dependencias:** se añaden por primera vez `next`, `react`/`react-dom`, `payload` y paquetes `@payloadcms/*` (todos en la misma versión), `@payloadcms/db-postgres`, `tailwindcss`, dependencias generadas por la inicialización de shadcn/ui, y herramientas de desarrollo (TypeScript, linters) necesarias para que `AC-GEN-001`/`AC-GEN-002` sean verificables.
- **Fuera de alcance / no afectado:** cualquier Payload Collection o Global (Phase 2/6), el Design System editorial completo (Phase 4), rutas públicas de categoría/artículo/búsqueda (Phase 5/7/9), preview/SEO/cache/redirects (Phase 8), seeds (Phase 3), y el hardening completo de Docker/producción (Phase 10).
