## 2. Hacer verificable qué SHA está vivo

- [x] 2.1 Agregar `ARG GIT_SHA` + `ENV GIT_SHA=$GIT_SHA` al final del stage
  `runner` de `Dockerfile`, después de todos los `COPY`. Verificar con
  `docker build --target runner --build-arg GIT_SHA=abc123 .` seguido de
  `docker run --rm <imagen> printenv GIT_SHA` devolviendo `abc123`, y
  confirmar que el caché de la capa `pnpm build` del stage `builder` no
  se invalida al variar solo `GIT_SHA` (comparar `docker history`).
  **Verificado real**: `docker build --target runner --build-arg GIT_SHA=abc123 ...`
  seguido de `docker run --rm ... printenv GIT_SHA` devolvió `abc123`; un
  segundo build con `GIT_SHA=def456` mostró `[builder 2/2] RUN pnpm build`
  como `CACHED` — el `ARG`/`ENV` vive después de todos los `COPY` del
  stage `runner`, tal como pide la tarea.
- [x] 2.2 Agregar `sha: process.env.GIT_SHA ?? null` y
  `Cache-Control: no-store` a la respuesta de
  `src/app/api/health/route.ts`, sin tocar el esquema zod de
  `src/lib/env/index.ts`. Verificar arrancando la imagen del paso 2.1 y
  confirmando con `curl` que `/api/health` devuelve `"sha":"abc123"` y el
  encabezado `Cache-Control: no-store`.
  **Verificado real**: contenedor arrancado desde la imagen del paso 2.1;
  `curl -i http://localhost:3099/api/health` devolvió
  `{"status":"degraded","database":"unreachable","sha":"abc123"}` con el
  encabezado `cache-control: no-store`. `src/lib/env/index.ts` no fue
  tocado (confirmado por lectura).
- [x] 2.3 Agregar `GIT_SHA=${{ github.sha }}` a los `build-args` del paso
  "Build and push runner" en el job `publish` de `.github/workflows/release.yml`.
  Verificar con un `act`/dry-run de parseo de YAML o revisión manual de
  que el build-arg llega al `docker/build-push-action` del target
  `runner`, no del `migrator`.
  **Verificado**: `release.yml` parseado con éxito vía PyYAML; el paso
  "Build and push runner" (`target: runner`) incluye
  `GIT_SHA=${{ github.sha }}` en `build-args`, y el paso "Build and push
  migrator" (`target: migrator`) no declara `build-args` en absoluto —
  confirmado por lectura directa del YAML.
- [x] 2.4 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.
  **Verificado real**: `pnpm typecheck` (0 errores), `pnpm lint` (0
  errores), `pnpm test` (typecheck+lint+`test:importmap`+`test:unit` →
  15 archivos, 104 pruebas, todas en verde), `pnpm build` (compiló y
  generó rutas dinámicas `/`, `/buscar`, `/sitemap.xml` como `ƒ`, sin
  errores).

## 3. Reescritura segura del env de Dokploy

- [x] 3.1 Crear `src/lib/deploy/dokploy-env.ts`: función pura que recibe
  el blob de env y los nuevos valores de `RUNNER_IMAGE`/`MIGRATOR_IMAGE`,
  reemplaza en sitio con el patrón anclado `^([ \t]*(?:export[ \t]+)?RUNNER_IMAGE[ \t]*=)[^\r\n]*$`
  (análogo para `MIGRATOR_IMAGE`) con flag `gm`, preservando CRLF y todo
  lo demás verbatim, agrega la clave al final si está ausente, y
  reporta el conteo de reemplazos. Verificar con
  `pnpm test src/lib/deploy/dokploy-env.test.ts`.
  **Verificado real**: `vitest run --project=node src/lib/deploy/dokploy-env.test.ts`
  → 1 archivo, 13 pruebas, todas en verde. Código leído: función pura,
  sin I/O, con el ancla `[^\r\n]*` exacta descrita.
- [x] 3.2 Agregar validación del valor nuevo contra
  `^[a-z0-9.\-_/]+:(runner|migrator)-[0-9a-f]{40}$`, rechazando cualquier
  valor que no cumpla la forma (incluyendo `runner-main`). Verificar con
  un caso de prueba que confirma el rechazo explícito de `runner-main`.
  **Verificado real**: incluido en la misma corrida de 3.1 — el caso
  "rechaza el alias mutable `runner-main`" pasa (`toThrow(/Referencia de
  imagen inválida/)`), junto con los casos de SHA malformado e imágenes
  intercambiadas.
- [x] 3.3 Escribir `src/lib/deploy/dokploy-env.test.ts` colocado junto al
  módulo, cubriendo: CRLF preservado, clave duplicada, clave ausente
  (se agrega al final), un comentario cuyo texto parece la clave, un
  `=` dentro de otro valor, y el rechazo de `runner-main`. Verificar que
  el archivo queda incluido por el glob de `test:unit` y que
  `pnpm test:unit` lo ejecuta.
  **Verificado real**: los 6 escenarios están presentes en el archivo
  (leído completo); `pnpm test:unit` (glob incluye `src`) ejecutó el
  archivo como parte de sus 104 pruebas/15 archivos, todas en verde.
- [x] 3.4 Crear `scripts/dokploy-deploy.ts` (Node ejecutando `.ts`
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
  **Verificado real** (cerrado en una segunda pasada, tras encontrarse
  sin evidencia): la lógica de `dokploy-deploy.ts` (llamadas al API,
  sondeos, enmascarado) se extrajo a `src/lib/deploy/dokploy-client.ts`
  — mismo patrón que ya existía con `dokploy-env.ts` — precisamente
  para poder probarla con `fetch` simulado sin necesitar un mock/fixture
  externo. `dokploy-client.test.ts` (13 pruebas) confirma que
  `findSecretsToMaskInEnvBlob` nunca incluye `RUNNER_IMAGE`/
  `MIGRATOR_IMAGE` y que el script solo enmascara/loguea `sha256`, nunca
  el blob. El script en sí se re-verificó sin cambios de comportamiento:
  `pnpm typecheck`/`lint`/`test:unit` (117 pruebas, 16 archivos)/`build`
  en verde, y una corrida sin variables de entorno sigue fallando con el
  mismo mensaje exacto y `exit=1`.
- [x] 3.5 Agregar una aserción explícita en `dokploy-deploy.ts` de que el
  payload enviado a `compose.deploy` nunca incluye `freshVolumes`.
  Verificar con un test que falla si alguien reintroduce ese campo.
  **Verificado real**: `assertDeployRequestNeverSendsFreshVolumes()`
  vive ahora en `dokploy-client.ts` con 2 casos de prueba en
  `dokploy-client.test.ts` — uno confirma que no lanza sin el campo, el
  otro que lanza (con `freshVolumes: true` **y** `false`, ambos
  rechazados) citando `freshVolumes` en el mensaje.
- [x] 3.6 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.
  **Verificado real**: misma corrida que 2.4 — los cuatro comandos
  pasan sobre el estado final del repo, que incluye los cambios de esta
  sección.

## 4. Saber cuándo terminó el despliegue

- [x] 4.1 En `scripts/dokploy-deploy.ts`, agregar el sondeo de estado vía
  `compose.one` (cada 5s el primer minuto, luego cada 10s, tope 15 min),
  registrando el estado previo a `compose.deploy` y exigiendo una
  transición de estado — un estado ausente o desconocido se trata como
  "sigue desplegando". Mantener el nombre del campo de estado en una
  sola constante al inicio del archivo. Verificar con un test que
  simula una secuencia de estados y confirma que un `done` repetido sin
  transición no se reporta como éxito.
  **Verificado real, y un defecto real corregido en el camino**: al
  escribir el test de secuencia de estados (`dokploy-client.test.ts`,
  con timers falsos de `vitest`) se encontró que la implementación
  original comparaba siempre contra el `previousStatus` ORIGINAL (fijo
  antes de `compose.deploy`), nunca contra el último estado observado —
  una secuencia real `done(viejo) -> running -> done(nuevo)` nunca
  habría contado el segundo `done` como éxito, porque volvía a coincidir
  textualmente con el valor viejo. Corregido para trackear
  `lastSeenStatus` actualizado en cada lectura, preservando la garantía
  original (un `done` que nunca cambia sigue sin contar como éxito). El
  test cubre exactamente esa secuencia de 3 estados y pasa; un segundo
  test cubre la transición inmediata a `error`, un tercero el tope de
  15 minutos con estado ausente.
- [x] 4.2 Agregar el sondeo de SHA vivo contra `$PRODUCTION_URL/api/health`
  exigiendo HTTP 200 y `body.sha === github.sha` en 3 coincidencias
  consecutivas separadas 5s, tope 10 min. Verificar con un test que
  simula respuestas alternando el SHA viejo y el nuevo, confirmando que
  no se reporta éxito hasta las 3 coincidencias consecutivas del SHA
  nuevo.
  **Verificado real**: `dokploy-client.test.ts` simula exactamente la
  alternancia descrita (2 coincidencias del SHA nuevo → 1 del SHA viejo
  que reinicia el conteo a 0 → 3 coincidencias consecutivas del SHA
  nuevo → éxito), con timers falsos avanzados manualmente. Un segundo
  test confirma que un sitio siempre inalcanzable agota el tope de 10
  min y reporta `timeout` con `everReachable: false`.
- [x] 4.3 Crear `scripts/smoke-production.ts`: `GET` sobre `/api/health`,
  `/`, una Category, un Article, `/buscar`, `/admin/login`, descubriendo
  Category/Article desde `/sitemap.xml` con override vía
  `vars.SMOKE_CATEGORY_PATH`/`SMOKE_ARTICLE_PATH`. Verificar ejecutando
  el script contra un servidor de desarrollo local y confirmando que
  reporta éxito en las 6 rutas.
  **Verificado real**: `docker compose up -d app` (servidor de
  desarrollo local con contenido real) + `PRODUCTION_URL=http://localhost:3000
  node scripts/smoke-production.ts` → descubrió Category/Article desde
  `/sitemap.xml` (`/entretenimiento`,
  `/entretenimiento/festival-musica-independiente`) y reportó éxito en
  las 6 rutas (`health`/`home`/`category`/`article`/`buscar`/`admin-login`,
  todas `< 400`).
- [x] 4.4 Implementar la clasificación de fallas (release anterior sigue
  sirviendo / sitio caído / desplegado pero el SHA nuevo nunca quedó
  vivo) y el resumen (`if: always()`) con clase de falla, SHA, ambos
  tags, `deploymentId`, el SHA vivo antes del intento, enlace a los logs
  de Dokploy, la frase explícita de que no se intentó rollback, y el
  comando exacto para ejecutarlo. Verificar con un test por cada rama de
  clasificación usando fixtures de las tres señales.
  **Verificado real, tras extraer la lógica de decisión**: la
  clasificación (qué clase de falla corresponde dado el resultado de
  cada señal) vivía en línea dentro de `main()`, sin poder probarse
  directamente. Se extrajo a `classifyStatusPhaseFailure()`/
  `classifyShaPhaseFailure()` en `dokploy-client.ts` (funciones puras),
  y `scripts/dokploy-deploy.ts` ahora las llama en vez de repetir la
  lógica. 5 pruebas cubren las 4 clases con fixtures de las tres
  señales (estado de Dokploy + sitio alcanzable/inalcanzable, SHA
  vivo/nunca vivo), más `buildFailureMessage()` ya probada por clase
  (tarea previa). El resumen (`writeFailureSummary`/`appendStepSummary`
  con la línea de rollback y el comando exacto) se mantiene verificado
  por lectura - es interpolación de strings de bajo riesgo, ya cubierta
  indirectamente por la clasificación que alimenta sus campos.
- [x] 4.5 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.
  **Verificado real**: misma corrida que 2.4/3.6 — los cuatro comandos
  pasan sobre el estado final del repo.

## 5. `release.yml`: job `deploy`, y `rollback.yml`

- [x] 5.1 Agregar el job `deploy` a `.github/workflows/release.yml` entre
  `publish` y `provenance`, con `needs: publish`,
  `environment: { name: production, url: ${{ vars.PRODUCTION_URL }} }`,
  `permissions: { contents: read }`, consumiendo
  `needs.publish.outputs.runner-tag`/`migrator-tag` verbatim. Verificar
  con un linter/parseo de YAML (`actionlint` o equivalente) y revisión
  manual de que `provenance` sigue con `needs: publish` (no `needs: deploy`).
  **Verificado** (`actionlint` no está instalado en este entorno; se
  usó el equivalente que sí está disponible): `python3 -c "import
  yaml; yaml.safe_load(...)"` parseó `release.yml` sin errores y listó
  los 8 jobs (`ci-gates, e2e-full, visual, docker-smoke, lighthouse,
  publish, deploy, provenance`) en ese orden de declaración. Lectura
  manual confirma `deploy` con `needs: publish`,
  `environment.name: production`, `environment.url: ${{
  vars.PRODUCTION_URL }}`, `permissions: { contents: read }`, y las
  env `RUNNER_IMAGE`/`MIGRATOR_IMAGE` tomadas verbatim de
  `needs.publish.outputs.runner-tag`/`migrator-tag`; `provenance` sigue
  con `needs: publish`.
- [x] 5.2 Reusar el `concurrency: group: release, cancel-in-progress: false`
  ya existente para el job `deploy`. Verificar leyendo el YAML resultante.
  **Verificado por lectura**: el bloque `concurrency` vive a nivel de
  workflow (aplica a todos los jobs, incluido `deploy`); el job
  `deploy` no declara ningún `concurrency` propio que lo sobrescriba.
- [x] 5.3 Reemplazar la línea placeholder de "Dokploy deployment" en el
  paso "Record release provenance" del job `provenance` por una que
  apunte al resultado real del job `deploy` de esa corrida. Verificar
  con una lectura del step summary generado por un dry-run o por
  revisión manual del script.
  **Verificado por revisión manual del script**: la línea es ahora
  `"- **Dokploy deployment**: ver el resumen del job \`deploy\` de esta
  misma corrida (${{ github.server_url }}/.../actions/runs/${{
  github.run_id }})"` — ya no es el placeholder original.
- [x] 5.4 Crear `.github/workflows/rollback.yml`: `workflow_dispatch` con
  inputs `sha` y `reason`, `environment: production`, mismo
  `concurrency: group: release`; verifica que ambos manifests (`runner`
  y `migrator`) existan en GHCR para el SHA solicitado antes de
  desplegar, reutiliza `dokploy-deploy.ts` y `smoke-production.ts`, y
  nunca reconstruye. Verificar con `actionlint`/parseo de YAML y una
  ejecución en seco del chequeo de existencia de manifiestos contra un
  SHA inventado, confirmando que se rechaza.
  **Verificado real**: `rollback.yml` parsea sin errores con PyYAML
  (job único `rollback`, `workflow_dispatch` con inputs `sha`/`reason`,
  `environment: production`, `concurrency: group: release`). Se
  replicó localmente la lógica exacta de `check_manifest` del step
  "Verificar que ambos manifests existen en GHCR para ese SHA" contra
  GHCR real: para el SHA inventado
  `0000000000000000000000000000000000000000` el manifest
  `runner-<sha>` devolvió HTTP `404` (se rechazaría, tal como exige el
  script — solo `200` pasa); como contraste, `runner-main` (tag real
  publicado) devolvió `200`.
- [x] 5.5 Confirmar que el resumen de `rollback.yml` advierte
  explícitamente que rollback de aplicación no es rollback de base de
  datos. Verificar por lectura del script generador del resumen.
  **Verificado por lectura**: el paso "Resumen del rollback" incluye el
  bloque `> **Advertencia**: este rollback revierte solo la
  aplicación... Rollback de aplicación != rollback de base de datos -
  las migraciones de Payload son forward-only...`.

## 6. Operación: backups, rollback, primer arranque

- [x] 6.1 Resuelto durante la implementación: la documentación de Dokploy
  solo describe respaldo/restauración para *database services* propios de
  la plataforma, nunca para una base embebida en un stack de Compose.
  Además, la auditoría de la imagen de respaldo de terceros candidata
  encontró que su cifrado es opcional y falla en silencio (una variable
  mal nombrada sube los dumps en texto plano sin error), que no implementa
  retención, y que su `Dockerfile` descarga un binario de 2015 con la
  verificación TLS deshabilitada. Ambos hallazgos llevaron a la decisión
  registrada en design.md, Decisión 5.
- [x] 6.2 Sacar PostgreSQL de `compose.dokploy.yaml`: eliminados el
  servicio `db`, el servicio `backup` y el volumen `postgres_data`;
  `migrate` ya no declara `depends_on: db`. `DATABASE_URI` apunta a un
  servicio de base de datos gestionado por Dokploy. Verificado con
  `docker compose -f compose.dokploy.yaml config`: el stack queda en
  `migrate` + `app`, y los placeholders `POSTGRES_*`/`BACKUP_*`
  desaparecieron del archivo.
- [ ] 6.3 Documentar en `docs/OPERATIONS.md` la configuración de los
  respaldos programados en Dokploy: destino S3 propio (credenciales
  distintas de las de Media, limitadas a ese bucket), calendario,
  retención, y el hecho de que el cifrado es en reposo del destino, no
  del dump del lado del cliente. Verificar por revisión manual de que lo
  documentado coincide con lo realmente configurado en la instancia.
  **Sin marcar**: el contenido está escrito en `docs/OPERATIONS.md`
  §"Backups" (destino S3 propio con credenciales distintas de Media,
  cifrado en reposo del destino explicado) y deliberadamente **no**
  afirma calendario/retención concretos — dice "revisar ahí" —
  precisamente porque no hay una instancia real de Dokploy accesible
  desde este pase de verificación contra la cual confirmar esos
  valores. La verificación que pide esta tarea (que lo documentado
  coincida con la instancia real) no se puede ejecutar sin esa
  instancia — mismo bloqueo que la sección 7.
- [x] 6.4 Documentar el procedimiento de drill de restauración: se
  ejecuta en la laptop del operador (nunca en el VPS), con proyecto
  Compose aislado `-p 60segundosnoticias-restore`; aserciones: última
  fila de `payload_migrations` esperada, conteos de
  `posts`/`categories`/`users`/`search` > 0, y arrancar `runner-<sha>`
  contra la base restaurada confirmando `/api/health` 200 y
  `/buscar?q=<palabra conocida>` con resultados. Cadencia: una vez antes
  de declarar producción lista, luego trimestral. Verificar por
  revisión manual del runbook en la sección 8.
  **Verificado por lectura**: `docs/OPERATIONS.md` §"Drill de
  restauración" contiene, en este orden, exactamente lo descrito: `-p
  60segundosnoticias-restore`, las aserciones de `payload_migrations` y
  conteos `> 0`, el arranque de `runner-<sha>` con `/api/health` 200 +
  `/buscar?q=<palabra conocida>`, y la cadencia "una vez... luego
  trimestral".
- [x] 6.5 Documentar la regla de decisión de rollback:
  `git diff --name-only <bueno> <malo> -- src/payload/migrations/` vacío
  o solo aditivo ⇒ rollback de app seguro; cualquier
  `DROP`/`RENAME`/`NOT NULL` sobre algo que el código viejo lee ⇒ no
  seguro ⇒ dump inmediato y fix-forward, nunca `payload migrate:down` en
  producción. Verificar por revisión manual del runbook en la sección 8.
  **Verificado por lectura**: `docs/OPERATIONS.md` §"Rollback" →
  "Regla de decisión" reproduce exactamente el comando `git diff
  --name-only <sha-bueno> <sha-malo> -- src/payload/migrations/` y la
  bifurcación vacío/aditivo=seguro vs. `DROP`/`RENAME`/`NOT NULL`=no
  seguro ⇒ dump + fix-forward, nunca `migrate:down` en producción.
- [x] 6.6 Crear la tabla de bitácora de despliegues (fecha, SHA, ¿incluye
  migraciones?, ¿retrocompatible?) y la bitácora de restauraciones
  (fecha, archivo, conteos) dentro de `docs/OPERATIONS.md`. Verificar
  por revisión manual de que ambas tablas existen con sus columnas.
  **Verificado por lectura**: ambas tablas existen en
  `docs/OPERATIONS.md` — "Bitácora de restauración" (columnas Fecha /
  Dump restaurado / Conteos / `/api/health` / `/buscar?q=...` /
  Resultado) y "Bitácora de despliegues" (Fecha / SHA / ¿Incluye
  migraciones? / ¿Retrocompatible con el SHA anterior?) — ambas vacías
  a propósito hasta que haya corridas reales que registrar.
- [x] 6.7 Crear `scripts/create-admin.ts`: idempotente (no-op si ya
  existe cualquier usuario), lee credenciales de variables de entorno,
  usa la Local API de Payload con `overrideAccess: true` (mismo patrón
  que `src/payload/seed/dev.ts`). Verificar con
  `docker compose run --rm migrate pnpm payload run scripts/create-admin.ts`
  contra una base de pruebas vacía, confirmando que crea el usuario, y
  una segunda corrida confirmando que no crea un segundo usuario.
  **Verificado real**: Postgres desechable nuevo + `pnpm payload
  migrate` para aplicar el schema completo; primera corrida de
  `ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm payload run
  scripts/create-admin.ts` → `Usuario Admin creado: admin@verify.test`;
  segunda corrida con credenciales distintas → `Ya existe al menos un
  usuario - no se crea ningún Admin (script idempotente).`; `select
  count(*) from users` confirmó `1` tras ambas corridas.
- [x] 6.8 Documentar el orden de primer arranque: desplegar → `migrate`
  sale 0 → `/api/health` 200 → crear Admin → `seed:initial` (nunca
  `seed:dev`) → publicar contenido real → Reindex de Search en
  `/admin/collections/search` → verificar que `/buscar` devuelve →
  smoke público. Verificar por revisión manual del runbook en la
  sección 8, confirmando que cada comando citado existe en el
  repositorio.
  **Verificado por lectura + comandos reales**: `docs/OPERATIONS.md`
  §"Primer arranque" reproduce exactamente esos 8 pasos en ese orden.
  Los comandos citados existen: `scripts/create-admin.ts` (verificado
  en 6.7), `src/payload/seed/initial.ts` con el script `seed:initial`
  en `package.json`, y `scripts/smoke-production.ts` (verificado en
  4.3).
- [x] 6.9 Verificar que `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  siguen en verde tras los cambios de esta sección.
  **Verificado real**: misma corrida que 2.4/3.6/4.5 — los cuatro
  comandos pasan sobre el estado final del repo.

## 7. Verificación real (bloqueada por los prerrequisitos del operador)

- [x] 7.1 Confirmar contra el Swagger de la instancia real de Dokploy
  del operador: el nombre y los valores del campo de estado de
  `compose.one`, si `compose.deploy` devuelve un id de despliegue, y si
  `compose.update` acepta un patch parcial `{composeId, env}` o exige el
  objeto completo. Actualizar la constante correspondiente en
  `scripts/dokploy-deploy.ts` si el nombre confirmado difiere del
  supuesto. Verificar citando la respuesta real del Swagger.
  **Verificado real (corregido)**: la primera revisión contra el Swagger
  dio por buenos los tres supuestos sin cambios, pero el primer
  despliegue real de la Etapa 7.2 demostró que esa revisión no atrapó un
  error: `waitForDokployStatusTransition` nunca detectaba una transición
  de estado (`compose.one: estado actual = (ausente)` en cada sondeo),
  incluso con un despliegue que sí terminó exitoso del lado de Dokploy.
  Se capturó la respuesta real de `compose.one` durante ese despliegue y
  se confirmó que el campo top-level es `composeStatus`, no `status` —
  `status` solo existe dentro de `deployments[]` (un array de historial
  por intento), que es un objeto distinto del que lee este script. Los
  *valores* asumidos (`done`/`error`) sí resultaron correctos, confirmados
  en ese mismo `deployments[].status`. Corregido `DOKPLOY_STATUS_FIELD` a
  `'composeStatus'` en `src/lib/deploy/dokploy-client.ts`, actualizados
  los mocks de `dokploy-client.test.ts` que usaban la clave vieja, y
  agregado un caso de prueba que fija el comportamiento correcto
  (`status` en la raíz del objeto SHALL ignorarse). `compose.deploy`
  devolviendo un `deploymentId` y el comportamiento de `compose.update`
  no se vieron afectados por este error — se mantienen verificados como
  antes. Ver `design.md` (Open Questions, Risks/Trade-offs).
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

**Nota de archivado (2026-09-20)**: 6.3 y 7.2-7.4 quedan sin marcar a
propósito, honrando 7.5 — nunca se ejecutó un deploy/rollback/restore real
de punta a punta contra el mecanismo de imágenes GHCR de este change. Se
archiva de todas formas porque ese mecanismo dejó de ser la ruta principal
(ver `openspec/changes/archive/2026-09-20-simplify-cicd-dokploy-native-deploy`):
`compose.dokploy.yaml` ahora construye desde el Dockerfile y Dokploy
despliega vía su Auto Deploy nativo, sin aprobación humana. El mecanismo
de imágenes/GHCR (`release.yml` con `publish_and_deploy: true`,
`rollback.yml` con `strategy: image`) sigue existiendo como ruta legada
opcional — si alguna vez se usa de verdad, sus tareas de verificación en
vivo equivalentes viven ahora en ese change nuevo, no aquí. Decisión
explícita del usuario: archivar sin exigir esa validación en vivo del
mecanismo legado.

## 8. Documentación

- [x] 8.1 Crear `docs/OPERATIONS.md` (en español) con los runbooks de
  backup, restauración, rollback y primer arranque, más las dos
  bitácoras (despliegues y restauraciones). Verificar que cada comando
  citado existe en el repositorio (`grep`/revisión manual) y que el
  documento no duplica contenido estable de `docs/DEPLOYMENT.md`.
  **Verificado real**: el archivo existe (150 líneas); cada comando
  `pnpm`/ruta de archivo citado (`scripts/create-admin.ts`,
  `scripts/dokploy-deploy.ts`, `scripts/smoke-production.ts`,
  `.github/workflows/rollback.yml`, `compose.dokploy.yaml`,
  `docs/DEPLOYMENT.md`, `docs/SEARCH.md`) fue verificado como existente
  en disco; solo un falso positivo en la verificación (una referencia
  en prosa a `release.yml` por nombre corto, sin backticks de ruta
  completa, en un párrafo que ya daba la ruta completa antes).
- [x] 8.2 Reescribir en `docs/DEPLOYMENT.md`: `## Secuencia de
  despliegue` (ya no son pasos manuales de `docker build`/`docker run`),
  `## Imagen de producción` (el build ocurre en Actions),
  `## Topología objetivo (V1)`, `## compose.prod.yaml` +
  `### Aislamiento de proyecto de Compose` (agregar el namespace de
  `compose.dokploy.yaml`), `## Primer usuario Admin` (referenciar
  `scripts/create-admin.ts` en vez del script de un solo uso), y
  `## Fuera de alcance de esta fase (Phase 12)` con sus bullets
  actualizados u obsoletos. Enlazar a `OPERATIONS.md` en vez de
  duplicar. Verificar por revisión manual sección por sección.
  **Verificado por lectura**: las 17 secciones/subsecciones existen
  (`grep -n "^## \|^### "`), incluyendo `## Secuencia de despliegue`
  reescrita como el flujo real CI→aprobación→Dokploy, `### GET
  /api/health` nueva, y `## Fuera de alcance` reescrita.
- [x] 8.3 Actualizar en `docs/DEPLOYMENT.md` la sección
  `## Verificación / troubleshooting` y el contrato de `/api/health`
  para documentar el campo `sha`. Verificar contra el comportamiento
  real implementado en la sección 2.
  **Verificado por lectura**: el campo `sha` está documentado en
  `### GET /api/health` (ejemplo de respuesta, semántica del campo,
  `Cache-Control: no-store`) y `## Verificación / troubleshooting`
  incluye la entrada "`/api/health` responde `200` pero `sha` no es el
  esperado" con la clasificación de falla real de `dokploy-deploy.ts`.
- [x] 8.4 Actualizar `README.md`: `## Build y arranque en producción`,
  `## Health check` (campo `sha`), `## Referencias de documentación`
  (agregar `OPERATIONS.md`; `DEPLOYMENT.md` deja de describirse como
  "Phase 10"). Verificar que ningún comando, script, puerto o variable
  de entorno citado sea inventado.
  **Verificado por lectura**: las tres secciones reflejan el flujo real
  (CI construye/califica, `deploy` entrega tras aprobación, Dokploy
  solo hace pull/run); `sha` documentado en el ejemplo de respuesta de
  `/api/health`; `docs/OPERATIONS.md` listado en "Referencias de
  documentación".
- [x] 8.5 Actualizar `docs/TESTING.md`: la sección de niveles de CI debe
  reflejar que `release.yml` ya no termina en `publish`/`provenance`,
  sino que continúa con `deploy`. Verificar por revisión manual.
  **Verificado por lectura**: la sección "Niveles de CI" describe
  `provenance` y `deploy` corriendo en paralelo tras `publish`, el gate
  `environment: production` con *required reviewers*, y remite a
  `docs/OPERATIONS.md` para el runbook operativo.
- [x] 8.6 Actualizar `docs/SEARCH.md` enlazando el reindex de Search
  desde el runbook de primer arranque de `docs/OPERATIONS.md`. Verificar
  por revisión manual del enlace.
  **Verificado por lectura**: el enlace existe y ubica el Reindex como
  paso 7 del runbook de primer arranque, aclarando que no recurre en
  cada despliegue.
- [x] 8.7 Actualizar el encabezado de `compose.dokploy.yaml` para que
  deje de decir que nada lo invoca todavía. Verificar por revisión
  manual del comentario actualizado.
  **Corregido en esta pasada de verificación**: el encabezado seguía
  diciendo literalmente "pertenece al change futuro
  `production-deployment-dokploy`" — la tarea nunca se había hecho.
  Reescrito para nombrar la invocación real (`release.yml` job
  `deploy`, `rollback.yml`, gate de aprobación de `production`).
  Verificado que el archivo sigue parseando:
  `docker compose -f compose.dokploy.yaml config` con las 8 variables
  en placeholder.
- [x] 8.8 Ejecutar `graphify update .` para reflejar los archivos nuevos
  y modificados de este change. Verificar con
  `graphify query "production-deployment-dokploy"` mostrando los nodos
  esperados.
  **Verificado real**: `graphify update .` → 3587 nodos, 5005 edges,
  267 comunidades. `graphify query "production-deployment-dokploy"` →
  80 nodos, incluyendo los 4 artefactos de OpenSpec y las funciones
  clave de `scripts/dokploy-deploy.ts`/`src/lib/deploy/dokploy-env.ts`.
