## Why

La Fase 11 (`testing-qa-performance`, ya archivada) dejó publicándose de verdad dos imágenes inmutables por SHA (`runner`/`migrator`) en GHCR cada vez que la calificación FULL pasa en `main`, pero el job `provenance` todavía escribe literalmente "Dokploy deployment: no aplicado todavía en esta fase". `compose.dokploy.yaml` ya define el contrato de despliegue (solo `image:`, nunca `build:`) pero ningún workflow lo invoca todavía. Esta fase cierra ese tramo final: que una imagen ya calificada llegue sola a producción en el VPS con Dokploy, que se verifique que *esa* imagen quedó viva (no la anterior), y que quede registrada — más las garantías operativas que exige el §69.1 del Master Spec para la base de datos de producción: respaldo periódico fuera del VPS y una restauración verificada de verdad.

## What Changes

- Nuevo job `deploy` en `release.yml`, entre `publish` y `provenance`, detenido en el GitHub Environment `production` esperando aprobación humana; entrega el env de Dokploy reescribiendo únicamente las claves `RUNNER_IMAGE`/`MIGRATOR_IMAGE` con los tags inmutables por SHA que produjo `publish`, dispara el despliegue, y exige tres señales de finalización (estado de Dokploy, SHA vivo en `/api/health`, smoke público) antes de considerarlo exitoso.
- `provenance` deja de imprimir el placeholder y registra el resultado real del despliegue de esa corrida.
- Nuevo workflow `rollback.yml` (`workflow_dispatch`, mismo gate de aprobación) que reutiliza el mismo mecanismo de entrega para desplegar una imagen inmutable ya construida por un SHA anterior — nunca reconstruye.
- PostgreSQL sale de `compose.dokploy.yaml` (se eliminan el servicio `db` y el volumen `postgres_data`) y pasa a ser un servicio de base de datos gestionado por Dokploy, con respaldos programados a S3 y restauración como funciones nativas de la plataforma. El spec `production-deployment` ya exigía que `DATABASE_URI` funcionara sin un servicio `db` en el Compose, así que esta es la configuración que ese requisito anticipaba.
- Runbooks operativos nuevos: restauración verificada de backups, decisión de rollback seguro vs. fix-forward, y primer arranque (primer Admin + `seed:initial` + reindex de Search) sin depender de un script "de un solo uso y luego borrarlo".
- **BREAKING**: ninguno — no se modifica comportamiento de desarrollo, `compose.yaml`, ni el esquema de datos.

## Capabilities

### New Capabilities

- `deployment-automation`: el handoff automatizado entre CI (imagen ya calificada en GHCR) y Dokploy — reescritura segura del env, disparo del despliegue, verificación de que el SHA correcto quedó sirviendo tráfico, smoke post-despliegue, rollback por SHA, y el registro de provenance del despliegue real.
- `production-operations`: las garantías operativas de la base de datos de producción, con independencia de quién las provea — backups periódicos cifrados con retención, un drill de restauración verificado, una regla de decisión documentada para rollback de aplicación, y un procedimiento reproducible de primer arranque (primer Admin, siembra inicial, reindex de Search).

### Modified Capabilities

- `production-deployment`: se agregan requisitos de que la entrega a producción ocurre exclusivamente mediante imágenes inmutables por SHA ya calificadas (nunca un alias mutable como `-main`) y que ese despliegue queda detenido detrás de una aprobación humana explícita antes de alcanzar el VPS.

## Impact

- `.github/workflows/release.yml` (nuevo job `deploy`; `provenance` deja de tener un placeholder)
- `.github/workflows/rollback.yml` (nuevo)
- `Dockerfile` (stage `runner`: `GIT_SHA` como metadata de imagen)
- `src/app/api/health/route.ts` (expone el SHA vivo)
- `src/lib/deploy/dokploy-env.ts` (nuevo, más su test)
- `scripts/dokploy-deploy.ts`, `scripts/smoke-production.ts`, `scripts/create-admin.ts` (nuevos)
- `compose.dokploy.yaml` (se elimina el servicio `db` y el volumen `postgres_data`; PostgreSQL pasa a Dokploy)
- `docs/OPERATIONS.md` (nuevo), `docs/DEPLOYMENT.md`, `README.md`, `docs/TESTING.md`, `docs/SEARCH.md`
- `openspec/specs/production-deployment/spec.md`, `openspec/specs/deployment-automation/spec.md` (nuevo), `openspec/specs/production-operations/spec.md` (nuevo)
- Fuera de alcance: aprovisionar el VPS real, TLS/dominio/Traefik, Dokploy Auto Deploy sobre `push`, rollback automático, rollback de base de datos.
