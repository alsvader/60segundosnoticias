## Why

El pipeline de CI/CD (`ci.yml` + `release.yml`, entregados por `production-deployment-dokploy`) fue diseñado para un modelo de "release calificado + imagen inmutable": cada push a `main` re-ejecuta toda la suite de `ci.yml` como `ci-gates` dentro de `release.yml`, y además dispara 4 jobs pesados en paralelo (`e2e-full` cross-browser, `visual`, `docker-smoke`, `lighthouse`) antes de publicar imágenes a GHCR y desplegar vía API a Dokploy con aprobación manual. Esto duplica trabajo (la suite corre dos veces por cada merge) y consumió 218 minutos de GitHub Actions en un solo deploy de prueba — un costo desproporcionado para un proyecto mantenido por una sola persona en su estado actual.

`production-deployment-dokploy` sigue activo (no archivado) pero ya está implementado por completo; este change no lo edita — lo supera. Reescribir sus decisiones in-place corrompería el registro de qué se construyó realmente en esa fase.

## What Changes

- `compose.dokploy.yaml` deja de usar `image: ${RUNNER_IMAGE}`/`${MIGRATOR_IMAGE}` (imágenes pre-construidas en GHCR) y pasa a usar `build:` sobre el mismo `Dockerfile`, igual que `compose.prod.yaml` — Dokploy construye la imagen él mismo, en el VPS, en cada deploy. **BREAKING** (respecto a `production-deployment-dokploy`): ya no hay una imagen inmutable por SHA que trazar entre "qué se calificó" y "qué corre".
- Dokploy despliega vía su propio Auto Deploy nativo sobre `push` a `main` — ya no hay un job `deploy` de GitHub Actions que llame a la API de Dokploy en el camino normal. **BREAKING**: desaparece la pausa de aprobación humana (GitHub Environment `production` con reviewers) — mergear a `main` pasa a ser, directamente, la decisión de desplegar.
- `ci.yml` (gate obligatorio de PR y merge) no cambia de forma — `quality → integration → e2e-pr → docker-build` — salvo que `docker-build` deja de estar condicionado por `paths-filter` y corre siempre, porque ahora es el único "dry run" pre-merge de la imagen que Dokploy va a construir de verdad.
- `release.yml` deja de correr automáticamente en cada push a `main`. Queda como `workflow_dispatch` para QA extendida manual (`ci-gates`, `e2e-full`, `visual`, `docker-smoke`, `lighthouse`) sin publicar ni desplegar nada por defecto. Los jobs `publish`/`deploy`/`provenance` (el mecanismo anterior completo) se conservan sin borrar, inactivos detrás del input `publish_and_deploy: true`, para quien quiera volver puntualmente al modelo anterior.
- `rollback.yml` gana una estrategia `git` (default): deja el árbol de `main` idéntico a un commit bueno anterior (`git checkout <sha> -- .` + commit nuevo, sin force-push ni reescritura de historia) y confía en que Dokploy reconstruya solo. La estrategia `image` (verificar manifests en GHCR + `scripts/dokploy-deploy.ts`) se conserva sin cambios de comportamiento como opción explícita, solo sin el Environment de aprobación manual.
- `scripts/dokploy-deploy.ts`, `src/lib/deploy/dokploy-client.ts` y `dokploy-env.ts` (y sus tests) quedan sin caller en el camino normal, pero no se eliminan — siguen siendo el mecanismo detrás de la estrategia legada.
- `scripts/smoke-production.ts` deja de invocarse automáticamente desde CI; se documenta como chequeo manual post-deploy.
- **Limitación aceptada**: `/api/health` deja de reportar un `sha` fiable en el camino normal — ni `compose.dokploy.yaml` ni `compose.prod.yaml` pasan `GIT_SHA` como build-arg (no está disponible dentro del build context; `.dockerignore` excluye `.git`). La verificación post-deploy se reduce a "el sitio responde sano", no "es exactamente este commit".
- `docs/DEPLOYMENT.md` y `docs/OPERATIONS.md` se actualizan para describir el nuevo flujo por defecto y documentar el modelo anterior como ruta legada opcional.

## Capabilities

### New Capabilities
- `deployment-automation`: contrato observable de cómo una release llega a producción y cómo se revierte, en el modelo simplificado (Dokploy construye y despliega solo desde `main`, sin aprobación humana; rollback por reversión de árbol git). Esta capacidad nunca llegó a sincronizarse en `openspec/specs/` porque `production-deployment-dokploy` (que la definía) sigue sin archivarse — este change la introduce por primera vez como spec aceptada, con el contrato ya vigente.

### Modified Capabilities
(ninguna — los requisitos ya sincronizados en `openspec/specs/production-deployment/spec.md` sobre orden de migración, job de migración singular, `DATABASE_URI` agnóstico del proveedor, y la composición de referencia self-hosted no cambian: siguen siendo ciertos con `compose.dokploy.yaml` construyendo desde el Dockerfile)

## Impact

- Código: `compose.dokploy.yaml`, `.github/workflows/{ci,release,rollback}.yml`.
- Documentación: `docs/DEPLOYMENT.md`, `docs/OPERATIONS.md`.
- Sin cambios de código de aplicación (`src/`) ni de specs de producto.
- Huérfano mantenido a propósito, no eliminado: `scripts/dokploy-deploy.ts`, `src/lib/deploy/dokploy-client.ts`, `src/lib/deploy/dokploy-env.ts` y sus tests (siguen siendo el motor de la estrategia `image` legada en `rollback.yml` y de los jobs `publish`/`deploy`/`provenance` legados en `release.yml`).
- Operativo (fuera de este repositorio): el operador debe activar el "Auto Deploy" nativo de Dokploy sobre `main` para el servicio Compose, y revisar si quiere branch protection en `main` exigiendo los checks de `ci.yml` — sin aprobación manual, ese es el único gate real de calidad antes de producción.
