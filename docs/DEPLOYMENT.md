# Despliegue en producción

Referencia operativa para construir, desplegar y verificar la aplicación en producción (Phase 10 — Docker + Production Hardening). Complementa, sin duplicar, `docs/60-segundos-spec.md` (especificación objetivo) y `README.md` (flujo de desarrollo). No cubre aprovisionamiento de infraestructura real (proveedor de hosting, PostgreSQL administrado, bucket de Object Storage, dominio, backups) — eso es Phase 12 (Release Readiness); aquí se documenta el contrato y el flujo que cualquier proveedor debe satisfacer.

## Topología objetivo (V1)

```
Internet
   |
   v
TLS / CDN / reverse proxy / plataforma   <- fuera de este repo; ver "TLS" abajo
   |
   v
un único App Container (stage `runner`)
   |-- PostgreSQL vía DATABASE_URI (administrado o self-hosted)
   `-- Object Storage S3-compatible vía S3_* (Media)
```

V1 objetivo es **instancia única**. Antes de escalar a múltiples réplicas hace falta resolver, además de lo que ya está resuelto aquí (Object Storage ya es compartido/replica-safe):

- coordinación de invalidación de cache entre réplicas (hoy es in-process, por proceso — ver "Cache y revalidación" abajo);
- el job de migración debe seguir siendo singleton (una sola ejecución por release, nunca una por réplica);
- revisar el pool de conexiones de PostgreSQL según el límite del proveedor.

No se implementa nada de esto en V1 — se documenta como límite conocido, no como bloqueante.

## Imagen de producción

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
  -t 60segundos-app:runner .
```

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

## Secuencia de despliegue

```
1. asegurar acceso de red desde el build a un PostgreSQL con el schema
   de ESTA release ya aplicado (ver punto 2 — puede ser un paso previo
   contra una base de verificación desechable, no necesariamente la de
   producción)
2. construir la imagen `migrator` y correrla una vez contra el
   PostgreSQL objetivo -> debe salir con código 0 antes de continuar
   (si falla: el release se detiene aquí; la versión anterior de `runner`
   sigue sirviendo tráfico; el operador corrige y reintenta el job, sin
   rollback destructivo automático — migraciones forward-only)
3. construir la imagen `runner` (ahora el schema ya está al día)
4. arrancar/reemplazar el container `runner` con la nueva imagen
5. esperar /api/health = 200 (readiness)
6. si el plugin/colección de Search cambió (nueva Collection indexada,
   primer despliegue tras Phase 9): Reindex manual vía Admin UI o
   `POST /api/search/reindex` (Admin) — ver docs/SEARCH.md. No se
   ejecuta automáticamente en cada arranque.
7. verificar endpoints públicos
```

**Invariante**: las migraciones se aplican una sola vez, antes de que la nueva release empiece a servir tráfico. El `CMD`/`ENTRYPOINT` normal de `runner` nunca ejecuta `payload migrate` — ni en el primer arranque ni en reinicios posteriores. Con múltiples réplicas (fuera de alcance de V1), el job de migración debe seguir siendo un paso singleton por release, no uno por réplica.

## `compose.prod.yaml`

Target de verificación production-like / referencia self-hosted — **no** es un compromiso de auto-hospedar PostgreSQL. `compose.yaml` (desarrollo) no se modifica ni se relaciona con este archivo.

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

**Desarrollo (`compose.yaml`), pruebas (`compose.test.yml`), producción-como-referencia (`compose.prod.yaml`) y el smoke desechable de Fase 11 (`scripts/docker-smoke.sh`) SHALL correr bajo nombres de proyecto de Compose explícitos y distintos entre sí, siempre.** Nunca depender del nombre de proyecto por defecto derivado del directorio de trabajo.

Esto no es una preferencia de estilo: un incidente real durante Fase 11 (`openspec/changes/testing-qa-performance/design.md`, sección Risks) destruyó la base de datos Postgres de desarrollo porque `compose.prod.yaml` no declaraba `name:`, heredó el mismo namespace de proyecto que `compose.yaml` (ambos derivándolo del directorio), y ambos archivos además reutilizan los mismos nombres de servicio (`app`, `db`). Un `docker compose -f compose.prod.yaml --profile self-hosted up` bajo ese namespace compartido reemplazó los contenedores de desarrollo en ejecución, y la limpieza `down -v` posterior de ese mismo comando eliminó el volumen Postgres de desarrollo real.

Namespaces actuales de este repositorio:

| Compose file | Nombre de proyecto | Origen |
|---|---|---|
| `compose.yaml` (desarrollo) | por defecto (derivado del directorio) | intencional — es el único que debe quedarse así, para no huerfanar volúmenes ya creados en otras máquinas de desarrollo |
| `compose.test.yml` | `60segundosnoticias-test` | `name:` explícito en el archivo |
| `compose.prod.yaml` | `60segundosnoticias-prod` | `name:` explícito en el archivo |
| `scripts/docker-smoke.sh` | `60segundosnoticias-smoke` | `-p` explícito en el propio script, deliberadamente distinto incluso del `name:` de `compose.prod.yaml` |

Un nombre de servicio (`app`, `db`) o un nombre de volumen compartido entre archivos **nunca es suficiente aislamiento por sí solo** — el límite de seguridad real es el namespace de proyecto de Compose. `scripts/verify-docker-isolation.sh` (`pnpm test:docker-isolation`) es la prueba de regresión que reproduce esta misma forma de colisión con recursos completamente desechables y prueba que una limpieza `down -v` bajo un proyecto explícito nunca toca otro proyecto.

## Base de datos

Producción sigue siendo **migrations-only** — nunca push mode (ver README.md, "Los cuatro roles de la base de datos"). PostgreSQL administrado (recomendado: backups, recovery, upgrades, monitoring gestionados por el proveedor) y self-hosted vía Docker siguen siendo compatibles; la aplicación solo necesita `DATABASE_URI`.

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

Para crear el primer Admin, correr un script de un solo uso vía la Local API con `overrideAccess: true` (misma técnica que ya usa `src/payload/seed/dev.ts` para sus Writers de desarrollo, con `role: 'admin'` en vez de `'writer'`), ejecutado con `pnpm payload run <script>.ts` contra el `DATABASE_URI` de destino, y luego borrado. No hay ni debe crearse un usuario/contraseña de Admin por defecto committeado al repositorio.

## Seeds

`seed:dev` **nunca** debe correr contra una base de producción — crea contenido de demostración y usuarios con contraseña de desarrollo hardcodeada, y su propio comentario en el código lo advierte explícitamente. `seed:initial` es idempotente y seguro de correr manualmente (Categories base + un `Home` mínimo si está vacío), pero tampoco se ejecuta automáticamente — es una acción explícita del operador, no parte del arranque del container.

## Verificación / troubleshooting

- **Build falla con "Configuración de entorno inválida"**: falta una variable requerida para la fase actual — ver "Contrato de entorno" arriba para saber si le corresponde a build o a runtime.
- **Build falla en "Export encountered an error on /(frontend)/page"**: `DATABASE_URI` no es alcanzable, o la base no tiene el schema de esta release — correr `migrator` contra ella primero.
- **`migrator` parece colgado, sin salida ni error**: casi seguro un prompt interactivo de Payload sin TTY para responderlo (drift de push-mode). No debería ocurrir con la imagen `migrator` de este repo (fija `NODE_ENV=production`), pero si se invoca `payload migrate` por otra vía, correrlo contra una base que push mode no haya tocado, o desde una terminal interactiva.
- **`/api/health` devuelve `503`**: PostgreSQL inalcanzable desde el App Container — revisar red/`DATABASE_URI`, no la aplicación.
- **Imagen sube a Medias local en vez de a Object Storage**: falta alguna de las seis variables `S3_*` — el adaptador se desactiva por completo si falta cualquiera, no parcialmente.

## Fuera de alcance de esta fase (Phase 12 — Release Readiness)

- Aprovisionamiento real del proveedor de hosting, PostgreSQL administrado y bucket de Object Storage.
- Política y automatización de backups (DB y Media).
- Dominio, certificados TLS reales, `noindex` de staging.
- CI (Phase 11) — este documento define los comandos que una futura CI debe encadenar (`typecheck`, `lint`, `next build`, `docker build`, boot del container, `/api/health`, migración contra una base desechable), no la implementa.
