## Why

El proyecto solo puede ejecutarse hoy en modo desarrollo: el `Dockerfile` termina en un stage `builder` que nunca se ejecuta, no existe imagen ni proceso de arranque de producción, `Media` persiste en disco local (efímero en un container), no hay orquestación de migraciones para producción, y no hay headers de seguridad configurados. Phase 9 (Search) ya está implementada y archivada; el Master Spec asigna explícitamente a Phase 10 cerrar esta brecha (`docs/60-segundos-spec.md`, sección "Phase 10 — Docker + Production Hardening") antes de que Phase 11 (Testing/QA/CI) y Phase 12 (Release Readiness) puedan apoyarse en un runtime de producción real.

## What Changes

- Agregar un stage `runner` de producción al `Dockerfile`, basado en la salida `standalone` de Next.js: usuario no-root, `CMD` en forma exec, sin herramientas de desarrollo, `HEALTHCHECK` reutilizando el patrón `node -e fetch(...)` ya usado en desarrollo (sin instalar curl/wget).
- Agregar un stage `migrator` separado del `runner`, con las dependencias completas necesarias para ejecutar `pnpm payload migrate` como job de un solo uso, desacoplado del proceso normal de la aplicación.
- Establecer el invariante: las migraciones se ejecutan una sola vez, antes de que arranque la nueva versión de la aplicación; el `ENTRYPOINT`/`CMD` normal del container de aplicación SHALL NOT ejecutar `payload migrate` automáticamente en cada arranque o reinicio.
- Agregar `compose.prod.yaml` (o el nombre equivalente del repositorio) como target de verificación production-like / referencia self-hosted, sin modificar `compose.yaml` (que permanece exclusivamente de desarrollo). `compose.prod.yaml` NO implica un compromiso de auto-hospedar PostgreSQL: `DATABASE_URI` SHALL seguir soportando un PostgreSQL administrado externo sin requerir el servicio `db` de Compose.
- Conectar `Media` a almacenamiento de objetos compatible con S3 en producción (adaptador de Payload), sin acoplarse a un proveedor concreto (Cloudflare R2 recomendado por el Master Spec, no hardcodeado); desarrollo continúa usando almacenamiento local sin cambios.
- Extender la validación de entorno (`src/lib/env`) para exigir en producción las variables actualmente opcionales que el runtime de producción sí necesita (`NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`), sin romper la validación de desarrollo existente. Decidir en `design.md` si `REVALIDATION_SECRET` (actualmente sin consumidor) se elimina o se documenta como reservado/no usado.
- Configurar `next.config.ts` con `output: 'standalone'` (verificando compatibilidad con Payload antes de adoptarlo) y con headers de seguridad de producción derivados de los proveedores de embeds reales (`YouTube`, `Vimeo`, `Instagram`, `X/Twitter`, `TikTok`, `Facebook`, `LinkedIn`) y del comportamiento de Payload Admin, evitando una política global que rompa el Admin.
- Documentar (no automatizar) la secuencia operativa de despliegue: migración → deploy de app → reindex manual de Search vía Admin (reutilizando el runbook ya existente en `docs/SEARCH.md`) → verificación.
- Documentar los límites de la topología de instancia única (V1) y qué debe cambiar antes de escalar a múltiples réplicas (coordinación de invalidación de cache, límites de conexión a base de datos), sin implementar Redis, colas ni coordinación distribuida en esta fase.

**BREAKING**: ninguno. No se modifica el flujo de desarrollo existente (`compose.yaml`, DB con push, Fast Refresh).

## Capabilities

### New Capabilities
- `production-docker-image`: stages `runner` (Next standalone, no-root, healthcheck) y `migrator` (job de un solo uso para `payload migrate`) del Dockerfile, y el invariante de que las migraciones no se disparan desde el arranque normal del App Container.
- `production-deployment`: `compose.prod.yaml` como target de verificación/referencia self-hosted, topología de instancia única, compatibilidad con PostgreSQL administrado externo vía `DATABASE_URI`, y documentación de lo que se requeriría para múltiples réplicas.
- `production-security-headers`: headers de seguridad de producción (CSP derivada de los proveedores de embed reales, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, protección de framing, HSTS condicional a HTTPS/proxy), sin romper Payload Admin.

### Modified Capabilities
- `media-collection`: agrega el requisito de que `Media` use almacenamiento de objetos compatible con S3 en producción (hoy la spec dice explícitamente que el adaptador de producción "es Phase 10, fuera de esta fase" — esta fase lo resuelve); desarrollo conserva almacenamiento local.
- `environment-validation`: agrega el requisito de validación condicional a producción para las variables que hoy son opcionales en el schema pero son requeridas por el runtime de producción real (`NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, variables `S3_*`).

## Impact

- `Dockerfile`: nuevos stages `runner` y `migrator`.
- `compose.prod.yaml` (nuevo archivo).
- `next.config.ts`: `output: 'standalone'`, `headers()`.
- `src/payload/collections/Media.ts` / `payload.config.ts`: adaptador de almacenamiento S3-compatible (nueva dependencia npm del tipo `@payloadcms/storage-s3` o equivalente compatible con S3, sin acoplarse a un proveedor).
- `src/lib/env/index.ts` (y `src/lib/env/payload.ts` si aplica): schema de validación condicional a producción.
- `docs/DEPLOYMENT.md` (o `docs/PRODUCTION.md`, nuevo): runbook de despliegue, contrato de entorno, límites de instancia única.
- No afecta: `compose.yaml`, flujo de desarrollo con push de Payload/Drizzle, Search plugin/reindex (solo se documenta su secuencia), CI (Phase 11), aprovisionamiento real de PostgreSQL/Object Storage (Phase 12).
