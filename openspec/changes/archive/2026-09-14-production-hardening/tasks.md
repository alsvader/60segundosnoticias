## 1. Contrato de entorno de producción

- [x] 1.1 Extender `src/lib/env/index.ts` para exigir `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` y `S3_PUBLIC_URL` cuando `NODE_ENV=production`, manteniéndolas opcionales en desarrollo/test; verificar con una prueba que arrancar con `NODE_ENV=production` sin alguna de estas variables falla explícitamente indicando cuál falta
- [x] 1.2 Verificar que `src/lib/env/payload.ts` sigue cargable desde el CLI de Payload (`pnpm payload migrate:status` o equivalente) sin errores de resolución de módulos tras el cambio
- [x] 1.3 Documentar `REVALIDATION_SECRET` en `.env.example` como variable reservada/no requerida, sin agregarla al schema como obligatoria y sin inventar un endpoint de revalidación externo

## 2. Almacenamiento de Media (Object Storage S3-compatible)

- [x] 2.1 Agregar el plugin oficial de storage S3-compatible de Payload como dependencia, fijando la misma versión de familia que `payload`/`@payloadcms/next`/`@payloadcms/db-postgres` ya instalados
- [x] 2.2 Configurar el adaptador sobre la Collection `Media` usando `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, credenciales y `forcePathStyle` cuando aplique, activo solo si las variables `S3_*` están presentes
- [x] 2.3 Verificar que en desarrollo (sin `S3_*` configuradas) `Media` sigue usando almacenamiento local sin cambio de comportamiento respecto al estado actual
- [x] 2.4 Verificar manualmente contra un bucket S3-compatible de prueba (por ejemplo MinIO local): subir una imagen y confirmar que la URL servida apunta al Object Storage, no al filesystem del container

## 3. Configuración de producción de Next.js

- [x] 3.1 Habilitar `output: 'standalone'` en `next.config.ts`; correr `next build` y verificar que `.next/standalone` y `.next/static` se generan, incluyendo las rutas de Payload Admin
- [x] 3.2 Implementar `headers()` en `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, Content-Security-Policy derivada del allowlist real de embeds (YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook, LinkedIn) más el origen de `S3_PUBLIC_URL`, y `Strict-Transport-Security` condicionado a HTTPS confirmado
- [x] 3.3 Smoke test manual sobre el build de producción: cargar un artículo con cada tipo de embed soportado y confirmar que ninguno es bloqueado por la CSP
- [x] 3.4 Smoke test manual sobre el build de producción: iniciar sesión y editar contenido en `/admin` y confirmar que ninguna funcionalidad del Admin queda bloqueada por los headers

## 4. Dockerfile — stages `runner` y `migrator`

- [x] 4.1 Agregar el stage `runner` basado en la salida standalone, con usuario no-root, `CMD` en forma exec, y `HEALTHCHECK` reutilizando el patrón `node -e fetch(...)` ya usado en `compose.yaml`
- [x] 4.2 Agregar el stage `migrator` con dependencias completas (CLI de Payload, `src/payload/migrations`, `payload.config.ts`), sin `CMD` de servidor, capaz de ejecutar `pnpm payload migrate`
- [x] 4.3 Verificar: `docker build --target runner` y `docker build --target migrator` completan sin error
- [x] 4.4 Verificar: `docker run` del `runner` expone `/api/health` con `200` y el proceso corre como usuario no-root (confirmar con `docker exec ... whoami` o equivalente)
- [x] 4.5 Verificar: `docker run` del `migrator` contra un PostgreSQL desechable aplica la cadena completa de migraciones y termina con código de salida `0`

## 5. Orquestación de despliegue (`compose.prod.yaml`)

- [x] 5.1 Crear `compose.prod.yaml` con un servicio `app` (imagen `runner`), un servicio `migrate` (imagen `migrator`, `restart: "no"`) y, opcionalmente, un servicio `db` (`postgres:17-alpine`, puerto no publicado al host, volumen nombrado) solo para el caso self-hosted
- [x] 5.2 Verificar que `compose.yaml` (desarrollo) no cambió de comportamiento tras el change: `docker compose up` sigue usando el target `development` con Fast Refresh

### Prerequisito descubierto durante 5.3/5.4: cadena de migraciones incompleta

Verificar contra una base de datos migrations-only genuina (no la dev DB, push-managed) expuso que la cadena de migraciones committeada nunca creó el schema de tres Globals activamente usados (`Navigation`, `Footer`, `SiteSettings`) — existían en la DB de desarrollo solo por push, nunca por una migración real. Esto bloquea por completo la premisa de Phase 10 ("producción es migrations-only"), no solo 5.3/5.4. Ver design.md, sección "Riesgos/Trade-offs", para el análisis completo y la causa raíz.

- [x] 5.2a Generar una migración forward (no editar migraciones existentes) que cree el schema faltante de `Navigation`/`Footer`/`SiteSettings`, usando las funciones oficiales de generación de Payload/Drizzle (`generateDrizzleJson`/`generateMigration`) contra el schema real de `payload.config.ts`
- [x] 5.2b Revisar el `.ts`/`.json` generados: confirmar que solo afectan las 10 tablas y 6 enums de los tres Globals, sin diff inesperado en Posts/Pages/Categories/Home/Search/ArticleSidebar/Media/Users/Redirects/enums existentes (verificado programáticamente, no solo visualmente)
- [x] 5.2c Verificar contra una base PostgreSQL desechable completamente fresca: correr la cadena completa de 13 migraciones desde cero y confirmar que el set de tablas resultante coincide exactamente con el de la base de desarrollo
- [x] 5.2d Verificar que un `payload migrate:create` posterior sobre esa base ya no propone `Navigation`/`Footer`/`SiteSettings` ni ningún otro diff (baseline reparado)
- [x] 5.3 Verificar el flujo completo con `compose.prod.yaml`: el servicio `migrate` corre y termina exitosamente antes de que `app` quede en estado healthy
- [x] 5.4 Verificar que `DATABASE_URI` puede apuntar a un PostgreSQL externo sin el servicio `db` de `compose.prod.yaml` presente

## 6. Simulación de producción

- [x] 6.1 Simulación greenfield: PostgreSQL desechable vacío → `migrator` → `runner` → `/api/health` en `200` → petición pública exitosa
- [x] 6.2 Simulación de upgrade: PostgreSQL ya en la última migración → nueva imagen → `migrator` (debe completar sin error, sin duplicar cambios) → `runner` arranca correctamente
- [x] 6.3 Verificar persistencia de Media: subir una imagen, recrear el container `runner`, y confirmar que la imagen sigue siendo accesible vía Object Storage
- [x] 6.4 Verificar que recrear el container `runner` no afecta la Collection `search` (persiste en PostgreSQL, no en el filesystem del container)
- [x] 6.5 Ejecutar manualmente el runbook de reindex de `docs/SEARCH.md` contra el build de producción y confirmar que la Collection `search` queda poblada

## 7. Documentación

- [x] 7.1 Crear `docs/DEPLOYMENT.md` cubriendo: build de producción, contrato de entorno (incluyendo qué variables son requeridas solo en producción), secuencia de despliegue (`migrate` → `app` → reindex manual), persistencia de Media/DB, límites de la topología de instancia única, y puntero explícito a Phase 12 para backups y aprovisionamiento real
- [x] 7.2 Actualizar `README.md` si se agregan comandos/scripts nuevos (por ejemplo `docker build --target runner`/`--target migrator`), verificando que cada comando documentado existe realmente en `package.json`/`Dockerfile`
- [x] 7.3 Verificar que `.env.example` refleja el estado final de variables requeridas/opcionales por entorno

## 8. Validación final y Graphify

- [x] 8.1 Correr `typecheck`, `lint` y `next build` (con `output: 'standalone'`) y confirmar que pasan sin errores
- [x] 8.2 Correr `graphify update .` para refrescar el grafo tras los cambios de `Dockerfile`, `next.config.ts`, `payload.config.ts`/`Media.ts` y `src/lib/env`
- [x] 8.3 Verificar cada AC-* relevante (AC-DOCKER-001…011, AC-DB-001…004, AC-ENV-004, AC-STOR-001…003, AC-SEC-009, AC-HEALTH-001…002, AC-LOG-001…002) contra el estado implementado y documentar cualquier excepción
- [x] 8.4 Correr `openspec validate` para el change `production-hardening` antes de solicitar el archivado
