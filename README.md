# 60 Segundos Noticias

Portal editorial y multimedia construido con Next.js + Payload CMS + PostgreSQL.

## Estado del proyecto

El repositorio completó **Phase 0 (Bootstrap)** y **Phase 1 (Technical Foundation)**: existe una aplicación Next.js + Payload funcional, conectada a PostgreSQL, con validación de entorno, endpoint de salud y un entorno de desarrollo reproducible vía Docker Compose. Payload todavía no define Collections ni Globals editoriales (`Users`, `Posts`, `Categories`, etc.) — eso corresponde a fases posteriores del `docs/60-segundos-spec.md`.

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
pnpm dev         # next dev — servidor de desarrollo
pnpm build       # next build — build de producción
pnpm start       # next start — sirve el build de producción
pnpm lint        # eslint .
pnpm typecheck   # tsc --noEmit
```

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
- `docs/AI-WORKFLOW.md` — workflow de desarrollo asistido por IA / SDD.
- `docs/AI-SKILLS.md` — registro humano de project skills.
- `docs/ASSETS.md` — inventario y reglas de assets visuales.
- `AGENTS.md` — reglas vendor-neutral para agentes de código.
- `docs/references/home-reference.jpeg` — North Star visual (referencia, no es asset de producción).
- `public/branding/`, `public/textures/` — identidad visual y texturas de producción.
