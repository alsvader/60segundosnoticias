# Pruebas, QA y performance

Referencia operativa de la suite de pruebas de este proyecto (Fase 11 — Testing, QA & Performance). Complementa, sin duplicar, `docs/60-segundos-spec.md` (especificación objetivo), `README.md` (flujo de desarrollo) y `docs/DEPLOYMENT.md` (producción). Cada comando listado aquí existe realmente en `package.json` — si alguno deja de existir, este documento debe actualizarse en el mismo cambio.

## Capas de prueba

| Capa | Herramienta | Contra qué corre | Comando |
|---|---|---|---|
| Unitaria | Vitest (`node` + `happy-dom`) | Funciones puras, hooks, componentes aislados — sin base de datos | `pnpm test:unit` |
| Import map | Script bash | Verifica que el import map de Payload Admin sigue generado/estable | `pnpm test:importmap` |
| Regresión de migraciones | Script propio + Payload CLI | Base Postgres desechable, cadena completa desde cero | `pnpm test:migrations` |
| Integración | Vitest (`integration` project) + Payload Local API | La misma base Postgres desechable, ya migrada | `pnpm test:integration` |
| E2E (journeys funcionales) | Playwright, Chromium | Build de producción real (`output: standalone`) + Postgres/MinIO desechables | `pnpm test:e2e` / `pnpm test:e2e:pr` |
| Accesibilidad automática | Playwright + `@axe-core/playwright` | El mismo servidor de producción E2E | `pnpm test:a11y` |
| Regresión visual | Playwright `toHaveScreenshot()` | El mismo servidor de producción E2E, solo Chromium | `pnpm test:visual` |
| Cross-browser crítico | Playwright, Firefox/WebKit | Los 8 journeys críticos etiquetados `@smoke-cross-browser` | `pnpm exec playwright test --project=firefox --project=webkit` |
| Smoke de Docker de producción | `scripts/docker-smoke.sh` | La imagen `runner` real, vía `compose.prod.yaml --profile self-hosted` | `pnpm test:smoke` |
| Performance/SEO | Lighthouse CI | El mismo servidor de producción E2E | `pnpm exec lhci autorun` (requiere el servidor E2E ya corriendo — ver abajo) |
| Aislamiento de Docker Compose | Script bash | Namespaces de proyecto de cada compose file | `pnpm test:docker-isolation` |

`pnpm test` encadena `typecheck` → `lint` → `test:importmap` → `test:unit` — el atajo rápido para iterar localmente sin infraestructura. No incluye integración/E2E/Docker (todas requieren Postgres y/o MinIO desechables levantados aparte).

### Layout de `tests/`

- `tests/setup/` — helpers de arranque compartidos (variables de entorno, el guard de base de datos, inicialización de Payload).
- `tests/fixtures/` — builders deterministas para poblar Categories/Posts/Pages/Media/Redirects/globals con datos de prueba reproducibles (`seedBaseFixtures`, usado por integración, E2E y Lighthouse).
- `tests/integration/` — pruebas de integración (Vitest, `project: integration`).
- `tests/e2e/` — specs de Playwright, más `tests/e2e/visual.spec.ts-snapshots/` con las baselines de regresión visual committeadas.
- Pruebas unitarias van colocadas junto al código que prueban (`src/**/*.test.ts`), no centralizadas.

## El guard de seguridad de la base de datos de pruebas

`tests/setup/assert-test-database.ts` exige **ambas** condiciones antes de permitir cualquier operación destructiva contra una base de datos de pruebas:

1. El nombre de la base termina en el sufijo `_test`.
2. El host/puerto coincide con uno de los dos pares reconocidos explícitamente:
   - `localhost:5433` — `compose.test.yml`, usado por `test:migrations`/`test:integration`/`test:e2e:server` desde el host.
   - `db:5432` — el servicio `db` de `compose.prod.yaml --profile self-hosted`, dentro de su propia red de Compose, usado únicamente por `scripts/docker-smoke.sh`.

Ningún host/puerto genérico se acepta por defecto — un error de configuración que apunte accidentalmente a la base de desarrollo o de producción falla explícitamente (`UnsafeTestDatabaseError`) en vez de ejecutarse. Nunca se relaja esta validación para "hacer pasar" una prueba; si un flujo legítimo nuevo necesita otro par host/puerto, se agrega explícitamente a `RECOGNIZED_TEST_DB_HOSTS`.

## Infraestructura desechable (`compose.test.yml`)

```bash
docker compose -f compose.test.yml up -d
# ... correr test:migrations / test:integration / test:e2e:server ...
docker compose -f compose.test.yml down
```

Provee Postgres 17 (`60segundos_test`, puerto `5433`, sin volumen nombrado — el estado no sobrevive entre corridas) y MinIO (S3-compatible, puerto `9000`/`9001`) con un bucket público de pruebas ya creado (`minio-init`). El `name: 60segundosnoticias-test` explícito es obligatorio — sin él, Compose derivaría el mismo nombre de proyecto que `compose.yaml` (desarrollo) y podría reemplazar sus contenedores.

MinIO existe únicamente porque el servidor E2E corre un build de producción real: `output: standalone` fija `NODE_ENV=production` de forma irreversible, y `src/lib/env/index.ts` exige entonces las seis variables `S3_*` sin excepción. Las pruebas de integración (Local API, nunca `NODE_ENV=production`) no lo necesitan.

## Setup de E2E

`pnpm test:e2e`/`test:e2e:pr`/`test:a11y`/`test:visual` levantan su servidor vía `webServer` de `playwright.config.ts`, que ejecuta `pnpm test:e2e:server` (`scripts/run-e2e-server.mjs`): build de producción real, migración, siembra de fixtures deterministas (`scripts/seed-e2e.ts`), y arranque en `localhost:3100`.

- `test:e2e` corre la suite completa en Chromium.
- `test:e2e:pr` excluye `tests/e2e/visual.spec.ts` (las baselines varían por sistema operativo — ver abajo) y siempre fija `--project=chromium`; es el gate rápido de PR (`ci.yml`).
- `test:a11y`/`test:visual` corren un solo spec cada uno.
- Firefox/WebKit solo ejecutan los 8 journeys críticos etiquetados `@smoke-cross-browser` (QA extendida manual, `release.yml` vía `workflow_dispatch`), nunca la suite completa — `playwright.config.ts` filtra esos dos proyectos con `grep: /@smoke-cross-browser/`.

**Regresión visual multiplataforma**: las baselines committeadas llevan el sufijo del sistema operativo donde se generaron (`*-chromium-darwin.png` para macOS, `*-chromium-linux.png` para el runner de GitHub Actions). Nunca se generan ni se auto-aprueban baselines nuevas desde CI (nunca `--update-snapshots` en un job automatizado) — una baseline nueva se descarga como artifact del job `visual` de `release.yml` (disparado a mano), se revisa visualmente, y se commitea deliberadamente.

**Terceros/embeds bloqueados**: `tests/e2e/base-test.ts` aborta cualquier request hacia dominios de embeds externos (YouTube, Instagram, TikTok, Facebook, X/Twitter, LinkedIn) en todo journey crítico — ningún test SHALL depender de la disponibilidad de un proveedor externo. La única excepción es el Article con embed usado por Lighthouse (`/fixture-noticias/fixture-post-embed`), que no usa ese fixture base.

## Smoke de producción (`scripts/docker-smoke.sh`)

La única capa que construye y levanta la imagen `runner` real (vía `compose.prod.yaml --profile self-hosted`), con su propio namespace de proyecto aislado (`-p 60segundosnoticias-smoke`, nunca el `name:` por defecto ni el directorio de trabajo). Antes de cualquier limpieza destructiva, reconfirma en vivo (etiqueta `com.docker.compose.project` de los contenedores encontrados) que el proyecto activo es exactamente el esperado y se niega a limpiar si no — nunca ejecutar `down -v` contra un proyecto implícito/por defecto.

Reutiliza el MinIO desechable de `compose.test.yml` (debe estar levantado antes de correr el script) vía `host.docker.internal` — resuelto automáticamente en Docker Desktop, pero requiere `extra_hosts: ['host.docker.internal:host-gateway']` en Docker Engine de Linux (ya declarado en `compose.prod.yaml`; sin esto el runner de GitHub Actions no podría alcanzarlo).

Verifica, contra la app real ya corriendo: `/api/health`, `/`, una Category, un Article, `/buscar`, `/admin/login` (todas deben responder `< 400`), y que el proceso de `app` corre como usuario no-root.

## Lighthouse (performance/SEO)

`lighthouserc.json` define un `assertMatrix` con presupuestos por patrón de URL — no todas las páginas tienen las mismas garantías:

- **Contenido público** (`/`, Category, Article, Page): los 7 checks (`performance`/`accessibility`/`best-practices`/`seo` ≥ umbral, LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms) a nivel `error`.
- **`/buscar?q=fixture`**: los mismos 6 checks a nivel `error`, excepto `categories:seo` que baja a `warn` — una página de resultados de búsqueda con `noindex` intencional no tiene por qué alcanzar el mismo score SEO estructural que el contenido editorial, y forzarlo terminaría presionando a quitar ese `noindex` en vez de reflejar una decisión de producto ya tomada.
- **Article con embed** (`/fixture-noticias/fixture-post-embed`): los 7 checks a nivel `warn` — puramente diagnóstico, un proveedor de embed de terceros está fuera del control de este proyecto.

Requiere el servidor E2E de producción ya corriendo en `localhost:3100` (`pnpm test:e2e:server`, en segundo plano) antes de `pnpm exec lhci autorun`.

## Niveles de CI

- **`ci.yml`** (cada PR y cada push a `main`): `quality` (typecheck/lint/unit) → `integration` (migraciones + Vitest integración) → `e2e-pr` (Chromium, journeys funcionales + a11y) → `docker-build` (build en frío de `runner`/`migrator`, sin Postgres alcanzable — verifica el invariante de `openspec/changes/archive/2026-09-17-runtime-public-rendering`). Nunca navegadores cross-browser, nunca regresión visual, nunca Lighthouse — ese es el gate rápido.
- **`release.yml`** (`workflow_dispatch` únicamente — ya no corre en cada push a `main`): QA extendida manual, bajo demanda. Reutiliza `ci.yml` como `ci-gates`, luego en paralelo `e2e-full` (Firefox/WebKit, los 8 journeys críticos), `visual` (regresión visual Linux), `docker-smoke` (imagen real), `lighthouse`. Nada de esto publica ni despliega por defecto. Los jobs `publish` (GHCR, tags inmutables por SHA + alias `-main`), `deploy` (`environment: production` con *required reviewers*, entrega vía `scripts/dokploy-deploy.ts`) y `provenance` — el mecanismo original completo — se conservan sin borrar pero inactivos, gateados tras el input `publish_and_deploy: true` del propio `workflow_dispatch`; es la ruta legada/opcional, no el camino normal.
- **Despliegue real a producción** (camino normal, sin pasar por `release.yml`): al mergear a `main` (ya con `ci.yml` en verde), Dokploy construye la imagen él mismo desde el `Dockerfile` (`compose.dokploy.yaml` usa `build:`) y la despliega vía su propio Auto Deploy nativo — sin aprobación humana ni publicación de imágenes. Un rollback usa `.github/workflows/rollback.yml` con `strategy: git` (default, sin aprobación): revierte el árbol de `main` a un commit bueno y deja que Dokploy reconstruya; `strategy: image` (verificación de manifests en GHCR + `scripts/dokploy-deploy.ts`, requiere `environment: production`) sigue existiendo como opción legada. Runbook operativo completo (cómo leer una falla, cómo ejecutar un rollback) en `docs/OPERATIONS.md`; contrato completo en `openspec/specs/deployment-automation/spec.md` y `openspec/changes/archive/2026-09-20-simplify-cicd-dokploy-native-deploy`.

## Checklist manual de QA (no automatizado)

Los siguientes puntos no los cubre `@axe-core/playwright` (que solo detecta violaciones automáticamente identificables) y deben revisarse a mano antes de un release visualmente significativo:

- **Navegación solo con teclado**: cada journey crítico (leer un Article, buscar, abrir el menú móvil) se completa sin mouse.
- **Foco visible**: cada elemento interactivo muestra un indicador de foco claramente perceptible al tabular.
- **Orden de foco lógico**: el orden de tabulación sigue el orden visual/de lectura, sin saltos inesperados.
- **Jerarquía de encabezados**: cada página tiene un único `<h1>` y no salta niveles (`h1` → `h3` sin `h2`).
- **Zoom / reflow**: la página sigue siendo usable al 200% de zoom, sin scroll horizontal ni contenido recortado.
- **Sanity de lector de pantalla**: una pasada rápida con VoiceOver/NVDA en los journeys críticos — landmarks con nombre único, texto de enlaces/botones comprensible fuera de contexto.
- **`prefers-reduced-motion`**: ninguna animación/transición esencial para entender el contenido depende exclusivamente de movimiento cuando el usuario lo desactivó.

## Limitaciones de V1 que las pruebas deben preservar

Estas limitaciones de búsqueda (`docs/SEARCH.md`) son decisiones de producto deliberadas para V1, no bugs — ninguna prueba debe empezar a exigir un comportamiento distinto sin que la especificación cambie primero:

- **Sin insensibilidad a acentos**: "México" no coincide con "Mexico" (`ILIKE` no normaliza acentos).
- **Sin matching entre campos**: si las palabras de la búsqueda están repartidas entre `title` y `searchText` sin que ninguno de los dos las contenga todas, ese resultado no aparece.
- **Sin tolerancia a errores tipográficos**, sinónimos, ni stemming.
