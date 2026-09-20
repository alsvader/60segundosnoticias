Nota: este change documenta una implementación ya realizada (guiada por un plan de Claude Code aprobado por el usuario antes de crear este change de OpenSpec). Las tareas quedan marcadas como completadas, cada una con cómo se verificó.

## 1. `compose.dokploy.yaml`

- [x] 1.1 Reemplazar `image: ${RUNNER_IMAGE}`/`${MIGRATOR_IMAGE}` por `build:` (context `.`, `Dockerfile`, targets `migrator`/`runner`), con los mismos build-args que `compose.prod.yaml` (`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`) — verificado con `docker compose -f compose.dokploy.yaml config -q` (variables dummy) sin errores de sintaxis.
- [x] 1.2 Mantener las diferencias reales con `compose.prod.yaml` (sin `ports:`, red externa `dokploy-network`, sin servicio `db`) y reescribir el comentario de cabecera para reflejar el nuevo modelo, incluida la limitación de `GIT_SHA`/`/api/health` — verificado por lectura del archivo final.

## 2. `.github/workflows/ci.yml`

- [x] 2.1 Quitar la condición `paths-filter` de `docker-build` para que corra siempre como dry-run del build real de Dokploy — verificado con `python3 -c "import yaml; yaml.safe_load(...)"` sin errores.
- [x] 2.2 Actualizar el comentario de cabecera del workflow para reflejar que ya no reutiliza `release.yml` como calificación FULL obligatoria.

## 3. `.github/workflows/release.yml`

- [x] 3.1 Quitar el trigger `push: branches: [main]`, dejar solo `workflow_dispatch` con input `publish_and_deploy` (boolean, default `false`) — verificado con validación YAML.
- [x] 3.2 Gatear `publish`, `deploy` y `provenance` con `if: inputs.publish_and_deploy`, sin eliminarlos — verificado por lectura del archivo final.
- [x] 3.3 Dejar `ci-gates`/`e2e-full`/`visual`/`docker-smoke`/`lighthouse` sin condición nueva, como QA extendida manual.

## 4. `.github/workflows/rollback.yml`

- [x] 4.1 Agregar input `strategy` (`git` default, `image` legado) — verificado con validación YAML.
- [x] 4.2 Implementar el job `rollback-git`: valida que el commit pertenece al historial de `main`, `git checkout <sha> -- .` + commit + push sin force-push, espera a que el sitio vuelva a responder, corre `scripts/smoke-production.ts` — verificado por lectura del archivo final y validación YAML (no se ejecutó en un entorno real como parte de este change).
- [x] 4.3 Conservar el job `rollback-image` (verificación de manifests GHCR + `scripts/dokploy-deploy.ts`) sin cambios de comportamiento.
- [x] 4.4 Quitar el `environment: production` de `rollback-git` únicamente. Corrección tras revisión con el usuario: `DOKPLOY_URL`/`DOKPLOY_TOKEN`/`DOKPLOY_COMPOSE_ID` están scoped al Environment `production` en GitHub, así que `rollback-image` SHALL conservar `environment: production` (sin él, esos secrets no se resuelven y el job falla) — esto reintroduce la aprobación manual solo para esa ruta legada, consistente con ser "el proceso cuidadoso anterior". `rollback-git` no necesita esos secrets, solo `vars.PRODUCTION_URL` — verificado por lectura del archivo final y validación YAML.
- [x] 4.5 Documentar en `docs/OPERATIONS.md` el prerrequisito operativo: `PRODUCTION_URL` SHALL vivir como Repository variable (no Environment variable), o `rollback-git` no puede leerla al no declarar `environment:`.

## 5. Documentación

- [x] 5.1 Actualizar `docs/DEPLOYMENT.md` (§"Imagen de producción", §"Secuencia de despliegue", troubleshooting de `/api/health`, §"Fuera de alcance") para el nuevo modelo por defecto y el legado.
- [x] 5.2 Actualizar `docs/OPERATIONS.md` (§"Despliegue", §"Cómo ejecutar un rollback", §"Primer arranque") de la misma forma.

## 6. OpenSpec

- [x] 6.1 Crear este change (`simplify-cicd-dokploy-native-deploy`) con `proposal.md`, `specs/deployment-automation/spec.md` (nueva capacidad, nunca sincronizada desde `production-deployment-dokploy`) y `design.md`, en vez de editar in-place el change anterior ya implementado.

## 7. Pendiente del operador (fuera de este repositorio, no verificable desde el código)

- [ ] 7.1 Activar el Auto Deploy nativo de Dokploy sobre `main` para el servicio Compose correspondiente, en su dashboard.
- [ ] 7.2 Evaluar activar branch protection en `main` exigiendo los checks de `ci.yml` antes de mergear, dado que ya no hay aprobación manual antes de producción.
- [ ] 7.3 Mover `PRODUCTION_URL` de Environment variable (`production`) a Repository variable en GitHub (Settings → Secrets and variables → Actions → Variables) — requisito para que `rollback-git` funcione, confirmado con el usuario que hoy vive solo a nivel de Environment.
- [ ] 7.4 Decidir si conservar o eliminar el Environment `production` de GitHub: SHALL conservarse mientras se quiera seguir usando `release.yml` (`publish_and_deploy: true`) o `rollback.yml` (`strategy: image`), porque ambos siguen leyendo `DOKPLOY_URL`/`DOKPLOY_TOKEN`/`DOKPLOY_COMPOSE_ID` scoped a ese Environment.
