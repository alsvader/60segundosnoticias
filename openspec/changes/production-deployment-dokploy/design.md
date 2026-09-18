## Context

Ver `proposal.md` — `## Why`. `compose.dokploy.yaml` ya existe (Fase 11, tarea 9.9) y define el contrato: solo `image:`, nunca `build:`. Las imágenes `runner-<sha>`/`migrator-<sha>` ya se publican en GHCR de forma anónima y descargable. Dokploy expone una API (`compose.one`/`compose.update`/`compose.deploy`) sobre el compose ya cargado en su UI. Los prerrequisitos manuales del operador (crear el servicio Compose, cargar variables, generar token, crear el GitHub Environment `production`, confirmar contra el Swagger de la instancia) están fuera del alcance de este change y bloquean únicamente la Etapa 7 (verificación real), no las Etapas 1–6 y 8.

## Goals / Non-Goals

**Goals:**
- Automatizar el handoff CI → Dokploy sin que el VPS construya nada.
- Hacer imposible, por construcción, desplegar el alias mutable `-main`.
- Confirmar que la release correcta quedó sirviendo tráfico antes de declarar éxito, distinguiéndolo de un `done` de Dokploy que en realidad describe la release anterior.
- Hacer sostenible Postgres self-hosted en el VPS con backups y una restauración verificada.
- Dar a un operador humano un runbook reproducible de rollback y de primer arranque.

**Non-Goals:**
- Aprovisionar el VPS, TLS/dominio/Traefik, o instalar Dokploy — responsabilidad del operador.
- Rollback automático o reinicio automático de servicios ante una falla de despliegue.
- Rollback de esquema de base de datos (`payload migrate:down`) en producción.
- Múltiples réplicas del App Container (limitación ya documentada por `production-deployment`).
- Dokploy Auto Deploy sobre `push` — descartado a propósito (Decisión 3 del plan).

## Decisions

### 1. Entrega por reescritura de env (`compose.update`+`compose.deploy`), nunca el alias mutable
Dokploy despliega lo que diga el env cargado en su servicio Compose, no lo que exista en GHCR. Si el env quedara apuntando a `runner-main`, cada `compose.deploy` desplegaría lo que sea que `main` construyó *más recientemente*, sin relación con qué imagen pasó la calificación FULL de *esta* corrida — el alias mutable rompe la trazabilidad entre "qué se calificó" y "qué se ejecuta". Por eso el job `deploy` reescribe únicamente las líneas `RUNNER_IMAGE=`/`MIGRATOR_IMAGE=` del env con los tags de salida exactos de `publish` (`needs.publish.outputs.runner-tag`/`migrator-tag`, nunca reconstruidos desde `IMAGE_BASE`), preserva todo lo demás verbatim, y valida el valor nuevo contra `^[a-z0-9.\-_/]+:(runner|migrator)-[0-9a-f]{40}$` — esta expresión es el mecanismo que hace estructuralmente imposible escribir `-main`. Alternativa descartada: que Dokploy jale directamente de un tag `-main` con Auto Deploy — es exactamente la ruta que el plan descarta a propósito, porque pierde el gate de aprobación y la garantía de inmutabilidad.

`scripts/dokploy-deploy.ts` implementa el flujo `compose.one` → enmascarar cada valor de más de 4 caracteres con `::add-mask::` (salvo las dos claves de imagen) → reescribir en memoria vía `src/lib/deploy/dokploy-env.ts` (función pura, sin split/join para preservar bytes fuera de las dos líneas objetivo) → `compose.update` → **re-leer y comparar byte a byte** contra lo que se intentó escribir, abortando antes de `compose.deploy` si no coincide → `compose.deploy` → esperar las tres señales (Decisión 3). El script nunca imprime el blob completo; solo su `sha256` antes/después. El token de Dokploy se pasa por variable de entorno, nunca por argumento de proceso. Es una aserción explícita del script que `freshVolumes` nunca se envía a `compose.deploy` — enviarlo destruiría el volumen nombrado de Postgres.

Casos de prueba obligatorios de `dokploy-env.ts`: CRLF preservado, clave duplicada, clave ausente (se agrega al final en el primer despliegue), un comentario cuyo texto parece la clave, un `=` dentro de otro valor, y rechazo explícito de `runner-main`. El anclaje de regex usa `[^\r\n]*` (no `.*`) para no comerse el fin de línea en archivos CRLF, y descarta comentarios/continuaciones de línea por construcción; el riesgo residual (un valor multilínea cuya continuación empiece con `RUNNER_IMAGE=`) se resuelve abortando si el valor existente no tiene forma de referencia de imagen antes de reemplazar.

Rollback (`rollback.yml`) reutiliza el mismo script y el mismo smoke, seleccionando un SHA anterior — nunca reconstruye.

### 2. El SHA vivo se hornea en la imagen y se expone por `/api/health`
El modo de falla central de este diseño: `compose.deploy` es asíncrono, y un smoke que solo verifica "el sitio responde 200" puede pasar contra la release *anterior* que sigue corriendo mientras la nueva nunca llegó a arrancar. Sin una forma de preguntarle a la aplicación en ejecución "¿qué SHA eres?", un despliegue fallido se vería exitoso.

Solución: `Dockerfile`, al final del stage `runner` — después de todos los `COPY`, para no invalidar el caché de `pnpm build` en cada commit — agrega `ARG GIT_SHA` + `ENV GIT_SHA=$GIT_SHA`; `release.yml` pasa `GIT_SHA=${{ github.sha }}` como build-arg del target `runner`; `/api/health` lee `process.env.GIT_SHA` directo (mismo patrón que `src/app/api/preview/route.ts` y `src/lib/security/headers.ts`, sin tocar el esquema zod de `src/lib/env/index.ts`) y responde `sha` junto con `Cache-Control: no-store` para que ningún caché intermedio devuelva una lectura vieja. No es una variable `NEXT_PUBLIC_*`: no altera el bundle de cliente ni expone el SHA al navegador salvo a través de esta respuesta de servidor.

### 3. Verificación de finalización en tres señales, todas obligatorias
`compose.deploy` no bloquea hasta que el despliegue termine. Las tres señales:

1. **Estado en Dokploy** (`compose.one`, sondeado cada 5s el primer minuto y luego cada 10s, tope 15 min): se registra el estado *previo* a `compose.deploy` y se exige una **transición** de estado — de otro modo un `done` que en realidad quedó de un despliegue anterior se leería como éxito de este. Estado ausente o desconocido se trata siempre como "sigue desplegando", nunca como éxito. El nombre exacto del campo de estado vive en una sola constante al inicio del script porque debe confirmarse contra el Swagger real de la instancia del operador (prerrequisito, Etapa 7).
2. **SHA vivo**: sondeo de `$PRODUCTION_URL/api/health` hasta HTTP 200 con `body.sha === github.sha`, exigiendo **3 coincidencias consecutivas** separadas 5s — la ventana en la que la release vieja y la nueva contestan simultáneamente durante el reemplazo del container puede producir un falso positivo con una sola lectura. Tope 10 min.
3. **Smoke** (`scripts/smoke-production.ts`): `GET` sobre `/api/health`, `/`, una Category, un Article, `/buscar`, `/admin/login`. Los slugs de fixture (`/fixture-noticias/...`) no existen en producción, así que Category/Article se descubren desde `/sitemap.xml`, con override vía `vars.SMOKE_CATEGORY_PATH`/`SMOKE_ARTICLE_PATH`.

Clasificación de fallas que el resumen del job debe distinguir: `migrate` falla ⇒ `app` nunca arranca ⇒ Dokploy reporta error pero `/api/health` sigue devolviendo el SHA **viejo** ("falló, la release anterior sigue sirviendo"); error + sitio inalcanzable ("falló, sitio CAÍDO"); `done` en Dokploy pero el SHA viejo persiste ("desplegado pero la nueva release nunca quedó viva").

### 4. Nunca rollback automático
Un rollback de aplicación no siempre es seguro — depende de si el esquema de la release anterior es compatible con los datos que la release nueva ya pudo haber escrito (Decisión 6, `production-operations`). Automatizar la reversión ante cualquier falla arriesgaría ejecutar un rollback inseguro sin la evaluación humana que esa decisión requiere. Por eso, ante cualquier falla, el job se detiene, nunca ejecuta `stop`/`restart`/reversión, y escribe (`if: always()`) un resumen con: la clase de falla, el SHA, ambos tags de imagen, el `deploymentId`, el SHA que estaba vivo antes del intento, un enlace a los logs de Dokploy (las migraciones solo se ven ahí), la frase explícita de que no se intentó rollback, y el comando exacto para ejecutarlo manualmente.

### 5. Backups se vuelven obligatorios porque Postgres se queda self-hosted en el VPS
El Master Spec §69.1 solo permite Postgres self-hosted si el operador asume backups, recuperación, upgrades, monitoreo y gestión de disco — un Postgres administrado los provee por defecto, uno self-hosted no. `compose.dokploy.yaml` ya define `db` como servicio Postgres con volumen nombrado persistente (Decisión 2 del plan); este change no reabre esa decisión, pero la vuelve sostenible agregando el servicio `backup`: una imagen pública `pg_dump`→gzip→gpg→S3 fijada por *digest* (nada se construye en el VPS), que alcanza `db` por la red interna de Compose (5432 sigue sin publicarse), corre diario 03:00 America/Mexico_City con retención de 30 días, y sube a un bucket R2 **separado** del de Media con su propio token — así una fuga del token de Media no compromete los backups ni viceversa. Cifrado en dos capas: SSE del bucket más una passphrase gpg que vive tanto en Dokploy como en el gestor de contraseñas del operador — una passphrase que solo existe en el VPS deja de ser un backup en cuanto el VPS se pierde.

Nota abierta para el implementador (no decidida aquí, ver `## Open Questions`): confirmar si la UI de backups nativa de Dokploy puede respaldar un Postgres que vive dentro de un stack de Compose, o si —como es probable— su flujo solo apunta a *database services* administrados directamente por Dokploy. Si resulta que sí y el operador la prefiere, es una alternativa válida al servicio `backup` descrito arriba.

### 6. Regla de decisión de rollback: forward-only por defecto, nunca `migrate:down` en producción
Las migraciones de Payload son forward-only; no existe una ruta segura para deshacer un `ALTER TABLE` destructivo contra datos que ya se escribieron con el esquema nuevo. La regla operativa (`git diff --name-only <bueno> <malo> -- src/payload/migrations/`): si el conjunto de migraciones entre ambos SHA está vacío o es solo aditivo, el `migrate` de la release anterior no encuentra nada pendiente y sale 0 — rollback de aplicación seguro. Si incluye un `DROP`/`RENAME`/`NOT NULL` sobre algo que el código viejo todavía lee, un rollback de aplicación dejaría el código viejo leyendo un esquema que ya no existe como esperaba — no seguro; la respuesta es dump inmediato y **fix-forward**, nunca revertir el esquema. Esta regla depende de mantener una bitácora de despliegues (fecha, SHA, ¿incluye migraciones?, ¿retrocompatible?): sin ella, la clasificación es una adivinanza retroactiva.

### 7. Primer arranque: script committeado, no credenciales committeadas
`docs/DEPLOYMENT.md` documenta hoy (verificado en vivo) que no hay bypass de "crear primer usuario" — `POST /api/users` contra una base sin usuarios devuelve `403` porque `Users` usa `create: isAdmin`, y la instrucción actual es "correr un script de un solo uso y luego borrarlo". Eso se reemplaza por `scripts/create-admin.ts` committeado, idempotente (no-op si ya existe cualquier usuario), que lee credenciales de variables de entorno y usa la Local API de Payload con `overrideAccess: true` — mismo patrón que `src/payload/seed/dev.ts`. Lo prohibido siempre fue comitear *credenciales*, no un script; committear el script y mantener las credenciales en el entorno de ejecución del VPS no contradice esa regla. Se ejecuta con `docker compose run --rm migrate pnpm payload run scripts/create-admin.ts`.

## Risks / Trade-offs

- **El smoke pasa contra la release anterior mientras la nueva nunca arrancó** → mitigado por la verificación de SHA vivo con 3 coincidencias consecutivas (Decisión 3), no solo un código 200.
- **Un `done` viejo de Dokploy se lee como éxito de esta corrida** → mitigado exigiendo una transición de estado, no solo un valor terminal (Decisión 3).
- **El nombre del campo de estado de Dokploy no está confirmado contra el Swagger real** → aislado en una única constante al inicio de `dokploy-deploy.ts`; bloquea únicamente la Etapa 7, se reporta en vez de adivinarse.
- **Un rollback de aplicación inseguro corrompería la lectura de datos por código viejo** → mitigado por la regla de decisión basada en el diff de migraciones (Decisión 6) y por prohibir explícitamente `migrate:down` en producción.
- **Una passphrase de backup que solo vive en el VPS deja de ser un backup si el VPS se pierde** → mitigada exigiendo que la passphrase también viva en el gestor de contraseñas del operador (Decisión 5).
- **Backups que nunca se restauran de verdad no son backups verificados** → mitigado por el drill de restauración periódico contra un proyecto Compose aislado (`-p 60segundosnoticias-restore`) con aserciones de datos y de índice de Search, no solo de que el archivo existe.
- **Escribir el env de Dokploy incorrectamente podría corromper variables no relacionadas con la imagen** → mitigado por el reemplazo anclado por regex más la re-lectura byte a byte antes de desplegar (Decisión 1).
- **Enviar `freshVolumes` por error destruiría el volumen de Postgres** → mitigado por una aserción explícita en el script de que ese campo nunca se envía.
- **Rollback automático ante cualquier falla podría ejecutar una reversión insegura sin evaluación humana** → mitigado renunciando deliberadamente a todo rollback automático (Decisión 4).

## Migration Plan

Este change no migra datos ni cambia comportamiento de desarrollo. Su "migración" es operativa: Etapas 2–6 y 8 son implementables sin tocar producción (Dockerfile, `/api/health`, `dokploy-env.ts`, `dokploy-deploy.ts`, `smoke-production.ts`, `create-admin.ts`, el servicio `backup`, y la documentación). La Etapa 7 — un despliegue real aprobado desde `main`, un rollback real a un SHA anterior, y un restore verificado contra un destino desechable — depende de los prerrequisitos manuales del operador (servicio Compose en Dokploy, variables cargadas, token de API, GitHub Environment `production`, bucket R2 de backups, y la confirmación contra el Swagger real) y no se marca completa sin evidencia de una corrida real.

## Open Questions

- ¿La UI de backups nativa de Dokploy puede respaldar un Postgres que vive dentro de un stack de Compose, o solo *database services* administrados directamente por Dokploy? No cambia los requisitos observables de `production-operations` (backups cifrados, con retención, verificados por restauración) — solo el mecanismo que los implementa — así que se resuelve durante la Etapa 6 sin reabrir specs ni tasks.
- El nombre exacto del campo de estado que expone `compose.one`, si `compose.deploy` devuelve un id de despliegue, y si `compose.update` acepta un patch parcial `{composeId, env}` o exige el objeto completo: se confirman contra el Swagger real de la instancia del operador antes de la Etapa 7. No afectan el contrato observable de `deployment-automation`, solo el detalle de implementación de `dokploy-deploy.ts`.
