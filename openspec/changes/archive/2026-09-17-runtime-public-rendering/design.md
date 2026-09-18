## Context

Ver proposal.md - Why. Auditoría completa (builds locales, caché `.next` limpia cada vez, `DATABASE_URI` con forma válida pero host inalcanzable, removiendo temporalmente archivos de ruta uno por uno para aislar cada fallo sin que el primer error del exportador de Next.js oculte los siguientes):

**Hallazgo crítico durante la propia auditoría**: la primera corrida usó un `.next` local ya existente de una build anterior y "pasó" silenciosamente sin ningún error - Next.js persiste su Data Cache en `.next/cache` entre builds, y el build reutilizó resultados cacheados de una build previa exitosa en vez de consultar Payload de nuevo. Solo al borrar `.next` por completo antes de cada intento el build reprodujo el fallo real. **Cualquier verificación local futura de este invariante SHALL borrar `.next` primero** - `.dockerignore` ya excluye `.next` del contexto de build de Docker, así que `docker build` nunca tiene este falso positivo, pero una verificación en el host sí puede tenerlo.

Con esa caché limpia, confirmado por eliminación sucesiva (cada archivo restaurado inmediatamente después):

| Ruta | Archivo | Intenta SSG | Causa |
|---|---|---|---|
| `/` | `src/app/(frontend)/page.tsx` | Sí, falla | `getHome()`/`getSettings()` propios + el layout compartido |
| `/buscar` | `src/app/(frontend)/buscar/page.tsx` | Sí, falla | Solo por el layout compartido - su propio `searchContent()` está detrás de `if (!query)`, que siempre es cierto en un intento de build sin request real |
| `/sitemap.xml` | `src/app/sitemap.ts` | Sí, falla | `getSitemapEntries()` propia, fuera del layout de `(frontend)` |
| `/llms.txt` | `src/app/llms.txt/route.ts` | No, ya `ƒ` | Next.js 15+ hace dinámicos por defecto los Route Handlers `GET`, salvo opt-in explícito a cache |
| `/robots.txt` | `src/app/robots.ts` | No, `○` pero inofensivo | Solo lee `process.env.NODE_ENV`, sin Payload |
| `/[category]`, `/[category]/[post]` | bajo `(frontend)` | No | Sin `generateStaticParams` - Next no puede enumerar ninguna instancia, nunca intenta SSG |
| `/admin/[[...segments]]`, `/api/*` | - | No | Ya dinámicos (Payload/Route Handlers que leen `request`) |

Con `/`, `/buscar` y `/sitemap.xml` removidos temporalmente, el mismo build con `DATABASE_URI` inalcanzable se completa limpio - conjunto exhaustivo confirmado, no solo el primer fallo.

## Goals / Non-Goals

**Goals:**
- Restaurar el invariante de Fase 10: `docker build --target runner` (stage `builder`) SHALL completarse sin una base de datos alcanzable.
- Preservar exactamente el modelo de cache de Fase 8: `unstable_cache` + tags + hooks `afterChange` + dedupe `cache()` de React, sin tocar ninguno.
- Cambio mínimo: solo dos líneas (`export const dynamic = 'force-dynamic'`), sin modificar ninguna función DAL ni componente.

**Non-Goals:**
- No se reintroduce la postura sin-cache de Fase 5 - `force-dynamic` aquí es sobre el modo de renderizado de la ruta (Full Route Cache), no sobre las consultas a Payload (Data Cache), que son capas independientes en Next.js.
- No se toca `/llms.txt` ni `/robots.txt` - ninguno necesita el cambio.
- No se agregan marcadores dinámicos a Category/Article/Page - ya son dinámicos por la ausencia de `generateStaticParams`, nunca intentaron SSG.
- No se cambia `Dockerfile` ni ningún `compose*.yaml` - el fix es enteramente a nivel de código de la aplicación.

## Decisions

**Decisión 1: `export const dynamic = 'force-dynamic'` en el layout compartido y en `sitemap.ts`, no `connection()` ni llamadas sin-cache dentro de cada función DAL.**

Esta app no usa Partial Prerendering (`experimental.ppr` no está configurado), así que sin PPR, una página se vuelve completamente dinámica en cuanto CUALQUIER señal dinámica ocurre en su árbol de render - `force-dynamic` (config de segmento de ruta) y `await connection()` (señal a nivel de llamada) son funcionalmente equivalentes aquí. Se prefiere `force-dynamic` como límite explícito único porque: (a) el layout ya es el punto compartido real de la falla (sus propias llamadas a Footer/Nav/Settings fallan antes de que la página hija tenga oportunidad de señalizar nada), así que un límite a nivel de layout es más preciso que sembrar llamadas en cada función DAL; (b) protege automáticamente cualquier ruta estática-por-defecto que se agregue después bajo `(frontend)`, sin que un desarrollador nuevo tenga que recordar añadir la señal.

**Decisión 2: dos marcadores independientes (layout + `sitemap.ts`), no uno solo.**

`src/app/sitemap.ts` vive fuera del route group `(frontend)` - el layout no lo cubre. No existe un límite compartido único entre los tres; dos marcadores explícitos, cada uno en el archivo que realmente lo necesita, es más simple y más trazable que inventar un layout compartido artificial solo para unificarlos.

**Decisión 3: no tocar `/llms.txt`.**

Ya es `ƒ` (dinámico) sin ningún cambio - confirmado en la auditoría, dos veces (antes y después de la remoción temporal de los otros archivos). Agregar el marcador ahí sería un cambio sin efecto observable, y la instrucción del usuario fue explícita: no tocar `/llms.txt` sin evidencia nueva de que lo necesite. No la hay.

## Risks / Trade-offs

[Riesgo] Confundir "renderizado dinámico por solicitud" con "sin cache de datos" → Mitigación: verificado explícitamente con una prueba de integración determinista (miss → hit → `revalidateTag` → fresh) sobre una función DAL representativa ya envuelta en `unstable_cache`, no inferido solo de que el render funcione. Ver tasks.md, sección 2.

[Riesgo] Una verificación local futura de este invariante reutiliza `.next/cache` por accidente y da un falso positivo (exactamente lo que ocurrió durante esta misma investigación) → Mitigación: documentado explícitamente arriba y en `docs/TESTING.md`; el regresivo real y permanente es `scripts/docker-smoke.sh` (Docker nunca tiene este problema, `.dockerignore` ya excluye `.next` del contexto de build).

## Hallazgo no planeado durante la verificación (sección 4 de tasks.md)

Al ejecutar `scripts/docker-smoke.sh` de punta a punta por primera vez (nunca
antes se había completado - la tarea 8.1 de `testing-qa-performance` seguía
sin implementar cuando esta investigación comenzó), el build/arranque ya
funcionaban correctamente, pero `scripts/seed-e2e.ts` fue rechazado por
`tests/setup/assert-test-database.ts` con `UnsafeTestDatabaseError`: el
Postgres desechable del profile `self-hosted` de `compose.prod.yaml` usa el
nombre de base `60segundos` (a propósito, imitando la forma de producción) y
se alcanza desde dentro de la red de Compose como `db:5432` - ninguno de los
dos coincidía con el único par reconocido por el guard
(`localhost:5433`/sufijo `_test`, pensado para `compose.test.yml`).

Fix, sin debilitar el guard (sigue exigiendo AMBAS condiciones): se agregó
`db:5432` como segundo host/puerto reconocido explícitamente, y
`docker-smoke.sh` ahora fija `POSTGRES_DB=60segundos_smoke_test` (sigue
terminando en `_test`) en vez de dejar el default `60segundos` de
`compose.prod.yaml`. Un host/puerto genérico o desconocido sigue siendo
rechazado igual que antes - solo se añadió un segundo caso explícito, no se
relajó la validación de forma.

## Migration Plan

Sin migración de datos. Pasos:
1. Agregar los dos `export const dynamic = 'force-dynamic'`.
2. Verificar cache (sección 2 de tasks.md) y build limpio sin DB (sección 3).
3. Verificar `scripts/docker-smoke.sh` de punta a punta (sección 4).
4. Commitear.

Rollback: revertir el commit. El código previo era funcionalmente válido (solo reintroduce el bug de build sin DB) - revertir es seguro si algo inesperado aparece.
