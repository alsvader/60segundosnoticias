## Context

Ver `proposal.md` - Why. Estado previo a este change: `compose.dokploy.yaml` usaba `image: ${RUNNER_IMAGE}`/`${MIGRATOR_IMAGE}` (pre-construidas y publicadas a GHCR por `release.yml`), con un job `deploy` en GitHub Actions detrás de una aprobación humana (GitHub Environment `production`). Ese diseño está documentado en `openspec/changes/archive/2026-09-18-testing-qa-performance/design.md` (Decisión 13) y `openspec/changes/production-deployment-dokploy/design.md` (Decisiones 1, 3): fue una elección deliberada por trazabilidad/inmutabilidad, no por una limitación de capacidad del VPS — no hay ninguna nota sobre CPU/RAM/tiempo de build en esos documentos.

`production-deployment-dokploy` sigue sin archivarse pero ya está implementado en su totalidad; este change no lo toca ni lo revierte in-place — lo supera con un nuevo change, para no corromper el registro histórico de lo que esa fase construyó.

## Goals / Non-Goals

**Goals**: reducir minutos de CI/CD a lo mínimo necesario para un solo mantenedor; que Dokploy despliegue de forma autónoma desde `main`; conservar (no borrar) los mecanismos anteriores como rutas opcionales/legadas.

**Non-Goals**: no se toca ningún comportamiento de la aplicación (`src/`); no se reconfigura Dokploy en sí (activar su Auto Deploy nativo es un paso manual del operador, fuera de este repositorio); no se implementa branch protection en `main` (se documenta como recomendación operativa, no como código).

## Decisions

### 1. `compose.dokploy.yaml` construye (`build:`), como `compose.prod.yaml`
**Por qué**: elimina la necesidad de un job `publish` en GitHub Actions y de un registro de imágenes intermedio. **Alternativa descartada**: mantener `image:` pero apuntar al alias mutable `-main` — exactamente lo que `production-deployment-dokploy` rechazó a propósito por perder trazabilidad; aceptamos esa pérdida aquí a cambio de simplicidad, ya no reconstruyendo esa misma imagen inmutable.

### 2. `ci.yml` sigue siendo el único gate obligatorio; `docker-build` pasa a correr siempre
**Por qué**: con Dokploy construyendo directamente desde `main`, `ci.yml`'s `docker-build` (mismos targets `runner`/`migrator`, mismo Dockerfile) es la única validación pre-merge de que ese build va a funcionar en el VPS. Antes estaba condicionado por `paths-filter`; ahora siempre corre porque cualquier PR puede tocar código que rompa el build de producción sin tocar los paths antes vigilados (`Dockerfile`, `compose*.yaml`, `package.json`, etc.) — por ejemplo, un cambio en `src/payload/payload.config.ts` que rompa el build sin tocar ninguno de esos archivos.

### 3. `release.yml` pasa a `workflow_dispatch`, jobs legados detrás de un input booleano
**Por qué**: conservar (no borrar) el mecanismo de publish/deploy por si se necesita volver a él, sin que corra por accidente. **Alternativa descartada**: borrar los jobs `publish`/`deploy`/`provenance` — rechazada explícitamente por decisión del usuario (prefiere mecanismos reversibles, no eliminados).

### 4. Rollback por defecto: reversión de árbol vía git, no por imagen
**Por qué**: sin imágenes inmutables por SHA en el camino normal, no hay qué re-desplegar por tag. `git checkout <sha> -- .` + un commit nuevo (`revert: rollback to <sha> (...)`) dejan el árbol de `main` igual al commit bueno sin reescribir historia ni forzar push — Dokploy reconstruye solo al ver el nuevo push. **Alternativa descartada**: `git revert` commit-por-commit del rango completo — más fiel a la intención de "deshacer cada commit", pero fràgil ante conflictos cuando el rango incluye merges o cambios superpuestos; el enfoque de "árbol idéntico al commit bueno" es determinista independientemente de cuántos commits haya en medio.

**Corrección tras revisión con el usuario**: el plan original quitaba `environment: production` de ambos jobs de `rollback.yml`. Se descubrió que `DOKPLOY_URL`/`DOKPLOY_TOKEN`/`DOKPLOY_COMPOSE_ID` viven scoped al Environment `production` en GitHub (no a nivel de repositorio) — un job sin `environment:` declarado no puede leerlos. `rollback-image` (que sí los necesita) recuperó `environment: production`, lo que también reintroduce su aprobación manual — aceptado, es consistente con ser la ruta legada "cuidadosa". `rollback-git` no necesita esos secrets (solo `vars.PRODUCTION_URL`, que no es sensible), así que mantiene la ausencia de `environment:` y de aprobación — pero requiere que `PRODUCTION_URL` se mueva a Repository variable (tarea pendiente del operador, ver tasks.md §7.3).

### 5. Verificación post-deploy pierde precisión de SHA exacto
**Por qué**: `GIT_SHA` no se puede pasar como build-arg en un build disparado por Dokploy sin que el propio Dokploy lo exponga (no confirmado en su documentación disponible), y `.dockerignore` excluye `.git` del build context. Se acepta degradar la señal de "el sitio quedó sirviendo exactamente este commit" a "el sitio volvió a responder" — ver Risks abajo.

### 6. Nueva capacidad `deployment-automation` en vez de una delta sobre la del change anterior
**Por qué**: la spec `deployment-automation` de `production-deployment-dokploy` nunca se sincronizó a `openspec/specs/` (ese change sigue sin archivar), así que no existe una spec aceptada contra la cual escribir una delta. Este change la introduce como `ADDED Requirements` reflejando el contrato ya vigente tras la implementación.

## Risks / Trade-offs

- **[Riesgo] Sin aprobación humana, un merge a `main` con la suite de PR ya en verde pero con un bug no cubierto por tests despliega directo a producción.** → Mitigación parcial: `ci.yml` sigue siendo gate obligatorio de PR; se recomienda (fuera de este repositorio) activar branch protection en `main` exigiendo esos checks. Aceptado como trade-off consciente de un proyecto de un solo mantenedor.
- **[Riesgo] `/api/health` ya no reporta un `sha` fiable en el camino normal** → Documentado en `docs/DEPLOYMENT.md`; para confirmar el commit real desplegado, revisar el dashboard/logs de Dokploy.
- **[Riesgo] El rollback por git no revierte el esquema de base de datos** (ya existía en el modelo anterior, sin cambios) → Se mantiene la regla de decisión existente en `docs/OPERATIONS.md` (migraciones forward-only, dump + fix-forward para esquema incompatible).
- **[Riesgo] `scripts/dokploy-deploy.ts`/`dokploy-client.ts`/`dokploy-env.ts` quedan sin caller en el camino normal** → Aceptado por decisión explícita del usuario; documentado como código legado vivo, no código muerto sin dueño.

## Migration Plan

1. Reemplazar `compose.dokploy.yaml` (`image:` → `build:`).
2. Simplificar `ci.yml` (quitar el `paths-filter` de `docker-build`).
3. Convertir `release.yml` a `workflow_dispatch`, gatear `publish`/`deploy`/`provenance` tras `publish_and_deploy`.
4. Repropósito de `rollback.yml`: agregar estrategia `git` como default, conservar `image` como legado.
5. Actualizar `docs/DEPLOYMENT.md`/`docs/OPERATIONS.md`.
6. Operativo, manual, fuera de este repositorio: activar Auto Deploy nativo de Dokploy sobre `main` en su dashboard; opcionalmente, branch protection en `main`.

**Rollback de este propio change** (si la simplificación resultara insatisfactoria): revertir los commits de este change — `compose.dokploy.yaml` vuelve a `image:`, `release.yml` vuelve a disparar en `push: main`, `rollback.yml` vuelve a exigir solo imágenes GHCR. No hay migración de datos ni de esquema involucrada.

## Open Questions

Ninguna — las decisiones de arquitectura (estrategia de deploy, estrategia de rollback, alcance del gate obligatorio, aprobación manual, destino del código huérfano) ya fueron confirmadas explícitamente con el usuario antes de implementar.
