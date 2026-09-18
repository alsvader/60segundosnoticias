## Why

`openspec/changes/testing-qa-performance` (tarea 8.1, primera ejecución real de `scripts/docker-smoke.sh` de punta a punta) descubrió que `docker build --target runner` falla siempre que no exista un Postgres alcanzable durante el build - exactamente la situación real de cualquier pipeline que construye la imagen antes de que exista infraestructura de runtime (el propio flujo de `docker-smoke.sh`, que crea un Postgres desechable DESPUÉS de intentar construir la imagen). `Dockerfile` documenta expresamente lo contrario como invariante desde Fase 10 ("`DATABASE_URI`/`PAYLOAD_SECRET` aquí solo necesitan tener forma válida, no apuntar a una base alcanzable"), pero nunca se verificó de punta a punta hasta ahora.

Causa raíz, confirmada mediante builds locales controlados (caché `.next` limpia, `DATABASE_URI` con forma válida pero host inalcanzable, removiendo archivos de ruta uno a la vez para aislar cada fallo - ver design.md): exactamente tres rutas intentan generación estática (SSG) en build time y consultan Payload/Postgres al hacerlo - `/` y `/buscar` (ambas bajo `src/app/(frontend)/layout.tsx`, que resuelve Navigation/Footer/SiteSettings de forma incondicional) y `/sitemap.xml` (`src/app/sitemap.ts`, fuera de ese layout). Ninguna de las dos tiene una razón de negocio para ser estática: ambas ya dependen de datos administrables vía `unstable_cache` con invalidación por tags (Fase 8), y esa capa de cache es independiente del modo de renderizado de la ruta.

## What Changes

- `src/app/(frontend)/layout.tsx`: agregar `export const dynamic = 'force-dynamic'`. Cubre `/` y `/buscar` (y cualquier ruta estática-por-defecto que se agregue después bajo este grupo).
- `src/app/sitemap.ts`: agregar `export const dynamic = 'force-dynamic'` (vive fuera del layout anterior, necesita su propio marcador).
- Ningún cambio a la capa de datos (`unstable_cache`, tags, hooks `afterChange`, dedupe de `cache()` de React), a `Dockerfile`, a los archivos `compose*.yaml`, a `/llms.txt` (ya dinámico por default de Next 15+ para Route Handlers `GET`), a `/robots.txt` (genuinamente estático, sin acceso a Payload), ni a las rutas dinámicas de Category/Article/Page (ya `ƒ` por falta de `generateStaticParams`, nunca intentaron SSG).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `production-docker-image`: nuevo requisito - el build (`pnpm build` dentro del stage `builder`) SHALL completarse sin necesitar una base de datos Postgres alcanzable.
- `cache-revalidation`: el requisito existente "Remoción de force-dynamic condicionada a invalidación verificada" (Fase 8) se actualiza para reflejar que `force-dynamic` está de vuelta en el layout público, por una razón distinta a la original (invariante de build de Fase 10, no la postura sin-cache de Fase 5) - preservando la garantía de invalidación dirigida ya verificada.

## Impact

- `src/app/(frontend)/layout.tsx`
- `src/app/sitemap.ts`
- `openspec/specs/production-docker-image/spec.md`
- `openspec/specs/cache-revalidation/spec.md`
- Regresión: `scripts/docker-smoke.sh` (ya existente, ahora pasa de punta a punta por primera vez).
- Hallazgo no planeado corregido en el mismo alcance: `scripts/docker-smoke.sh`/`tests/setup/assert-test-database.ts` - el guard de base de datos de pruebas no reconocía el host/puerto del Postgres desechable de `compose.prod.yaml --profile self-hosted` (nunca antes ejercitado, porque la tarea 8.1 de `testing-qa-performance` jamás había corrido de punta a punta). Ver design.md.
