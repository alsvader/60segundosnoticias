# Operación en producción

Runbooks operativos para el despliegue en Dokploy. El modelo vigente hoy viene de `openspec/changes/archive/2026-09-20-simplify-cicd-dokploy-native-deploy`, que superó al de `openspec/changes/archive/2026-09-20-production-deployment-dokploy` (citado varias veces abajo por sus decisiones de diseño aún vigentes — backups, restore, primer arranque — que no cambiaron con esa simplificación). Complementa, sin duplicar, `docs/DEPLOYMENT.md` — ese documento es el **contrato** estable sobre el repositorio (imagen, contrato de entorno, topología); este documento es **procedimental**, específico de esta instancia de Dokploy, y contiene registros vivos (las dos bitácoras de abajo). Ante cualquier discrepancia entre ambos, `docs/DEPLOYMENT.md` define qué existe en el repo; este documento define cómo operarlo.

Convención de esta instancia: donde algo depende de la configuración concreta del operador en su propio Dokploy (rutas exactas del dashboard, nombres de campos no confirmados contra el Swagger real) se dice explícitamente "revisar en la instancia" en vez de inventarse.

## Despliegue

### Cómo llega una release a producción (modelo actual)

```
PR -> ci.yml: quality -> integration -> e2e-pr -> docker-build (gate
   obligatorio; cualquier falla bloquea el merge)
merge a main -> ci.yml corre de nuevo sobre main (mismo gate, informativo -
   ya no bloquea nada porque el merge ya ocurrió)
push a main -> Dokploy (Auto Deploy nativo, configurado en su dashboard)
   detecta el push -> construye `migrate`/`app` desde
   compose.dokploy.yaml (build: sobre el Dockerfile, sin GitHub Actions
   de por medio) -> corre `migrate` -> si sale 0, arranca/reemplaza `app`
```

Sin aprobación manual: mergear a `main` ya es la decisión de desplegar. No hay `deploymentId` ni tag inmutable que registrar desde este repositorio — el estado real del despliegue vive en el dashboard/logs de Dokploy de esta instancia.

**Verificación tras un push a main**:

1. Esperar a que Dokploy termine (revisar el estado del servicio Compose en su dashboard).
2. `curl $PRODUCTION_URL/api/health` → `200`. El campo `sha` es `null` en este modelo (ver `docs/DEPLOYMENT.md` §"Imagen de producción") — no es un síntoma de falla.
3. `node scripts/smoke-production.ts` contra `PRODUCTION_URL` a mano (ya no corre automáticamente desde CI): `GET` sobre `/api/health`, `/`, una Category, un Article, `/buscar`, `/admin/login` — las seis SHALL responder `< 400`.

Si `migrate` falla, `app` nunca arranca y la release anterior sigue sirviendo tráfico — sin rollback automático. Revisar los logs del servicio Compose en el dashboard de Dokploy (las migraciones solo se ven ahí).

### Modelo legado (opcional, `release.yml` + `dokploy-deploy.ts`)

El mecanismo anterior (GitHub Actions construye y publica imágenes con tag inmutable por SHA a GHCR, y un job `deploy` las entrega a Dokploy vía API tras aprobación manual) sigue existiendo, completo, pero inactivo por defecto — se dispara manualmente con `release.yml` (`workflow_dispatch`, input `publish_and_deploy: true`). Útil si en algún momento se quiere volver a la trazabilidad "qué se calificó == qué se despliega" vía tag inmutable.

```
release.yml (workflow_dispatch, publish_and_deploy: true)
  -> ci-gates (reutiliza ci.yml) -> e2e-full/visual/docker-smoke/lighthouse
  -> publish: build + push a GHCR de
       ghcr.io/<owner>/60segundosnoticias:runner-<sha>
       ghcr.io/<owner>/60segundosnoticias:migrator-<sha>
  -> deploy (needs: publish; environment: production, required reviewers)
       -> scripts/dokploy-deploy.ts: compose.one -> reescribir
          RUNNER_IMAGE/MIGRATOR_IMAGE -> compose.update -> re-leer y
          verificar byte a byte -> compose.deploy
       -> scripts/smoke-production.ts
  -> provenance (needs: publish, en paralelo a deploy)
```

**Las tres señales de "terminó, y terminó bien"** en este camino (`compose.deploy` es asíncrono — Dokploy responde inmediatamente, pero el despliegue real tarda; `scripts/dokploy-deploy.ts` exige las tres antes de declarar éxito):

1. **Transición de estado en Dokploy** (`compose.one`, sondeado cada 5 s el primer minuto y luego cada 10 s, tope 15 min): se exige que el estado cambie respecto al que había *antes* de llamar a `compose.deploy`.
2. **SHA vivo**: `GET $PRODUCTION_URL/api/health` hasta 3 lecturas **consecutivas** de HTTP 200 con `body.sha === <sha de esta corrida>`, separadas 5 s, tope 10 min (este camino sí pasa `GIT_SHA` como build-arg, a diferencia del modelo actual).
3. **Smoke** (`scripts/smoke-production.ts`): mismas seis rutas que arriba.

**Cómo leer una falla**: el job `deploy` nunca hace rollback automático ni `stop`/`restart`. Ante cualquier falla se detiene y escribe un resumen (`$GITHUB_STEP_SUMMARY`) con la clase de falla, ambos tags de imagen, el SHA que estaba vivo antes del intento, y el comando exacto para revertir manualmente. Clases que puede reportar (`scripts/dokploy-deploy.ts`):

| Clase de falla | Qué significa | Qué revisar |
|---|---|---|
| `ENV_VERIFICATION_MISMATCH` | La relectura de `compose.one` tras `compose.update` no coincidió byte a byte con lo que se intentó escribir. Se abortó **antes** de llamar a `compose.deploy` — no se desplegó nada. | El env de Dokploy puede haber quedado en un estado inesperado; revisar manualmente en el dashboard antes de reintentar. |
| `MIGRATION_FAILED_OLD_SERVING` | Dokploy nunca confirmó la transición de estado (o reportó error), pero `/api/health` sigue respondiendo — casi siempre el container `migrate` falló y `app` nunca llegó a arrancar. La release anterior sigue sirviendo tráfico. | Logs de Dokploy del servicio Compose. |
| `SITE_UNREACHABLE` | Ni `/api/health` de la release vieja ni de la nueva responden. | Estado del stack en Dokploy; si el problema es de infraestructura (VPS, red), no de la imagen. |
| `NEW_SHA_NEVER_LIVE` | Dokploy reportó el despliegue como completado, pero el SHA nuevo nunca alcanzó 3 lecturas consecutivas antes del tope de 10 min. | Logs de arranque de `app`; puede ser un problema de la imagen nueva en vez de las migraciones. |

Ante cualquiera de estas clases, la vía de recuperación es un rollback manual (ver más abajo) — nunca un reintento ciego del mismo despliegue sin entender la causa.

## Backups

PostgreSQL de producción **no vive en `compose.dokploy.yaml`**: es un servicio de base de datos gestionado por Dokploy (prerrequisito operativo — el operador lo crea en su instancia). Su respaldo programado es una función nativa de la plataforma, no algo que este repositorio construya o mantenga.

- **Destino**: un bucket S3 con credenciales propias, generadas y limitadas a ese bucket, **distintas** de las credenciales `S3_*` que usa Media (`docs/DEPLOYMENT.md` §"Media / Object Storage"). Una fuga de una nunca compromete a la otra.
- **Calendario y retención**: configurados en la sección de backups del servicio de base de datos, dentro del propio dashboard de Dokploy de esta instancia — revisar ahí (no se documentan aquí valores concretos no confirmados).
- **Qué protege el cifrado**: es cifrado **en reposo del destino** (el bucket S3), no cifrado del dump del lado del cliente antes de subirlo. Esto protege contra la pérdida del VPS y contra una fuga de la credencial de Media (bucket distinto). **No** protege contra una fuga de la propia credencial del destino de backups — por eso esa credencial SHALL estar limitada únicamente a ese bucket, nunca reutilizada para Media ni con permisos más amplios.
- **Por qué no hay una imagen de `backup` en este repo**: la primera versión de este cambio intentó mantener `db` dentro de `compose.dokploy.yaml` con un servicio `backup` corriendo una imagen pública de terceros. Se descartó tras auditar esa imagen: su cifrado es opcional y falla en silencio (una variable mal nombrada sube los dumps en texto plano sin error), no implementa retención, y su `Dockerfile` descarga un binario de 2015 con verificación TLS deshabilitada. Un container con la contraseña de Postgres y las credenciales de escritura del bucket de backups no es el lugar para asumir ese riesgo. Ver `openspec/changes/archive/2026-09-20-production-deployment-dokploy/design.md`, Decisión 5.

## Drill de restauración

Un backup que nunca se restaura de verdad no es un backup verificado. Este drill corre **en la laptop del operador, nunca en el VPS**, y **nunca** contra el proyecto de Compose de desarrollo — usa un nombre de proyecto explícito y aislado, `-p 60segundosnoticias-restore`. Este repositorio ya perdió una base de datos de desarrollo real por una colisión de namespace de Compose; ver `docs/DEPLOYMENT.md` §"Aislamiento de proyecto de Compose" antes de correr cualquier paso destructivo de este drill.

1. **Descargar el dump** más reciente desde el destino S3 de backups (credenciales propias de ese bucket, ver arriba) a la laptop.
2. **Levantar un Postgres desechable y aislado**:
   ```bash
   docker compose -p 60segundosnoticias-restore -f compose.prod.yaml --profile self-hosted up -d db
   ```
   Este es el mismo patrón de aislamiento que ya usa `scripts/docker-smoke.sh` (`-p` explícito, nunca el `name:` del archivo ni el directorio de trabajo).
3. **Restaurar el dump** dentro de ese Postgres desechable (`psql`/`pg_restore` según el formato del dump, apuntando al puerto que expone `compose.prod.yaml --profile self-hosted`).
4. **Aserciones de datos usables, no solo "el archivo existe"**:
   - La última fila de `payload_migrations` coincide con la migración más reciente esperada para el SHA que se está restaurando.
   - Los conteos de `posts`, `categories`, `users` y `search` son `> 0`.
5. **Aserción de aplicación real**: arrancar la imagen `ghcr.io/<owner>/60segundosnoticias:runner-<sha>` correspondiente, con `DATABASE_URI` apuntando a este Postgres restaurado, y confirmar:
   - `/api/health` responde `200`.
   - `/buscar?q=<palabra conocida del contenido restaurado>` devuelve al menos un resultado — esto es lo que prueba que el **índice de Search** también se restauró, no solo el contenido (el índice vive en la misma base, Collection `search`, ver `docs/SEARCH.md`).
6. **Limpiar**: `docker compose -p 60segundosnoticias-restore -f compose.prod.yaml --profile self-hosted down -v` — seguro precisamente porque el proyecto es aislado y desechable, nunca el de desarrollo.
7. **Registrar el resultado** en la bitácora de abajo, incluso si el drill falló — un drill fallido no documentado es indistinguible de uno que nunca se corrió.

**Cadencia**: una vez, obligatoriamente, antes de declarar producción lista; después, trimestral.

### Bitácora de restauración

| Fecha | Dump restaurado | Conteos (posts/categories/users/search) | `/api/health` | `/buscar?q=...` | Resultado |
|---|---|---|---|---|---|
| _(sin corridas registradas todavía)_ | | | | | |

## Rollback

### Regla de decisión

Las migraciones de Payload son forward-only — no existe una forma segura de deshacer un `ALTER TABLE` destructivo contra datos ya escritos con el esquema nuevo. Antes de revertir la aplicación a un SHA anterior, correr:

```bash
git diff --name-only <sha-bueno> <sha-malo> -- src/payload/migrations/
```

- **Vacío, o solo migraciones aditivas** (agregan columnas/tablas nullable, nunca quitan ni endurecen algo que el código viejo lee) ⇒ rollback de aplicación **seguro**. El `migrate` de la release anterior no encuentra nada pendiente y sale 0.
- **Cualquier `DROP`/`RENAME`/`NOT NULL` sobre algo que el código viejo todavía lee** ⇒ **no seguro**. La respuesta es un dump inmediato de la base y **fix-forward** (una migración nueva que corrija hacia adelante) — **nunca** `payload migrate:down` en producción. Rollback de aplicación ≠ rollback de base de datos.

Esta regla depende de mantener la bitácora de despliegues (abajo) — sin ella, decidir si un SHA anterior es seguro es adivinar retroactivamente qué migraciones corrieron entre medio.

### Cómo ejecutar un rollback

`.github/workflows/rollback.yml` (`workflow_dispatch`), input `strategy` (`git`, default, o `image`, legado), más `sha` y `reason`. Usa el mismo grupo de concurrencia (`release`) que `release.yml`, así que nunca corre en simultáneo con un release legado. Aprobación manual: solo `strategy: image` la tiene (ver abajo) — `strategy: git` no.

**`strategy: git` (default)** — `sha` es el commit bueno de `main` al que volver:

```bash
gh workflow run rollback.yml -f strategy=git -f sha=<commit-bueno> -f reason="descripción de por qué"
```

Deja el árbol de `main` idéntico a ese commit (`git checkout <sha> -- .` + un nuevo commit `revert: rollback to <sha> (...)`, pusheado sin force-push ni reescritura de historia) y espera a que Dokploy reconstruya solo, vía su Auto Deploy nativo. No confirma el SHA exacto servido (ver `docs/DEPLOYMENT.md` §"Imagen de producción") — solo que el sitio vuelve a responder; para certeza exacta, revisar el dashboard/logs de Dokploy.

**Prerrequisito de configuración**: este job no declara `environment: production` (a propósito — no necesita los secrets `DOKPLOY_*`, y así no queda detrás de la aprobación manual del Environment). Por eso `PRODUCTION_URL` SHALL estar configurada como **Repository variable** (Settings → Secrets and variables → Actions → Variables, pestaña de repositorio), no como Environment variable de `production` — un job sin `environment:` declarado no puede leer variables scoped a un Environment. No es información sensible (es la URL pública del sitio).

**`strategy: image` (legado)** — `sha` es el SHA de Git completo (40 hex) de una imagen ya publicada a GHCR:

```bash
gh workflow run rollback.yml -f strategy=image -f sha=<sha-de-40-hex> -f reason="descripción de por qué"
```

Verifica primero que ambos manifests (`runner-<sha>`, `migrator-<sha>`) existen en GHCR — **nunca reconstruye** — y reutiliza exactamente `scripts/dokploy-deploy.ts` y `scripts/smoke-production.ts`, con las mismas tres señales de éxito que un despliegue legado. Solo funciona si las imágenes de ese SHA siguen existiendo en GHCR (es decir, si `release.yml` se corrió con `publish_and_deploy: true` para ese SHA en algún momento). Este job sí declara `environment: production` (necesita los secrets `DOKPLOY_*`, scoped a ese Environment), así que sí queda detrás de la misma aprobación manual que el modelo legado de `release.yml`.

Ambas estrategias advierten explícitamente en el resumen del job que el rollback revierte solo la aplicación, nunca el esquema.

### Bitácora de despliegues

| Fecha | SHA | ¿Incluye migraciones? | ¿Retrocompatible con el SHA anterior? |
|---|---|---|---|
| _(sin corridas registradas todavía)_ | | | |

## Primer arranque

Orden estricto para la primera vez que una base de datos de producción queda en servicio (o tras recrearla en otro servidor, ver más abajo):

1. **Desplegar** (ver §"Despliegue" arriba) — **una vez, no recurrente**.
2. Confirmar que `migrate` salió con código 0 (Dokploy no reporta error de estado) — **una vez por despliegue** (parte de las tres señales, no un paso aparte).
3. Confirmar `/api/health` → `200` — **una vez por despliegue**.
4. **Crear el primer Admin**, dentro de la red del stack de Dokploy, con el container `migrate` de un solo uso:
   ```bash
   ADMIN_EMAIL=admin@ejemplo.com ADMIN_PASSWORD=... \
     docker compose run --rm migrate pnpm payload run scripts/create-admin.ts
   ```
   Idempotente (no-op si ya existe cualquier usuario) — **estrictamente única vez** en la vida de esa base de datos; correrlo de nuevo tras el primer arranque no hace nada.
5. **`seed:initial`** (`pnpm payload run src/payload/seed/initial.ts` — Categories base, idempotente). **Nunca `seed:dev`** en producción — crea contenido de demostración y usuarios con contraseña de desarrollo hardcodeada. Normalmente única vez, pero es seguro repetirlo si hiciera falta (no duplica).
6. **Publicar contenido real** — tarea editorial continua, no un paso de despliegue.
7. **Reindex de Search**: Admin UI → `/admin/collections/search` → acción "Reindex", y confirmar que `/buscar` devuelve resultados (ver `docs/SEARCH.md` §"Reindexación"). **Recurre solo** cuando una release cambia qué Collections se indexan o la extracción `beforeSync` — no en cada despliegue normal.
8. **Smoke público**: `node scripts/smoke-production.ts` contra `PRODUCTION_URL` — manual tras cada despliegue en el modelo actual (ya no se ejecuta automáticamente desde CI); aquí además confirma el estado tras los pasos 4-7.

## Recrear la base en otro servidor

Como la definición de la base de datos (versión, volumen, calendario de backup) vive en Dokploy y no en este repositorio, migrar a otro VPS es un procedimiento manual — no un `docker compose up`:

1. **Crear el servicio de base de datos PostgreSQL** en la instancia de Dokploy del servidor nuevo (mismo prerrequisito que la Etapa 7 original — ver `openspec/changes/archive/2026-09-20-production-deployment-dokploy/design.md`, "Prerrequisitos manuales").
2. **Restaurar el backup S3 más reciente** en ese servicio nuevo — el mismo procedimiento que el drill de restauración de arriba, pero contra el servicio real en vez de un Postgres desechable de laptop.
3. **Repuntar `DATABASE_URI`** en el env del servicio Compose de Dokploy (mismo mecanismo que usa `scripts/dokploy-deploy.ts` para `RUNNER_IMAGE`/`MIGRATOR_IMAGE`: `compose.update` sobre el blob de entorno) hacia el nuevo servicio de base de datos, y disparar `compose.deploy` para que los containers recojan el nuevo valor.
4. Verificar con las mismas tres señales que un despliegue normal (§"Despliegue" arriba).

Esta ruta reutiliza exactamente el par backup→restore que el drill de restauración ya ejercita trimestralmente — no es un procedimiento nuevo sin practicar. Object Storage de Media (`S3_*`) es independiente de este movimiento: no vive en el VPS ni se ve afectado por recrear la base de datos.
