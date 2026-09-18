## 2. Hacer verificable qué SHA está vivo

- [ ] 2.1 Agregar `ARG GIT_SHA` + `ENV GIT_SHA=$GIT_SHA` al final del stage
  `runner` de `Dockerfile`, después de todos los `COPY`. Verificar con
  `docker build --target runner --build-arg GIT_SHA=abc123 .` seguido de
  `docker run --rm <imagen> printenv GIT_SHA` devolviendo `abc123`, y
  confirmar que el caché de la capa `pnpm build` del stage `builder` no
  se invalida al variar solo `GIT_SHA` (comparar `docker history`).
- [ ] 2.2 Agregar `sha: process.env.GIT_SHA ?? null` y
  `Cache-Control: no-store` a la respuesta de
  `src/app/api/health/route.ts`, sin tocar el esquema zod de
  `src/lib/env/index.ts`. Verificar arrancando la imagen del paso 2.1 y
  confirmando con `curl` que `/api/health` devuelve `"sha":"abc123"` y el
  encabezado `Cache-Control: no-store`.
- [ ] 2.3 Agregar `GIT_SHA=${{ github.sha }}` a los `build-args` del paso
  "Build and push runner" en el job `publish` de `.github/workflows/release.yml`.
  Verificar con un `act`/dry-run de parseo de YAML o revisión manual de
  que el build-arg llega al `docker/build-push-action` del target
  `runner`, no del `migrator`.
- [ ] 2.4 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.

## 3. Reescritura segura del env de Dokploy

- [ ] 3.1 Crear `src/lib/deploy/dokploy-env.ts`: función pura que recibe
  el blob de env y los nuevos valores de `RUNNER_IMAGE`/`MIGRATOR_IMAGE`,
  reemplaza en sitio con el patrón anclado `^([ \t]*(?:export[ \t]+)?RUNNER_IMAGE[ \t]*=)[^\r\n]*$`
  (análogo para `MIGRATOR_IMAGE`) con flag `gm`, preservando CRLF y todo
  lo demás verbatim, agrega la clave al final si está ausente, y
  reporta el conteo de reemplazos. Verificar con
  `pnpm test src/lib/deploy/dokploy-env.test.ts`.
- [ ] 3.2 Agregar validación del valor nuevo contra
  `^[a-z0-9.\-_/]+:(runner|migrator)-[0-9a-f]{40}$`, rechazando cualquier
  valor que no cumpla la forma (incluyendo `runner-main`). Verificar con
  un caso de prueba que confirma el rechazo explícito de `runner-main`.
- [ ] 3.3 Escribir `src/lib/deploy/dokploy-env.test.ts` colocado junto al
  módulo, cubriendo: CRLF preservado, clave duplicada, clave ausente
  (se agrega al final), un comentario cuyo texto parece la clave, un
  `=` dentro de otro valor, y el rechazo de `runner-main`. Verificar que
  el archivo queda incluido por el glob de `test:unit` y que
  `pnpm test:unit` lo ejecuta.
- [ ] 3.4 Crear `scripts/dokploy-deploy.ts` (Node ejecutando `.ts`
  directo, mismo patrón que `scripts/run-migration-chain.ts`, sin
  dependencias nuevas) implementando el flujo `compose.one` → enmascarar
  con `::add-mask::` cada valor de más de 4 caracteres recibido (salvo
  las dos claves de imagen) → reescribir con `dokploy-env.ts` →
  `compose.update` → re-leer y comparar byte a byte contra lo intentado,
  abortando antes de `compose.deploy` si no coincide → `compose.deploy`.
  Verificar con una ejecución en seco contra un mock/fixture local del
  API de Dokploy que confirma que el blob completo nunca se imprime
  (solo su `sha256`) y que el token se lee de una variable de entorno,
  nunca de `process.argv`.
- [ ] 3.5 Agregar una aserción explícita en `dokploy-deploy.ts` de que el
  payload enviado a `compose.deploy` nunca incluye `freshVolumes`.
  Verificar con un test que falla si alguien reintroduce ese campo.
- [ ] 3.6 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.

## 4. Saber cuándo terminó el despliegue

- [ ] 4.1 En `scripts/dokploy-deploy.ts`, agregar el sondeo de estado vía
  `compose.one` (cada 5s el primer minuto, luego cada 10s, tope 15 min),
  registrando el estado previo a `compose.deploy` y exigiendo una
  transición de estado — un estado ausente o desconocido se trata como
  "sigue desplegando". Mantener el nombre del campo de estado en una
  sola constante al inicio del archivo. Verificar con un test que
  simula una secuencia de estados y confirma que un `done` repetido sin
  transición no se reporta como éxito.
- [ ] 4.2 Agregar el sondeo de SHA vivo contra `$PRODUCTION_URL/api/health`
  exigiendo HTTP 200 y `body.sha === github.sha` en 3 coincidencias
  consecutivas separadas 5s, tope 10 min. Verificar con un test que
  simula respuestas alternando el SHA viejo y el nuevo, confirmando que
  no se reporta éxito hasta las 3 coincidencias consecutivas del SHA
  nuevo.
- [ ] 4.3 Crear `scripts/smoke-production.ts`: `GET` sobre `/api/health`,
  `/`, una Category, un Article, `/buscar`, `/admin/login`, descubriendo
  Category/Article desde `/sitemap.xml` con override vía
  `vars.SMOKE_CATEGORY_PATH`/`SMOKE_ARTICLE_PATH`. Verificar ejecutando
  el script contra un servidor de desarrollo local y confirmando que
  reporta éxito en las 6 rutas.
- [ ] 4.4 Implementar la clasificación de fallas (release anterior sigue
  sirviendo / sitio caído / desplegado pero el SHA nuevo nunca quedó
  vivo) y el resumen (`if: always()`) con clase de falla, SHA, ambos
  tags, `deploymentId`, el SHA vivo antes del intento, enlace a los logs
  de Dokploy, la frase explícita de que no se intentó rollback, y el
  comando exacto para ejecutarlo. Verificar con un test por cada rama de
  clasificación usando fixtures de las tres señales.
- [ ] 4.5 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.

## 5. `release.yml`: job `deploy`, y `rollback.yml`

- [ ] 5.1 Agregar el job `deploy` a `.github/workflows/release.yml` entre
  `publish` y `provenance`, con `needs: publish`,
  `environment: { name: production, url: ${{ vars.PRODUCTION_URL }} }`,
  `permissions: { contents: read }`, consumiendo
  `needs.publish.outputs.runner-tag`/`migrator-tag` verbatim. Verificar
  con un linter/parseo de YAML (`actionlint` o equivalente) y revisión
  manual de que `provenance` sigue con `needs: publish` (no `needs: deploy`).
- [ ] 5.2 Reusar el `concurrency: group: release, cancel-in-progress: false`
  ya existente para el job `deploy`. Verificar leyendo el YAML resultante.
- [ ] 5.3 Reemplazar la línea placeholder de "Dokploy deployment" en el
  paso "Record release provenance" del job `provenance` por una que
  apunte al resultado real del job `deploy` de esa corrida. Verificar
  con una lectura del step summary generado por un dry-run o por
  revisión manual del script.
- [ ] 5.4 Crear `.github/workflows/rollback.yml`: `workflow_dispatch` con
  inputs `sha` y `reason`, `environment: production`, mismo
  `concurrency: group: release`; verifica que ambos manifests (`runner`
  y `migrator`) existan en GHCR para el SHA solicitado antes de
  desplegar, reutiliza `dokploy-deploy.ts` y `smoke-production.ts`, y
  nunca reconstruye. Verificar con `actionlint`/parseo de YAML y una
  ejecución en seco del chequeo de existencia de manifiestos contra un
  SHA inventado, confirmando que se rechaza.
- [ ] 5.5 Confirmar que el resumen de `rollback.yml` advierte
  explícitamente que rollback de aplicación no es rollback de base de
  datos. Verificar por lectura del script generador del resumen.

## 6. Operación: backups, rollback, primer arranque

- [ ] 6.1 Confirmar si la UI de backups nativa de Dokploy puede
  respaldar un Postgres que vive dentro de un stack de Compose, o si su
  flujo solo apunta a *database services* administrados directamente
  por Dokploy; reportar el resultado en vez de decidirlo unilateralmente.
  Verificar con evidencia de la documentación/UI de la instancia del
  operador citada en el reporte.
- [ ] 6.2 Agregar el servicio `backup` a `compose.dokploy.yaml`: imagen
  pública `pg_dump`→gzip→gpg→S3 fijada por digest,
  `depends_on: db: condition: service_healthy`, alcanzando `db` por la
  red interna sin publicar 5432, corrida diaria 03:00
  America/Mexico_City, retención 30 días, destino un bucket R2 separado
  del de Media con token propio. Verificar con
  `docker compose -f compose.dokploy.yaml config` validando sintaxis y
  confirmando que el servicio no publica ningún puerto.
- [ ] 6.3 Documentar que el cifrado combina SSE del bucket más una
  passphrase gpg que debe vivir tanto en Dokploy como en el gestor de
  contraseñas del operador. Verificar por revisión manual de
  `docs/OPERATIONS.md` (sección 8).
- [ ] 6.4 Documentar el procedimiento de drill de restauración: se
  ejecuta en la laptop del operador (nunca en el VPS), con proyecto
  Compose aislado `-p 60segundosnoticias-restore`; aserciones: última
  fila de `payload_migrations` esperada, conteos de
  `posts`/`categories`/`users`/`search` > 0, y arrancar `runner-<sha>`
  contra la base restaurada confirmando `/api/health` 200 y
  `/buscar?q=<palabra conocida>` con resultados. Cadencia: una vez antes
  de declarar producción lista, luego trimestral. Verificar por
  revisión manual del runbook en la sección 8.
- [ ] 6.5 Documentar la regla de decisión de rollback:
  `git diff --name-only <bueno> <malo> -- src/payload/migrations/` vacío
  o solo aditivo ⇒ rollback de app seguro; cualquier
  `DROP`/`RENAME`/`NOT NULL` sobre algo que el código viejo lee ⇒ no
  seguro ⇒ dump inmediato y fix-forward, nunca `payload migrate:down` en
  producción. Verificar por revisión manual del runbook en la sección 8.
- [ ] 6.6 Crear la tabla de bitácora de despliegues (fecha, SHA, ¿incluye
  migraciones?, ¿retrocompatible?) y la bitácora de restauraciones
  (fecha, archivo, conteos) dentro de `docs/OPERATIONS.md`. Verificar
  por revisión manual de que ambas tablas existen con sus columnas.
- [ ] 6.7 Crear `scripts/create-admin.ts`: idempotente (no-op si ya
  existe cualquier usuario), lee credenciales de variables de entorno,
  usa la Local API de Payload con `overrideAccess: true` (mismo patrón
  que `src/payload/seed/dev.ts`). Verificar con
  `docker compose run --rm migrate pnpm payload run scripts/create-admin.ts`
  contra una base de pruebas vacía, confirmando que crea el usuario, y
  una segunda corrida confirmando que no crea un segundo usuario.
- [ ] 6.8 Documentar el orden de primer arranque: desplegar → `migrate`
  sale 0 → `/api/health` 200 → crear Admin → `seed:initial` (nunca
  `seed:dev`) → publicar contenido real → Reindex de Search en
  `/admin/collections/search` → verificar que `/buscar` devuelve →
  smoke público. Verificar por revisión manual del runbook en la
  sección 8, confirmando que cada comando citado existe en el
  repositorio.
- [ ] 6.9 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.

## 7. Verificación real (bloqueada por los prerrequisitos del operador)

- [ ] 7.1 Confirmar contra el Swagger de la instancia real de Dokploy
  del operador: el nombre y los valores del campo de estado de
  `compose.one`, si `compose.deploy` devuelve un id de despliegue, y si
  `compose.update` acepta un patch parcial `{composeId, env}` o exige el
  objeto completo. Actualizar la constante correspondiente en
  `scripts/dokploy-deploy.ts` si el nombre confirmado difiere del
  supuesto. Verificar citando la respuesta real del Swagger.
- [ ] 7.2 Ejecutar un despliegue real de punta a punta desde `main`,
  aprobando el gate de `production`. Verificar con evidencia real:
  `/api/health` devuelve el SHA esperado, los 6 endpoints de
  `smoke-production.ts` responden con éxito, y el step summary de
  `provenance` registra el despliegue exitoso.
- [ ] 7.3 Ejecutar un rollback real a un SHA anterior vía
  `rollback.yml`. Verificar con la misma evidencia que 7.2, más
  confirmación de que el SHA vivo tras el rollback corresponde al SHA
  solicitado.
- [ ] 7.4 Ejecutar un restore verificado contra un destino desechable
  siguiendo el runbook de la sección 6.4. Verificar con las aserciones
  de datos y de búsqueda descritas ahí, y registrar el resultado en la
  bitácora de restauraciones de `docs/OPERATIONS.md`.
- [ ] 7.5 No marcar ninguna tarea de esta sección como completa sin la
  evidencia real correspondiente adjunta o citada.

## 8. Documentación

- [ ] 8.1 Crear `docs/OPERATIONS.md` (en español) con los runbooks de
  backup, restauración, rollback y primer arranque, más las dos
  bitácoras (despliegues y restauraciones). Verificar que cada comando
  citado existe en el repositorio (`grep`/revisión manual) y que el
  documento no duplica contenido estable de `docs/DEPLOYMENT.md`.
- [ ] 8.2 Reescribir en `docs/DEPLOYMENT.md`: `## Secuencia de
  despliegue` (ya no son pasos manuales de `docker build`/`docker run`),
  `## Imagen de producción` (el build ocurre en Actions),
  `## Topología objetivo (V1)`, `## compose.prod.yaml` +
  `### Aislamiento de proyecto de Compose` (agregar el namespace de
  `compose.dokploy.yaml`), `## Primer usuario Admin` (referenciar
  `scripts/create-admin.ts` en vez del script de un solo uso), y
  `## Fuera de alcance de esta fase (Phase 12)` con sus bullets
  actualizados u obsoletos. Enlazar a `OPERATIONS.md` en vez de
  duplicar. Verificar por revisión manual sección por sección.
- [ ] 8.3 Actualizar en `docs/DEPLOYMENT.md` la sección
  `## Verificación / troubleshooting` y el contrato de `/api/health`
  para documentar el campo `sha`. Verificar contra el comportamiento
  real implementado en la sección 2.
- [ ] 8.4 Actualizar `README.md`: `## Build y arranque en producción`,
  `## Health check` (campo `sha`), `## Referencias de documentación`
  (agregar `OPERATIONS.md`; `DEPLOYMENT.md` deja de describirse como
  "Phase 10"). Verificar que ningún comando, script, puerto o variable
  de entorno citado sea inventado.
- [ ] 8.5 Actualizar `docs/TESTING.md`: la sección de niveles de CI debe
  reflejar que `release.yml` ya no termina en `publish`/`provenance`,
  sino que continúa con `deploy`. Verificar por revisión manual.
- [ ] 8.6 Actualizar `docs/SEARCH.md` enlazando el reindex de Search
  desde el runbook de primer arranque de `docs/OPERATIONS.md`. Verificar
  por revisión manual del enlace.
- [ ] 8.7 Actualizar el encabezado de `compose.dokploy.yaml` para que
  deje de decir que nada lo invoca todavía. Verificar por revisión
  manual del comentario actualizado.
- [ ] 8.8 Ejecutar `graphify update .` para reflejar los archivos nuevos
  y modificados de este change. Verificar con
  `graphify query "production-deployment-dokploy"` mostrando los nodos
  esperados.
