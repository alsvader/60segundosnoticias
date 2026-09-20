# Despliegue en producción

Referencia operativa — el **contrato** estable sobre este repositorio — para construir y verificar la aplicación en producción (Phase 10 — Docker + Production Hardening; el modelo de entrega automatizada a Dokploy vigente hoy es el de `openspec/changes/archive/2026-09-20-simplify-cicd-dokploy-native-deploy`, que superó al de `production-deployment-dokploy`, también archivado). Complementa, sin duplicar, `docs/60-segundos-spec.md` (especificación objetivo) y `README.md` (flujo de desarrollo). El runbook operativo día a día (cómo se ejecuta un despliegue real, backups, restore, rollback, primer arranque) vive en **`docs/OPERATIONS.md`** — específico de esta instancia de Dokploy y con registros vivos; este documento nunca lo duplica. Aprovisionamiento real de VPS/Dokploy, TLS/dominio/Traefik siguen fuera de alcance de este repositorio — ver "Fuera de alcance" abajo.

## Topología objetivo (V1)

```
Internet
   |
   v
TLS / CDN / reverse proxy / plataforma (Dokploy/Traefik)  <- fuera de este repo; ver "TLS" abajo
   |
   v
Dokploy (VPS)
   |-- servicio Compose (compose.dokploy.yaml): App Container (stage `runner`)
   |     `-- Object Storage S3-compatible vía S3_* (Media)
   `-- servicio de base de datos PostgreSQL 17, gestionado por Dokploy
         (fuera de compose.dokploy.yaml; DATABASE_URI apunta ahí — ver
         docs/OPERATIONS.md §"Backups" y §"Recrear la base en otro servidor")
```

PostgreSQL deja de vivir en el Compose que despliega la app (`compose.dokploy.yaml`) a propósito: Dokploy solo ofrece backup/restore nativo para *sus* servicios de base de datos, nunca para uno embebido en un stack de Compose. Esto no es una desviación del contrato de este documento: `DATABASE_URI` siempre fue agnóstico del proveedor (ver "Contrato de entorno" abajo), y la app/el job de migración nunca requirieron un servicio `db` declarado en el mismo Compose. `compose.prod.yaml` conserva su propio profile `self-hosted` con un servicio `db` de referencia (ver más abajo) — ese archivo no es lo que corre en producción real.

V1 objetivo es **instancia única**. Antes de escalar a múltiples réplicas hace falta resolver, además de lo que ya está resuelto aquí (Object Storage ya es compartido/replica-safe):

- coordinación de invalidación de cache entre réplicas (hoy es in-process, por proceso — ver "Cache y revalidación" abajo);
- el job de migración debe seguir siendo singleton (una sola ejecución por release, nunca una por réplica);
- revisar el pool de conexiones de PostgreSQL según el límite del proveedor.

No se implementa nada de esto en V1 — se documenta como límite conocido, no como bloqueante.

## Imagen de producción

**El build ocurre en el VPS, dentro de Dokploy, en cada push a `main`** — `compose.dokploy.yaml` usa `build:` (igual que `compose.prod.yaml`), no `image:`. GitHub Actions (`ci.yml`, job `docker-build`) sigue siendo el gate de PR/merge: valida, antes de mergear, que esta misma imagen (mismos targets `runner`/`migrator`, mismo Dockerfile) construye bien — pero solo como validación (`push: false`), nunca publica nada a un registro. Dokploy despliega vía su propio Auto Deploy nativo sobre `main`, sin pasar por GitHub Actions. Los comandos `docker build` de esta sección siguen siendo el mecanismo real para reproducir/probar el build localmente.

Esto reemplaza el modelo anterior (`release.yml` construía y publicaba imágenes con tag inmutable por SHA a GHCR, y un job `deploy` las entregaba a Dokploy vía API tras aprobación manual) — simplificación deliberada para reducir minutos de CI en un proyecto de un solo mantenedor. Ese mecanismo sigue existiendo en `release.yml` (jobs `publish`/`deploy`/`provenance`), pero inactivo por defecto, detrás del input `publish_and_deploy` de `workflow_dispatch`.

El `Dockerfile` define, además de los stages de desarrollo (`base`, `deps`, `development`), dos stages exclusivos de producción:

```
deps -> builder -> runner     (imagen de la aplicación)
deps -> migrator               (job de operación, un solo uso)
```

### `runner` (imagen de la aplicación)

- Basado en la salida `standalone` de Next.js (`output: 'standalone'` en `next.config.ts`).
- Usuario no-root (`node`, uid/gid 1000 — ya provisto por la imagen base `node:24-bookworm-slim`, no se crea uno nuevo).
- `CMD` en forma exec (`["node", "server.js"]`) — las señales (`SIGTERM`) llegan directo al proceso, sin shell intermedio.
- `HEALTHCHECK` propio de la imagen, reutilizando el mismo patrón `node -e fetch(...)` que ya usa `compose.yaml` en desarrollo (sin instalar `curl`/`wget`).
- No incluye el CLI de Payload ni el directorio de migraciones — a propósito. Ver stage `migrator`.

Build:

```bash
docker build --target runner \
  --build-arg DATABASE_URI="postgres://..." \
  --build-arg PAYLOAD_SECRET="..." \
  --build-arg NEXT_PUBLIC_SITE_URL="https://tu-dominio.example" \
  --build-arg GIT_SHA="$(git rev-parse HEAD)" \
  -t 60segundos-app:runner .
```

**`GIT_SHA`**: se declara al final del stage `runner`, después de todos los `COPY` — así solo invalida la última capa (metadata) en cada commit, en vez de reventar el caché de `pnpm build`; nunca se declara en `builder` por la misma razón. Se expone vía `process.env.GIT_SHA` en runtime (nunca `NEXT_PUBLIC_*` — no se incrusta en el bundle de cliente) y `/api/health` lo reporta en el campo `sha` (ver "Contrato de entorno" abajo).

**Limitación conocida en el modelo actual**: ni `compose.dokploy.yaml` ni `compose.prod.yaml` pasan este build-arg (el SHA de git no está disponible dentro del build context — `.dockerignore` excluye `.git`), así que en producción real `/api/health` reporta `sha: null`. Esto era distinto en el modelo anterior, donde `release.yml` sí lo pasaba explícitamente (`--build-arg GIT_SHA=${{ github.sha }}`) porque GitHub Actions conocía el SHA exacto sin necesidad de leer `.git`. El único camino que hoy sigue poblando `GIT_SHA` correctamente es el legado `release.yml` (`publish`, tras habilitar `publish_and_deploy`). Para confirmar qué commit corre realmente en el VPS sin ese campo, revisar el dashboard/logs de Dokploy.

**`DATABASE_URI` debe ser alcanzable durante el build, no solo tener formato válido.** `next build` prerenderiza `/`, `/robots.txt` y `/sitemap.xml` como contenido estático, y esa generación ejecuta consultas reales contra Payload Local API (`SiteSettings`, `Home`, etc.) — verificado directamente: con una `DATABASE_URI` sintácticamente válida pero inalcanzable, el build falla en la exportación de `/`, no en la validación de entorno. En la práctica esto significa: **el pipeline de build necesita red hacia una base ya migrada al schema de esta release** (un servidor "migration-test" desechable, no la base de producción real necesariamente, pero sí una con el schema al día — ver "Secuencia de despliegue").

De las tres variables de build (`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`), ninguna es un secreto real de producción en este contexto: `NEXT_PUBLIC_SITE_URL` es pública por diseño (se incrusta en el bundle de cliente — por eso Next la necesita en build time), y `DATABASE_URI`/`PAYLOAD_SECRET` en build solo necesitan apuntar a *alguna* base con el schema correcto (típicamente la misma de verificación de migraciones), no a las credenciales de producción reales. Los secretos de runtime genuinos (`PREVIEW_SECRET`, `S3_*`) **no se declaran como `ARG`** en el Dockerfile — no le corresponden al build, se inyectan solo al arrancar el container.

### `migrator` (job de migración, un solo uso)

- Deriva de `deps`, no de `builder` — no necesita el build de Next, solo el CLI de Payload y el código fuente completo de la release.
- `ENV NODE_ENV=production` explícito. Sin esto, Payload puede tratar el proceso como desarrollo y, si detecta drift de push-mode contra la base objetivo, lanzar un prompt interactivo de confirmación — sin TTY (el caso normal de un despliegue automatizado), ese prompt cuelga el job indefinidamente en vez de fallar rápido. Verificado directamente en este repo.
- No expone puerto, no define un `CMD` de servidor. `CMD` es `pnpm payload migrate`.
- Build: `docker build --target migrator -t 60segundos-app:migrator .` — no necesita build args ni red hacia una base de datos.

## Contrato de entorno

| Variable | Secreto | Cuándo se exige | Notas |
|---|---|---|---|
| `DATABASE_URI` | Sí | Siempre (dev, build, runtime) | Cadena de conexión de PostgreSQL. SSL de un proveedor administrado se expresa en la propia URI (`?sslmode=require`) — el adaptador no fuerza ningún modo. |
| `PAYLOAD_SECRET` | Sí | Siempre (dev, build, runtime) | Secreto de Payload. |
| `NEXT_PUBLIC_SITE_URL` | No (pública) | Producción: build **y** runtime. Dev: opcional. | Se incrusta en el bundle de cliente — de ahí que sea la única variable no-`DATABASE_URI`/`PAYLOAD_SECRET` requerida en build. |
| `PREVIEW_SECRET` | Sí | Producción: solo runtime (arranque real del server, nunca en `next build`). Dev: opcional. | Habilita el botón "Preview" del Admin. |
| `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_PUBLIC_URL` | Sí (excepto `S3_PUBLIC_URL`/`S3_ENDPOINT`/`S3_REGION`/`S3_BUCKET`, que son config no-secreta) | Producción: solo runtime. Dev: opcionales — si están ausentes, `Media` sigue usando almacenamiento local sin cambios. | Ver "Media / Object Storage" abajo. |
| `REVALIDATION_SECRET` | — | Nunca (reservada) | Declarada por el Master Spec pero sin consumidor: la invalidación de cache corre in-process (`revalidateTag` directo desde los hooks de Payload), no hay endpoint HTTP de revalidación externo. No inventar uno solo para justificarla. |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Sí (la password) | Solo si se usa el perfil `self-hosted` de `compose.prod.yaml` | Irrelevantes con un PostgreSQL administrado externo. |

**Por qué `PREVIEW_SECRET`/`S3_*` no se exigen en build pero sí en runtime**: son secretos/config que la aplicación lee vía `process.env` al atender una petición real, nunca se incrustan en el bundle. Exigirlos también en `next build` acoplaría la imagen a secretos operativos que no le corresponden en ese momento — `next build` importa cada módulo de ruta para analizarlo, así que cualquier ruta que solo necesite `DATABASE_URI` (p. ej. `/api/health`) arrastraría, si no, una validación de campos que ni siquiera usa. El mecanismo (`src/lib/env/index.ts`) distingue ambos momentos vía `process.env.NEXT_PHASE === 'phase-production-build'` (fijado por Next solo durante `next build`, nunca en el server real) — verificado empíricamente, no asumido.

Ningún secreto se expone vía `NEXT_PUBLIC_*` (auditado). Ningún `ARG` del Dockerfile lleva un secreto de runtime real.

`GIT_SHA` (ver "Imagen de producción" arriba) no aparece en esta tabla a propósito: no es una variable de `src/lib/env/` — se lee directo de `process.env.GIT_SHA` (mismo patrón que `src/app/api/preview/route.ts`/`src/lib/security/headers.ts`), sin esquema zod y sin exigirse en dev/test, donde no existe.

### `GET /api/health`

```json
{ "status": "ok", "database": "ok", "sha": "a1b2c3d4e5f6..." }
```

- `sha`: el `GIT_SHA` horneado en la imagen que responde (`null` si la imagen se construyó sin ese build-arg, p. ej. en desarrollo). Es el mecanismo que permite confirmar, sondeando este endpoint en vivo, que la release que Dokploy dice haber desplegado es la que realmente quedó sirviendo tráfico — ver `docs/OPERATIONS.md` §"Despliegue".
- Responde siempre `Cache-Control: no-store` — ningún proxy/CDN intermedio debe servir una lectura cacheada de este endpoint, porque invalidaría precisamente la señal de "qué SHA está vivo ahora".
- `503` con `database: "unreachable"` si PostgreSQL no responde — el campo `sha` sigue presente incluso en ese caso.

## Secuencia de despliegue

**Ya no son pasos manuales de `docker build`/`docker run` en el host** — pero tampoco es GitHub Actions quien construye la imagen de producción: Dokploy la construye él mismo, en el VPS, vía su propio Auto Deploy nativo sobre `main`. El runbook operativo (cómo leer una falla, ejecutar un rollback) vive en `docs/OPERATIONS.md` §"Despliegue" — aquí solo el contrato:

```
1. push a main (tras pasar el gate de ci.yml en el PR: quality ->
   integration -> e2e-pr -> docker-build)
2. Dokploy detecta el push (Auto Deploy nativo, configurado en su
   dashboard) -> construye `migrate`/`app` desde compose.dokploy.yaml
   (build: sobre el mismo Dockerfile, sin imágenes pre-construidas)
3. Dokploy corre `migrate` (job de un solo uso) -> si sale 0, arranca/
   reemplaza `app` con la nueva imagen `runner` (si `migrate` falla,
   `app` nunca arranca y la release anterior sigue sirviendo tráfico —
   sin rollback automático)
4. se confirma /api/health = 200 (ya no se puede confirmar por `sha`
   exacto en este modelo — ver "Imagen de producción" arriba)
5. smoke manual: `node scripts/smoke-production.ts` contra PRODUCTION_URL
   (ya no se ejecuta automáticamente desde GitHub Actions)
6. si el plugin/colección de Search cambió (nueva Collection indexada,
   o cambia la extracción `beforeSync`): Reindex manual vía Admin UI —
   ver docs/SEARCH.md y docs/OPERATIONS.md §"Primer arranque". No se
   ejecuta automáticamente en cada despliegue.
```

Sin aprobación manual intermedia: en un proyecto de un solo mantenedor, mergear a `main` ya es la decisión de desplegar. `release.yml` conserva el modelo anterior completo (GHCR + Environment `production` con reviewers) inactivo por defecto, detrás de `workflow_dispatch` con `publish_and_deploy: true`, para quien quiera volver puntualmente a él.

**Invariante**: las migraciones se aplican una sola vez, antes de que la nueva release empiece a servir tráfico. El `CMD`/`ENTRYPOINT` normal de `runner` nunca ejecuta `payload migrate` — ni en el primer arranque ni en reinicios posteriores. Con múltiples réplicas (fuera de alcance de V1), el job de migración debe seguir siendo un paso singleton por release, no uno por réplica.

## `compose.prod.yaml`

Target de verificación production-like / referencia self-hosted — **no** es un compromiso de auto-hospedar PostgreSQL, y **no** es lo que Dokploy despliega en producción real (eso es `compose.dokploy.yaml`, ver abajo). Sigue sirviendo para dos cosas que no cambiaron: el smoke de Docker de CI (`scripts/docker-smoke.sh`, `pnpm test:smoke`) y como referencia local para levantar la topología completa (incluido un Postgres self-hosted desechable) sin depender de Dokploy — por ejemplo, para el drill de restauración (`docs/OPERATIONS.md` §"Drill de restauración"). `compose.yaml` (desarrollo) no se modifica ni se relaciona con este archivo.

```bash
# Con PostgreSQL administrado externo (recomendado, DATABASE_URI ya apunta ahí):
docker compose -f compose.prod.yaml --env-file .env.production up --build -d

# Referencia self-hosted (PostgreSQL vía Docker Compose):
docker compose -f compose.prod.yaml --env-file .env.production --profile self-hosted up --build -d
```

- `migrate`: imagen `migrator`, `restart: "no"`.
- `app`: imagen `runner`, arranca solo tras `migrate: condition: service_completed_successfully`. El `HEALTHCHECK` se hereda de la imagen (no se redeclara en el compose file).
- `db`: **solo existe si se activa el profile `self-hosted`** (`postgres:17-alpine`, puerto no publicado al host, volumen nombrado). Sin ese profile, `DATABASE_URI` debe apuntar a un PostgreSQL ya alcanzable por otro medio (administrado o self-hosted fuera de este compose).
- Ninguna variable tiene un default inseguro (a diferencia de `compose.yaml`, que sí los tiene para desarrollo) — usar un archivo de entorno de producción real vía `--env-file`, nunca el `.env` de desarrollo.

### Aislamiento de proyecto de Compose (regla obligatoria)

**Desarrollo (`compose.yaml`), pruebas (`compose.test.yml`), producción-como-referencia (`compose.prod.yaml`) y el smoke desechable de Fase 11 (`scripts/docker-smoke.sh`) SHALL correr bajo nombres de proyecto de Compose explícitos y distintos entre sí, siempre.** Nunca depender del nombre de proyecto por defecto derivado del directorio de trabajo. `docs/OPERATIONS.md` §"Drill de restauración" reutiliza esta misma regla (`-p 60segundosnoticias-restore`) para un Postgres desechable en la laptop del operador — léase ahí antes de correr cualquier paso destructivo de ese drill.

Esto no es una preferencia de estilo: un incidente real durante Fase 11 (`openspec/changes/testing-qa-performance/design.md`, sección Risks) destruyó la base de datos Postgres de desarrollo porque `compose.prod.yaml` no declaraba `name:`, heredó el mismo namespace de proyecto que `compose.yaml` (ambos derivándolo del directorio), y ambos archivos además reutilizan los mismos nombres de servicio (`app`, `db`). Un `docker compose -f compose.prod.yaml --profile self-hosted up` bajo ese namespace compartido reemplazó los contenedores de desarrollo en ejecución, y la limpieza `down -v` posterior de ese mismo comando eliminó el volumen Postgres de desarrollo real.

Namespaces actuales de este repositorio:

| Compose file | Nombre de proyecto | Origen |
|---|---|---|
| `compose.yaml` (desarrollo) | por defecto (derivado del directorio) | intencional — es el único que debe quedarse así, para no huerfanar volúmenes ya creados en otras máquinas de desarrollo |
| `compose.test.yml` | `60segundosnoticias-test` | `name:` explícito en el archivo |
| `compose.prod.yaml` | `60segundosnoticias-prod` | `name:` explícito en el archivo |
| `scripts/docker-smoke.sh` | `60segundosnoticias-smoke` | `-p` explícito en el propio script, deliberadamente distinto incluso del `name:` de `compose.prod.yaml` |
| `docs/OPERATIONS.md` §"Drill de restauración" (`compose.prod.yaml --profile self-hosted` en la laptop del operador) | `60segundosnoticias-restore` | `-p` explícito en el comando del runbook, nunca el `name:` del archivo |
| `compose.dokploy.yaml` | gestionado internamente por Dokploy, atado a su propio `composeId` | Dokploy invoca este archivo directamente contra el servicio Compose que el operador creó en su instancia — nadie en este repositorio ni el operador corre `docker compose -p ...` a mano contra él; no aplica la misma preocupación de colisión porque Dokploy no comparte ese namespace con `compose.yaml`/`compose.prod.yaml`/`compose.test.yml` del host de desarrollo |

Un nombre de servicio (`app`, `db`) o un nombre de volumen compartido entre archivos **nunca es suficiente aislamiento por sí solo** — el límite de seguridad real es el namespace de proyecto de Compose. `scripts/verify-docker-isolation.sh` (`pnpm test:docker-isolation`) es la prueba de regresión que reproduce esta misma forma de colisión con recursos completamente desechables y prueba que una limpieza `down -v` bajo un proyecto explícito nunca toca otro proyecto.

## Base de datos

Producción sigue siendo **migrations-only** — nunca push mode (ver README.md, "Los cinco roles de la base de datos"). En producción real, `DATABASE_URI` apunta a un servicio de base de datos PostgreSQL 17 gestionado por Dokploy (ver "Topología objetivo (V1)" arriba y `docs/OPERATIONS.md`), con sus propios backups/recovery/upgrades/monitoring — self-hosted vía Docker (`compose.prod.yaml --profile self-hosted`) sigue siendo compatible solo como referencia local, nunca como el camino real de producción; la aplicación, en cualquier caso, solo necesita `DATABASE_URI`.

SSL de un proveedor administrado: se expresa en la propia cadena de conexión (`?sslmode=require` o equivalente del proveedor) — el adaptador no asume ni fuerza ningún modo, así que desarrollo (sin SSL) sigue funcionando sin cambios.

## Media / Object Storage

Producción usa un adaptador S3-compatible (`src/payload/plugins/media-storage.ts`, plugin oficial de Payload) — activo únicamente si las seis variables `S3_*` están presentes; si falta alguna, `Media` sigue usando almacenamiento local (comportamiento de desarrollo sin cambios). El adaptador no se acopla a un proveedor concreto: cualquier endpoint S3-compatible funciona (Cloudflare R2 es la opción recomendada por el Master Spec, no la única soportada). Las URLs servidas apuntan directo al Object Storage/CDN configurado (`S3_PUBLIC_URL`) — el App Container nunca actúa como proxy de lectura de archivos, y el filesystem del container en producción se considera efímero.

## Búsqueda (Search)

Sin cambios respecto a `docs/SEARCH.md`: el índice vive en PostgreSQL (Collection `search`, sin filesystem propio), se sincroniza automáticamente al publicar/editar Posts o Pages, y el reindex manual (`POST /api/search/reindex`, requiere Admin) es idempotente y **nunca** se dispara automáticamente al arrancar. Recrear el App Container no afecta el índice — vive en Postgres, no en el container.

## Headers de seguridad

Dos puntos de entrada, según si el header depende de configuración de
runtime (openspec/changes/s3-next-image-compatibility):

- **`next.config.ts` (build time, vía `src/lib/security/headers.ts`)** —
  headers que no dependen de ninguna variable de entorno de solo-runtime:
  - A **todas** las rutas (incluido `/admin`, incluidas las de API):
    `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
  - Solo a rutas públicas (todo excepto `/admin` y `/api`):
    `Strict-Transport-Security` — emitido solo si `NEXT_PUBLIC_SITE_URL`
    es `https://` (señal de que el tráfico llega por TLS; no se fuerza en
    una verificación local sin TLS). `NEXT_PUBLIC_SITE_URL` ya es un
    build `ARG`, así que su valor resuelto en build time es el correcto
    para ese despliegue.
- **`src/proxy.ts` (runtime, en cada petición a una ruta pública)** —
  `Content-Security-Policy`, derivada de los proveedores de embed reales
  del código (YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook,
  LinkedIn) más el origen de `S3_PUBLIC_URL`. Esta directiva SHALL NOT
  vivir en `next.config.ts`: `output: standalone` congela el `images`/
  `headers()` resuelto de `next.config.ts` en el `server.js` generado, y
  `S3_PUBLIC_URL` es, deliberadamente, una variable exclusivamente de
  runtime (nunca un build `ARG` — ver más abajo), así que un valor
  derivado de ella nunca sería correcto para todos los despliegues si se
  calculara en build time. `src/proxy.ts` usa el mismo patrón de rutas
  públicas (`/((?!admin|api).*)`) que ya excluye Admin/API arriba.
  **Importante**: en un proyecto con directorio `src/` (como este), Next
  ignora silenciosamente un `proxy.ts` puesto en la raíz del repo — debe
  vivir junto a `src/app`.

`/admin`/`/api` quedan deliberadamente fuera de la CSP: no se auditó el bundle de Payload Admin lo suficiente como para garantizar que una CSP estricta no lo rompa, y los headers base (los tres de arriba) ya aplican ahí también. `script-src`/`style-src` incluyen `'unsafe-inline'` — una concesión deliberada (el App Router incrusta datos de hidratación inline, y un componente de embeds de terceros inserta un `<style>` propio) documentada en `src/lib/security/headers.ts`; una CSP estricta por nonce requeriría más superficie en `src/proxy.ts`, decisión explícitamente fuera de esta fase.

Los mismos componentes que renderizan Media de Payload vía `next/image`
(`ResponsiveMedia`, `ArticleMetadata`, `AuthorCard`, `VideoFeatureSection`,
`VideoPlayer`) usan `unoptimized`: el optimizador de imágenes de Next
necesitaría `images.remotePatterns` — también congelado en build time —
para servir Media desde un host S3-compatible conocido solo en runtime.
El navegador solicita el objeto directo al Object Storage/CDN
configurado, consistente con que el App Container nunca actúa como proxy
de lectura de archivos.

## TLS / proxy

El container de producción **no termina TLS**. La frontera esperada es `Internet -> CDN/reverse proxy/plataforma (TLS) -> App Container`, sin Nginx/Caddy embebido en la imagen. La configuración de ese borde (certificados, `X-Forwarded-*`, cookies seguras) es responsabilidad del proveedor/plataforma de hosting, fuera de este repositorio.

## Primer usuario Admin

**No existe un bypass automático de "crear primer usuario" en este proyecto** — verificado directamente: `POST /api/users` contra una base recién migrada y sin usuarios devuelve `403`, porque la Collection `Users` usa control de acceso custom (`create: isAdmin`) sin excepción para el primer documento. El Admin UI, al usar el mismo endpoint por debajo, tampoco lo evita.

La regla siempre fue **nunca commitear credenciales de Admin** — nunca prohibió commitear un *script*. Por eso `scripts/create-admin.ts` está committeado al repositorio: usa la Local API con `overrideAccess: true` (misma técnica que `src/payload/seed/dev.ts` para sus Writers de desarrollo, con `role: 'admin'`), lee `ADMIN_EMAIL`/`ADMIN_PASSWORD` desde el entorno de ejecución (sin valor por defecto — nunca hardcodeadas) y es idempotente (no-op si ya existe cualquier usuario). Se ejecuta en el VPS con el container `migrate` de un solo uso:

```bash
ADMIN_EMAIL=admin@ejemplo.com ADMIN_PASSWORD=... \
  docker compose run --rm migrate pnpm payload run scripts/create-admin.ts
```

Ver `docs/OPERATIONS.md` §"Primer arranque" para dónde encaja este paso dentro de la secuencia completa (deploy → migrate → health → Admin → seeds → contenido → Reindex → smoke).

## Seeds

`seed:dev` **nunca** debe correr contra una base de producción — crea contenido de demostración y usuarios con contraseña de desarrollo hardcodeada, y su propio comentario en el código lo advierte explícitamente. `seed:initial` es idempotente y seguro de correr manualmente (Categories base + un `Home` mínimo si está vacío), pero tampoco se ejecuta automáticamente — es una acción explícita del operador, no parte del arranque del container.

## Verificación / troubleshooting

- **Build falla con "Configuración de entorno inválida"**: falta una variable requerida para la fase actual — ver "Contrato de entorno" arriba para saber si le corresponde a build o a runtime.
- **Build falla en "Export encountered an error on /(frontend)/page"**: `DATABASE_URI` no es alcanzable, o la base no tiene el schema de esta release — correr `migrator` contra ella primero.
- **`migrator` parece colgado, sin salida ni error**: casi seguro un prompt interactivo de Payload sin TTY para responderlo (drift de push-mode). No debería ocurrir con la imagen `migrator` de este repo (fija `NODE_ENV=production`), pero si se invoca `payload migrate` por otra vía, correrlo contra una base que push mode no haya tocado, o desde una terminal interactiva.
- **`/api/health` devuelve `503`**: PostgreSQL inalcanzable desde el App Container — revisar red/`DATABASE_URI`, no la aplicación.
- **`/api/health` responde `200` pero `sha` es `null`**: esperado en el modelo actual — `compose.dokploy.yaml` construye sin pasar `GIT_SHA` como build-arg (ver "Imagen de producción" arriba). No es un síntoma de falla. Si se usa el modelo legado (`release.yml` con `publish_and_deploy: true`), `scripts/dokploy-deploy.ts` sí clasifica fallas por SHA — ver `docs/OPERATIONS.md` §"Despliegue".
- **Imagen sube a Medias local en vez de a Object Storage**: falta alguna de las seis variables `S3_*` — el adaptador se desactiva por completo si falta cualquiera, no parcialmente.

## Fuera de alcance de esta fase

Los cuatro puntos que este documento marcaba como pendientes tras Phase 10 (Release Readiness) ya quedaron obsoletos o resueltos por fases posteriores:

- ~~Política y automatización de backups (DB y Media)~~ → **resuelto**: PostgreSQL de producción es un servicio gestionado por Dokploy con backup/restore nativo a S3; Media usa su propio Object Storage S3-compatible desde Phase 10. Runbook completo, con las dos bitácoras vivas, en `docs/OPERATIONS.md`.
- ~~CI~~ → `ci.yml` califica cada PR/merge (quality/integration/e2e-pr/docker-build) — ver `docs/TESTING.md` §"Niveles de CI". La entrega a producción ya no pasa por GitHub Actions: Dokploy construye y despliega solo desde `main` vía su Auto Deploy nativo. `release.yml` (QA extendida manual) y `rollback.yml` (rollback por git, con el modelo de imágenes GHCR conservado como opción legada) siguen existiendo como herramientas bajo demanda, no como parte del camino automático.
- ~~Aprovisionamiento real del proveedor de hosting, PostgreSQL administrado y bucket de Object Storage~~ → **parcialmente resuelto**: el operador ya tiene el VPS con Dokploy instalado, y Object Storage de Media ya está en uso desde Phase 10. Crear ahí el servicio Compose y el servicio de base de datos PostgreSQL, generar el token de API de Dokploy y crear el GitHub Environment `production` siguen siendo prerrequisitos manuales del operador (`openspec/changes/archive/2026-09-20-production-deployment-dokploy/design.md`, "Prerrequisitos manuales") — no automatizados por este repositorio, y bloquean únicamente la verificación en vivo de un despliegue real, no la implementación.
- ~~Dominio, certificados TLS reales, `noindex` de staging~~ → **sigue genuinamente fuera de alcance**: el container de producción no termina TLS (ver "TLS / proxy" arriba); el dominio, los certificados y cualquier reverse proxy/Traefik siguen siendo responsabilidad de la plataforma/Dokploy, nunca de este repositorio.

Lo que sigue genuinamente fuera de alcance de este repositorio: TLS/dominio/Traefik (arriba), aprovisionar un VPS nuevo desde cero (el procedimiento de *recrear* la base de datos en uno ya aprovisionado sí está documentado — `docs/OPERATIONS.md` §"Recrear la base en otro servidor"), múltiples réplicas del App Container (ver "Topología objetivo (V1)" arriba), y rollback automático de esquema de base de datos (`payload migrate:down` en producción — deliberadamente nunca implementado; ver `docs/OPERATIONS.md` §"Rollback").
