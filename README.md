# 60 Segundos Noticias

Portal editorial y multimedia construido con Next.js + Payload CMS + PostgreSQL.

## Estado del proyecto

El repositorio completó **Phase 0 (Bootstrap)** a **Phase 7 (Category + Article + Pages)** de `docs/60-segundos-spec.md`: existe una aplicación Next.js + Payload funcional, conectada a PostgreSQL, con validación de entorno, endpoint de salud, entorno de desarrollo reproducible vía Docker Compose, las 7 Collections de V1 (`Users`, `Media`, `Categories`, `Tags`, `Posts`, `Pages`, `Redirects`) con su schema, relaciones y control de acceso base, y el ciclo de vida editorial completo sobre Posts (Phase 3): generación de slug desde el título (sin regeneración automática), ownership de Writer aplicado server-side (un Writer solo lee/edita/publica sus propios Posts, más los publicados de otros autores), validación de campos obligatorios al publicar, `publishedAt` estable a través de ediciones/unpublish-republish/restauración de versiones, cálculo automático de `readingTimeMinutes`, protecciones de eliminación (Categories/Users/Media referenciados) y los scripts `seed:initial`/`seed:dev`. El Design System (Phase 4: `docs/DESIGN-SYSTEM.md`), el frontend público con los Globals `Navigation`/`Footer`/`SiteSettings` (Phase 5), el Home Global dinámico con sus 8 Home Blocks V1 (Phase 6), y las rutas públicas de Category/Article/Page genérica con sus 6 Article Content Blocks y 8 Page Blocks (Phase 7: `docs/FRONTEND-ARCHITECTURE.md`) también están implementados. Draft Mode/preview, SEO/cache, redirects automáticos y búsqueda todavía no existen — corresponden a fases posteriores de `docs/60-segundos-spec.md`.

## Stack técnico

- **Next.js** (App Router) + **TypeScript**
- **Payload CMS** integrado en la misma aplicación Next.js
- **PostgreSQL** vía `@payloadcms/db-postgres`
- **Tailwind CSS** + **shadcn/ui** (primitivos) + **Lucide** (iconografía)
- **pnpm** como package manager
- **Docker** / **Docker Compose** para desarrollo reproducible

Ver `package.json` para las versiones exactas instaladas.

## Prerrequisitos

- Node.js `>=20.9.0` (ver `engines` en `package.json`)
- pnpm 10.x (recomendado vía Corepack: `corepack enable`)
- Docker y Docker Compose (para el flujo de desarrollo recomendado)

## Configuración del entorno

Copia la plantilla y completa los valores necesarios:

```bash
cp .env.example .env
```

Variables definidas en `.env.example`:

| Variable | Uso |
|---|---|
| `DATABASE_URI` | Cadena de conexión de PostgreSQL usada por Payload. El valor por defecto apunta al host `db` (Docker Compose). |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciales usadas por el servicio `db` de Docker Compose. |
| `PAYLOAD_SECRET` | Secreto de Payload. **Requerido** (no puede quedar vacío) — la app falla al arrancar/hacer build si falta. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (única variable pensada para el cliente). |
| `PREVIEW_SECRET`, `REVALIDATION_SECRET` | Reservadas para preview/revalidation (aún no implementadas). |
| `S3_*` | Reservadas para almacenamiento de objetos en producción (aún no implementado). |

La validación de entorno (`src/lib/env/`) exige como mínimo `DATABASE_URI` y `PAYLOAD_SECRET`; el resto son opcionales en esta fase.

## Desarrollo con Docker (recomendado)

Levanta la aplicación y PostgreSQL juntos:

```bash
docker compose up --build
```

- App: http://localhost:3000
- Payload Admin: http://localhost:3000/admin
- Health check: http://localhost:3000/api/health

El código fuente se monta dentro del contenedor `app` para Fast Refresh; `node_modules` y `.next` viven en volúmenes propios del contenedor y no se sobrescriben con los del host.

```bash
docker compose down       # detiene los contenedores, conserva los datos de PostgreSQL
docker compose down -v    # detiene los contenedores y elimina el volumen de PostgreSQL
docker compose ps         # estado/health de los servicios
docker compose logs -f app
```

### Levantar solo PostgreSQL

```bash
docker compose up -d db
```

En la configuración actual el servicio `db` **no publica su puerto al host** (solo es alcanzable desde otros contenedores de la misma red de Compose, en `db:5432`). Para conectarte a esa base de datos directamente usa:

```bash
docker compose exec db psql -U postgres -d 60segundos
```

## Desarrollo local sin Docker

```bash
pnpm install
pnpm dev
```

Esto requiere una instancia de PostgreSQL alcanzable desde tu máquina en la `DATABASE_URI` configurada en `.env` (por ejemplo, un PostgreSQL instalado localmente). El `db` de Docker Compose por sí solo **no** sirve para este flujo, ya que no expone su puerto al host (ver sección anterior); si necesitas `pnpm dev` contra Postgres en Docker, usa una `DATABASE_URI` apuntando a una instancia que sí sea accesible desde el host.

## Comandos pnpm útiles

Definidos en `package.json`:

```bash
pnpm dev              # next dev — servidor de desarrollo
pnpm build            # next build — build de producción
pnpm start            # next start — sirve el build de producción
pnpm lint             # eslint .
pnpm typecheck        # tsc --noEmit
pnpm payload <cmd>    # acceso directo al CLI de Payload
pnpm generate:types   # payload generate:types — regenera src/payload-types.ts
pnpm migrate:create   # payload migrate:create — genera una nueva migración
pnpm migrate          # payload migrate — aplica migraciones pendientes
pnpm seed:initial     # payload run src/payload/seed/initial.ts — baseline idempotente (Categories)
pnpm seed:dev         # payload run src/payload/seed/dev.ts — contenido de desarrollo/demo
```

## Payload CMS y base de datos

Las 7 Collections de V1 (`Users`, `Media`, `Categories`, `Tags`, `Posts`, `Pages`, `Redirects`) están registradas en `payload.config.ts`. En desarrollo, Payload sincroniza el schema automáticamente contra PostgreSQL (push mode); no es necesario ejecutar migraciones para iterar localmente.

`pnpm migrate:create`/`pnpm migrate` necesitan una `DATABASE_URI` alcanzable, igual que `pnpm dev` (ver "Desarrollo local sin Docker" más arriba). Ejecútalos dentro del contenedor `app`, no en el host, salvo que tengas PostgreSQL accesible localmente:

```bash
docker compose run --rm app pnpm migrate:create nombre_descriptivo
docker compose run --rm app pnpm migrate
```

Esto genera un archivo en `src/payload/migrations/`. Revísalo, y commitéalo junto con tu cambio — las migraciones de este proyecto son explícitas y versionadas, no se ejecutan automáticamente al iniciar la aplicación en producción (eso se define en una fase posterior).

**Cuidado al mezclar push mode con `migrate`**: si la base de datos ya fue sincronizada por push mode (por ejemplo, tras usar `docker compose up` normalmente), `payload migrate` puede pedir una confirmación interactiva ("It looks like you've run Payload in dev mode... proceed?") antes de aplicar. Sin una terminal interactiva adjunta (scripts, `docker compose run --rm` sin `-it`, CI) ese prompt se queda esperando input indefinidamente sin mostrar ningún error — si un comando de migración parece colgado sin salida, es casi seguro esta confirmación sin responder. Ejecuta `migrate` contra una base de datos que push mode todavía no haya tocado, o hazlo desde una terminal interactiva donde puedas responder el prompt.

### Los cuatro roles de la base de datos en este proyecto

Payload PostgreSQL soporta push mode y `migrate` como flujos deliberadamente distintos, y este proyecto los mantiene separados en cuatro roles que nunca se mezclan:

1. **Base de datos de desarrollo local** (`docker compose up`, el volumen `postgres_data`): sandbox gestionado por push mode. Payload sincroniza el schema automáticamente contra ella; nunca se le corre `pnpm migrate` directamente, porque ya no coincide con el ledger de migraciones (`payload_migrations` solo tiene la fila marcadora `dev`). Iterar aquí no requiere migraciones.
2. **Migraciones en `src/payload/migrations/`**: artefactos generados por `pnpm migrate:create`, revisados a mano y versionados en git junto con el cambio de código que los origina. Describen el schema que debe existir en cualquier base gestionada por `migrate` — no se ejecutan contra la base de desarrollo local.
3. **Verificación de la cadena de migraciones**: antes de confiar en una migración nueva, se aplica contra una base PostgreSQL limpia y desechable (por ejemplo, `CREATE DATABASE` temporal en el mismo servidor, o un contenedor Postgres aparte), corriendo la cadena completa desde cero (`pnpm migrate` contra esa base con su propio `DATABASE_URI`) y confirmando con `payload migrate:status` que todas las migraciones quedan `Ran: Yes`. La base desechable se destruye después; la de desarrollo nunca se toca en este proceso.
4. **Orquestación de migraciones en producción/CI**: automatizar `migrate` como parte de un pipeline de despliegue es una decisión de infraestructura de Fase 10 (Docker + Production Hardening), no de fases anteriores.

Para regenerar los tipos de TypeScript después de cambiar cualquier Collection:

```bash
pnpm generate:types
```

`src/payload-types.ts` se commitea al repositorio.

Phase 3 agregó una migración adicional (`src/payload/migrations/20260909_220506_add_media_uploaded_by.ts`) que añade el campo `uploadedBy` a `Media`; se aplica con el mismo flujo `pnpm migrate` descrito arriba.

## Seeds

`pnpm seed:initial` y `pnpm seed:dev` usan `payload run`, el mismo mecanismo de carga de `payload.config.ts` que `generate:types`/`migrate` — ejecútalos dentro del contenedor `app` por la misma razón (`DATABASE_URI` alcanzable), igual que el resto de los comandos de Payload:

```bash
docker compose exec app pnpm seed:initial
docker compose exec app pnpm seed:dev
```

- `seed:initial` crea las Categories base del proyecto y, si `Home.layout` está vacío, un baseline de un único bloque `CategoryExplorer` referenciándolas (Phase 6 — nunca sobrescribe una configuración de Home ya guardada); es idempotente — se puede ejecutar varias veces sin crear duplicados. No crea `Navigation`/`Footer`/`SiteSettings` — esos Globals se administran directamente en Payload Admin, sin seed.
- `seed:dev` crea contenido de ejemplo (Writers, Media, una Page, un Post en Draft, y 25 Posts publicados repartidos entre las 5 Categories — 5 por categoría) para desarrollo local, y anexa a `Home.layout` (sin reemplazarlo) bloques de ejemplo para los 8 tipos de bloque de Home V1 (`EditorialIntro`, `HeroNews`, `LatestPosts`, `PostsByCategory` por categoría, `FeaturedPosts`, `VideoFeature`, `Banner`). **No se ejecuta nunca automáticamente** (ni en el arranque de la app ni en producción) — solo cuando se invoca explícitamente. No contiene credenciales reales.

## Build y arranque en producción

```bash
pnpm build
pnpm start
```

Requiere que `.env` (o las variables de entorno equivalentes) esté disponible, ya que el build valida `DATABASE_URI`/`PAYLOAD_SECRET` al recolectar datos de página.

El `Dockerfile` define una etapa `builder` que ejecuta `pnpm build`, pero **no está pensada para invocarse de forma aislada** (`docker build --target builder .` falla porque `.env` está excluido del build context vía `.dockerignore` y el Dockerfile no declara `ARG`/`ENV` para pasar las variables críticas en build time). El flujo de Docker verificado y soportado hoy es el de desarrollo (`docker compose up`, etapa `development`). Una etapa `runner` de producción endurecida, junto con el wiring de variables de build, corresponde a una fase posterior del roadmap.

## Health check

```
GET /api/health
```

Responde `200` con `{"status":"ok","database":"ok"}` cuando la aplicación y la conexión a PostgreSQL están operativas, o `503` con `{"status":"degraded","database":"unreachable"}` si la base de datos no responde. Nunca incluye cadenas de conexión, contraseñas ni el `PAYLOAD_SECRET`.

Verificación rápida:

```bash
curl http://localhost:3000/api/health
```

Este mismo endpoint es el que usa el healthcheck del servicio `app` en `compose.yaml`.

## Comandos Docker relevantes

```bash
docker compose build           # reconstruye la imagen de desarrollo
docker compose up              # levanta app + db (foreground)
docker compose up -d           # levanta app + db (background)
docker compose down            # detiene, conserva datos
docker compose down -v         # detiene, elimina también el volumen de PostgreSQL
docker compose ps              # estado y health de los servicios
docker compose logs -f app     # logs de la aplicación
docker compose logs -f db      # logs de PostgreSQL
docker compose exec db psql -U postgres -d 60segundos
```

## Desarrollo asistido por IA (opcional)

Este repositorio incluye tooling de desarrollo asistido por IA (OpenSpec, Graphify, Claude Code/Codex, project skills). **No son requisitos para instalar, ejecutar, compilar ni desplegar la aplicación** — son solo de desarrollo y no forman parte del runtime ni del container de producción.

- `docs/AI-WORKFLOW.md` — workflow de desarrollo asistido por IA / SDD (Master Spec → Graphify → OpenSpec → implementación → verify → archive).
- `docs/AI-SKILLS.md` — registro/routing de los project skills adoptados (`skills-lock.json` es el roster bloqueado).
- `docs/60-segundos-spec.md` — Master Specification: especificación funcional, editorial, visual y técnica completa de V1.

Para comprobar/preparar ese entorno opcional:

```bash
./scripts/ai/check-environment.sh
```

`openspec/config.yaml` contiene el contexto y las reglas usadas por los OpenSpec changes; `openspec/specs/` documenta el comportamiento ya implementado y verificado (archivado por change).

## Referencias de documentación

- `docs/60-segundos-spec.md` — Master Specification (estado objetivo de V1).
- `docs/DESIGN-SYSTEM.md` — referencia de implementación del Design System (Phase 4).
- `docs/FRONTEND-ARCHITECTURE.md` — referencia de arquitectura del frontend (DAL, View Models, resolvers, Home Block Pipeline — Phases 5-6).
- `docs/AI-WORKFLOW.md` — workflow de desarrollo asistido por IA / SDD.
- `docs/AI-SKILLS.md` — registro humano de project skills.
- `docs/ASSETS.md` — inventario y reglas de assets visuales.
- `AGENTS.md` — reglas vendor-neutral para agentes de código.
- `docs/references/home-reference.jpeg` — North Star visual (referencia, no es asset de producción).
- `public/branding/`, `public/textures/` — identidad visual y texturas de producción.
