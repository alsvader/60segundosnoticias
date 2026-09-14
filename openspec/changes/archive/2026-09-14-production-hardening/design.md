## Context

Ver `proposal.md` para la motivación completa. Estado relevante para el diseño:

- `Dockerfile` actual: `base → deps → development | builder`; `builder` corre `pnpm build` pero no produce ningún artefacto ejecutable en producción.
- `next.config.ts` es `withPayload({})`: sin `output`, sin `headers()`.
- `payload.config.ts` usa `postgresAdapter({ pool: { connectionString: DATABASE_URI }, migrationDir: 'src/payload/migrations' })`, sin SSL/pool explícitos.
- `Media` (`src/payload/collections/Media.ts`) no tiene adaptador de storage — usa disco local por default de Payload.
- `src/lib/env/index.ts` valida `DATABASE_URI`/`PAYLOAD_SECRET` como requeridos; `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `REVALIDATION_SECRET` y las `S3_*` son `.optional()` en el mismo schema para dev y prod. `payload.config.ts` usa un schema separado y mínimo (`src/lib/env/payload.ts`) porque también se carga fuera del bundler de Next (CLI de Payload).
- `REVALIDATION_SECRET` no tiene ningún consumidor en el código: toda la invalidación de cache ocurre in-process (hooks `afterChange`/`afterDelete` de Payload llaman `revalidateTag()` directamente, mismo proceso Node). El Master Spec (§65) sí lo enumera como variable conceptual.
- Decisiones A/B/C ya ratificadas por el usuario en la exploración previa (ver historial de la sesión): job de migración de un solo uso separado del arranque normal; `compose.prod.yaml` como target production-like/self-hosted sin comprometer PostgreSQL auto-hospedado; adopción de `output: 'standalone'` con separación runner/migrator.

## Goals / Non-Goals

**Goals:**
- Producir una imagen Docker de producción ejecutable (`runner`) basada en la salida standalone de Next.js.
- Separar la ejecución de migraciones (`migrator`) del arranque normal del App Container, de forma provider-neutral (Compose local o plataforma gestionada).
- Conectar `Media` a almacenamiento S3-compatible en producción sin acoplarse a un proveedor.
- Validar en producción las variables de entorno que el runtime de producción realmente necesita, sin romper development.
- Configurar headers de seguridad de producción derivados del uso real de embeds y de Payload Admin.
- Documentar la topología de instancia única y sus límites conocidos.

**Non-Goals:**
- No se aprovisiona PostgreSQL administrado ni el bucket S3/R2 real (Phase 12).
- No se implementa CI (Phase 11); esta fase deja los comandos de verificación documentados y reproducibles para que Phase 11 los conecte.
- No se implementa coordinación distribuida de cache, Redis, colas, ni soporte multi-réplica real — solo se documentan los límites.
- No se automatiza el reindex de Search en el arranque; se documenta el runbook manual ya existente (`docs/SEARCH.md`).
- No se implementa backup/restore automatizado (Phase 12); solo el principio operativo (respaldar antes de migraciones sensibles).

## Decisions

### 1. Dockerfile: stages `runner` y `migrator` sobre `output: 'standalone'`

```
base -> deps -> development (sin cambios, uso dev)
             -> builder (pnpm build; con output:'standalone' genera .next/standalone + .next/static)
                   -> runner    (imagen de aplicación: node server.js)
                   -> migrator  (imagen de operación: pnpm payload migrate)
```

`runner` copia únicamente `.next/standalone`, `.next/static`, `public/` y los artefactos que Next standalone traza como necesarios; corre como usuario no-root; `CMD` en forma exec (`["node", "server.js"]`, verificando el nombre real generado antes de fijarlo); expone el puerto de la app; `HEALTHCHECK` reutiliza el patrón `node -e fetch('http://localhost:PORT/api/health')` ya usado en `compose.yaml` (sin instalar curl/wget).

`migrator` parte de `deps`/`builder` (dependencias completas, incluye el CLI de Payload, `src/payload/migrations`, `payload.config.ts`) y su único propósito operativo es `pnpm payload migrate`. No expone puerto, no tiene `CMD` de servidor, no se usa como App Container normal.

**Alternativa descartada**: correr `payload migrate` desde el `ENTRYPOINT` del `runner` en cada arranque. Descartada explícitamente por el usuario (Decisión A): viola el invariante "las migraciones corren una sola vez, antes del release", y no es segura si en el futuro hay más de una réplica.

**Invariante a preservar en el código**: el `CMD`/`ENTRYPOINT` de `runner` SHALL NOT invocar `payload migrate`, ni condicionalmente ni en un wrapper de shell.

### 2. `compose.prod.yaml` como verificación/referencia, no como compromiso de hosting

`compose.prod.yaml` define: un servicio `app` (imagen `runner`), un servicio `migrate` (imagen `migrator`, `restart: "no"`, se ejecuta y termina), y opcionalmente un servicio `db` (`postgres:17-alpine`, red privada, volumen nombrado, sin publicar el puerto al host) **solo para el caso self-hosted**. La app se conecta siempre vía `DATABASE_URI`; nada en el código asume que `db` existe. Esto satisface simultáneamente: (a) un target real para probar la imagen de producción localmente, (b) una referencia para quien decida auto-hospedar en un VPS, y (c) cero acoplamiento si Phase 12 elige un PostgreSQL administrado (`DATABASE_URI` externo, sin el servicio `db` de este compose).

`compose.yaml` (desarrollo) no se modifica.

### 3. Almacenamiento de Media: adaptador S3-compatible de primera parte

Usar `@payloadcms/storage-s3` (plugin oficial de Payload) configurado con `endpoint` explícito y `forcePathStyle` habilitado cuando aplique, en vez de asumir el SDK nativo de AWS S3. Esto permite apuntar a Cloudflare R2 (recomendado por §4.3 del Master Spec) o a cualquier proveedor S3-compatible sin cambiar código, solo variables de entorno (`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, credenciales, `S3_PUBLIC_URL`). Se elige el plugin oficial (en vez de una integración custom) porque garantiza estar en la misma familia de versión que el resto de paquetes `@payloadcms/*`, evitando el riesgo de drift de versión ya señalado en la exploración.

En desarrollo, el adaptador SHALL activarse solo si las variables `S3_*` están presentes; si no, `Media` sigue usando almacenamiento local sin degradar el flujo de desarrollo actual (sin cambios en `media-collection` para desarrollo).

**Alternativa descartada**: mantener volumen local también en producción. Descartada porque el Master Spec la resuelve explícitamente (AC-STOR-002, §4.3, §13.4) y `openspec/config.yaml` la declara como parte del stack objetivo — no es una decisión abierta.

### 4. Validación de entorno condicional a producción

Extender `src/lib/env/index.ts` para que, cuando `NODE_ENV === 'production'`, las siguientes variables pasen de opcionales a requeridas: `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`. En desarrollo/test permanecen opcionales exactamente como hoy. Mecanismo: un único schema con `.superRefine`, siguiendo el patrón ya usado para separar el schema de `payload.config.ts` del schema de la app — sin duplicar la fuente de verdad de cada variable.

**Refinamiento descubierto durante la implementación (Grupo 4, verificado empíricamente, no solo razonado):** exigir las ocho variables por igual en cualquier momento en que `NODE_ENV=production` acopla la imagen Docker a secretos operativos en build time. `next build` recolecta datos de cada ruta importando su módulo — `/api/health` solo usa `DATABASE_URI`, pero como importa el objeto `env` completo, heredaba la validación de `S3_*`/`PREVIEW_SECRET` aunque no los use; `docker build --target runner` fallaba entonces sin poder completarse sin credenciales S3 reales, violando el principio de build reproducible sin secretos (Master Spec §12/§39) y el propio objetivo de esta fase ("ninguna secreto de producción se expone/requiere para construir la imagen"). Verificado con `process.env.NEXT_PHASE`: Next lo fija a `'phase-production-build'` durante `next build` (confirmado con logging temporal) y lo deja `undefined` en el servidor standalone real (`node server.js`) — señal confiable para distinguir "está compilando" de "está sirviendo tráfico de verdad", sin variables de entorno nuevas. Split resultante:
- `NEXT_PUBLIC_SITE_URL`: requerida también durante `next build` (Next la incrusta en el bundle de cliente en ese momento — es genuinamente build-time, no una coincidencia de este módulo).
- `PREVIEW_SECRET` y las `S3_*`: requeridas solo cuando el proceso arranca de verdad a servir tráfico (`NEXT_PHASE !== 'phase-production-build'`), nunca durante `next build`.

`docker build --target runner`/`--target builder` solo necesita `NEXT_PUBLIC_SITE_URL` (no secreto) como build arg; ningún secreto real entra en ninguna capa de la imagen. El fail-fast en producción para `PREVIEW_SECRET`/`S3_*` se preserva íntegro, solo se movió al momento correcto (arranque real, no build) — verificado arrancando el servidor standalone con `NODE_ENV=production` y esas variables ausentes: falla explícitamente con el mismo mensaje de antes.

`REVALIDATION_SECRET` se mantiene en el contrato de entorno como variable documentada pero **no requerida** ni en dev ni en producción: el Master Spec la enumera (§65) por lo que no se elimina sin aprobación explícita del usuario, pero no se inventa un endpoint HTTP de revalidación para justificar su uso — se documenta como reservada/sin consumidor actual.

### 5. Headers de seguridad vía `next.config.ts` `headers()`, sin middleware nuevo

No existe `middleware.ts` en el repo y no hay necesidad de introducir uno solo para headers estáticos: `next.config.ts` ya soporta `headers()` con patrones de ruta, suficiente para aplicar una política distinta a `/admin/:path*` (Payload Admin) que al resto del sitio si fuera necesario. Headers base para todas las rutas: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva por defecto. CSP construida a partir de los proveedores de embed reales encontrados en el código (`src/lib/editorial/video-provider.ts`, `src/lib/editorial/embed-provider.ts`, `tiktok-embed.tsx`): YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook, LinkedIn como `frame-src`/`img-src` permitidos, más el propio origen y el `S3_PUBLIC_URL` de Media. HSTS se emite solo si la variable de entorno de producción confirma terminación TLS en el borde (documentar el supuesto; no forzar HSTS en un entorno de verificación local sin TLS). Protección de framing (`frame-ancestors`/`X-Frame-Options`) SHALL permitir que Payload Admin siga operando normalmente (mismo origen), sin bloquear su propio uso de iframes internos si los tuviera.

**Alternativa descartada**: una única CSP global estricta sin excepciones por ruta. Descartada porque el propio Admin de Payload podría requerir comportamiento distinto al del sitio público, y una política demasiado agresiva puede romperlo sin necesidad.

### 6. Topología de producción: instancia única, `DATABASE_URI` agnóstico de proveedor

Se ratifica el diagrama de instancia única (Internet → TLS/proxy/plataforma → un App Container → PostgreSQL vía `DATABASE_URI` → Object Storage S3-compatible). El adaptador de Postgres no fuerza `sslmode`; una URI de un proveedor administrado que requiera TLS simplemente lo expresa en la propia cadena de conexión (`?sslmode=require`), sin cambios de código. Se documentan explícitamente (sin implementar) los requisitos para multi-réplica futura: coordinación de invalidación de cache distribuida, el job de migración debe seguir siendo singleton, límites de conexión de la base de datos deben revisarse.

## Risks / Trade-offs

- [Duplicar lógica entre `runner` y `migrator`] → Mitigación: ambos parten del mismo `builder`; `migrator` no reimplementa nada, solo reusa `payload.config.ts` y `src/payload/migrations` ya construidos.
- [Usuario no-root puede topar con un directorio no escribible no detectado en revisión de código] → Mitigación: tarea explícita de boot + smoke test del container antes de considerar el stage completo (ver tasks.md).
- [Nueva dependencia npm `@payloadcms/storage-s3` introduce riesgo de versión] → Mitigación: fijar la misma versión de familia que `payload`/`@payloadcms/next`/`@payloadcms/db-postgres` ya instalados; verificar con el lockfile.
- [CSP mal derivada rompe un embed legítimo] → Mitigación: el allowlist se deriva directamente de los proveedores confirmados por grep en el código (no de una lista genérica); smoke test manual de cada tipo de embed tras habilitar CSP.
- [Validación de entorno más estricta en producción rompe un despliegue existente que aún no define `S3_*`/`PREVIEW_SECRET`/`NEXT_PUBLIC_SITE_URL`] → Mitigación: la exigencia es condicional a `NODE_ENV === 'production'`; development/test no cambian; se documenta el contrato antes de cualquier despliegue real (Phase 12).
- [El job de migración como paso separado añade un paso operativo que un operador puede olvidar] → Mitigación: documentar la secuencia obligatoria en `docs/DEPLOYMENT.md` y hacer que el arranque de `runner` no tenga forma de "funcionar por accidente" contra un schema desactualizado (la app sigue sin ejecutar migrate, pero un `/api/health` con DB inalcanzable o Payload fallando por schema desalineado hace el problema visible de inmediato).
- [Asumir instancia única] → Mitigación: documentado explícitamente como límite conocido de V1, no oculto.
- **[Hallazgo verificado en Grupo 4, no anticipado en el diseño original] `docker build --target runner` requiere un PostgreSQL real y alcanzable, no solo `DATABASE_URI` con formato válido.** `next build` prerenderiza `/`, `/robots.txt` y `/sitemap.xml` como contenido estático (`○` en la salida de `next build`), y esa generación estática ejecuta consultas reales contra Payload Local API (Home global, Posts, etc.) durante el propio build. Verificado directamente: con un `DATABASE_URI` sintácticamente válido pero inalcanzable (`getaddrinfo ENOTFOUND`), el build falla en "Export encountered an error on /(frontend)/page: /, exiting the build" - no es solo la validación de `src/lib/env`, es una consulta real a Postgres. Con acceso de red a un Postgres alcanzable (probado contra la propia base de desarrollo, migrada, vía un builder de `buildx` conectado a la red de Compose), el build de `runner` y `migrator` completan exitosamente. → Mitigación/alcance: esto contradice el supuesto original de "build reproducible sin DB" (§18 más abajo) para las rutas estáticas actuales; no se resuelve en esta fase (cambiar la estrategia de renderizado de `/` es una decisión de arquitectura frontend fuera del alcance de Phase 10). Se documenta como requisito operativo real: cualquier pipeline que construya la imagen de producción (incluyendo CI en Phase 11) necesita una base "migration-test" alcanzable con schema al día, no solo variables de entorno. `DATABASE_URI`/`PAYLOAD_SECRET` se pasan a `builder` como `ARG`/`ENV` (ninguno es secreto de producción real en ese contexto - ver Decisión 4); los secretos de runtime reales (`PREVIEW_SECRET`, `S3_*`) siguen sin necesitarse en el build, confirmado empíricamente.
- **[Hallazgo verificado durante 5.3/5.4, prerequisito de producción reparado dentro de este change] La cadena de migraciones committeada nunca creó el schema de los Globals `Navigation`, `Footer` y `SiteSettings`.** Verificar `runner` contra una base genuinamente migrations-only (13 migraciones previas a la reparación: 12) expuso `relation "site_settings" does not exist` al generar `/` estáticamente. Causa raíz confirmada: esos tres Globals se crearon en la base de desarrollo vía push antes de que se generara la migración `20260910_071432_home_global`; el snapshot Drizzle de esa migración capturó el schema completo (incluidos esos Globals) pero sus statements `up`/`down` nunca incluyeron el `CREATE TABLE` correspondiente, porque `payload migrate:create` diffa el snapshot committeado más reciente contra el schema actual de `payload.config.ts` - nunca contra el estado real de la base de datos -, y ambos ya "coincidían" en asumir que esas tablas existían. → Reparación (no rollback, no edición de migraciones existentes): se generó una migración forward nueva (`20260914_060935_add_navigation_footer_site_settings_globals`) invocando directamente las funciones oficiales `generateDrizzleJson`/`generateMigration` de Payload/Drizzle con un snapshot "before" sintético (el snapshot actual menos exactamente esas 10 tablas/6 enums) contra el snapshot "after" real - mismo mecanismo interno que usa `payload migrate:create`, sin depender de su detección basada en disco. Verificado programáticamente antes de generar que ninguna otra tabla, ninguna FK externa hacia esas tablas, y ningún enum compartido se veían afectados. Cadena de 13 migraciones probada desde cero contra una base desechable: coincide exactamente con el schema de development; un `migrate:create` posterior ya no propone diff alguno. Los 12 archivos de migración existentes permanecen sin modificar.
- **[Hallazgo verificado en Grupo 6, corregido dentro de este change] El stage `migrator` no fijaba `NODE_ENV=production`, lo que puede colgar el job indefinidamente contra una base real.** Al correr `migrator` una segunda vez contra una base ya en la última migración (simulación de upgrade, tarea 6.2), Payload detectó el proceso como "modo desarrollo" y lanzó un prompt interactivo ("parece que corriste Payload en modo dev... ¿reconciliar drift de push-mode?") esperando respuesta por stdin - sin TTY (`docker run` no interactivo, el caso real de un job de despliegue), el job simplemente cuelga para siempre en vez de fallar rápido o completar. → Corrección: se agregó `ENV NODE_ENV=production` al stage `migrator` (el stage `runner` ya lo tenía). Reverificado tras el fix contra una base desechable genuinamente limpia (nunca tocada en modo dev): primera corrida aplica las 13 migraciones normalmente, segunda corrida contra la misma base ya migrada termina en `Done.` sin prompt, sin colgarse, exit 0 - igual de rápido que en Grupo 4. Refuerza el invariante de AC-DB-004 (nada de push-mode de desarrollo contra producción) para el propio job de migración, no solo para el runtime de la app.

## Migration Plan

Secuencia de despliegue (documentada en `docs/DEPLOYMENT.md`, no automatizada más allá de los propios stages Docker):

```
1. pnpm install --frozen-lockfile (deps)
2. docker build --target runner   -> requiere red hacia un PostgreSQL migrado y alcanzable
                                      (ARG DATABASE_URI/PAYLOAD_SECRET/NEXT_PUBLIC_SITE_URL;
                                       next build prerenderiza `/` contra ese Postgres - ver Riesgos)
3. docker build --target migrator -> imagen de operación (no requiere red en el build)
4. correr el job `migrator` contra el DATABASE_URI del entorno objetivo -> debe salir con código 0
   (si falla: el release se detiene aquí; la versión anterior de `runner` sigue sirviendo tráfico;
    el operador corrige y reintenta el job, sin rollback destructivo automático)
5. arrancar/reemplazar el container `runner` con la nueva imagen
   (variables de runtime reales: DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SITE_URL,
    PREVIEW_SECRET, S3_* - estas dos últimas NO se necesitaron en el paso 2)
6. esperar /api/health = 200 (readiness)
7. si el plugin/colección de Search cambió: Reindex manual vía Admin UI (docs/SEARCH.md)
8. verificar endpoints públicos
```

Rollback: migraciones forward-only; ante un problema post-deploy se prefiere avanzar con un fix (roll-forward) en vez de revertir el schema. Un fallo del job de migración nunca deja a la aplicación corriendo contra un schema incompatible, porque el swap de `runner` está gateado por el éxito del job.

## Open Questions

Ambas resueltas durante la implementación, sin afectar specs/tasks:

- UID/GID del usuario no-root del `runner` → se reutiliza el usuario `node` (uid/gid 1000) que la imagen base ya provee, sin crear uno nuevo.
- HSTS → se deriva del protocolo de `NEXT_PUBLIC_SITE_URL` (`https:` = se emite, cualquier otro caso = no), sin variable de entorno nueva.

## Verificación final de Acceptance Criteria (Grupo 8)

| AC | Estado | Evidencia |
|---|---|---|
| AC-DOCKER-001…009 | Ya cumplidos (`compose.yaml`, sin cambios) | Stack de desarrollo confirmado sano y funcional de forma continua durante toda la implementación (decenas de `/api/health` = 200, hot reload usado activamente al editar) |
| AC-DOCKER-010 | Cumplido | `docker build --target runner` verificado repetidamente (Grupos 4-6) |
| AC-DOCKER-011 | Cumplido | `runner` arrancado sin bind mounts, no-root, `HEALTHCHECK` de la imagen en `healthy` |
| AC-DB-001 | Cumplido | `postgresAdapter` únicamente, `DATABASE_URI` requerida sin excepción, sin fallback a SQLite |
| AC-DB-002 | Cumplido | 13 migraciones versionadas en git (12 originales + la de reparación) |
| AC-DB-003 | Cumplido | Verificado end-to-end (Grupo 6): Postgres desechable vacío → `migrator` → schema completo idéntico a development |
| AC-DB-004 | Cumplido | `runner` nunca ejecuta `migrate`; `migrator` es un job separado de un solo uso, con `NODE_ENV=production` (fix de Grupo 6) para no colgarse interactivamente contra producción |
| AC-ENV-004 | Cumplido | Verificado con los 3 tipos de variable: `DATABASE_URI`/`PAYLOAD_SECRET` faltantes fallan siempre; `NEXT_PUBLIC_SITE_URL` falla en build; `PREVIEW_SECRET`/`S3_*` fallan al arrancar el server real - los tres casos con mensaje explícito listando la variable faltante |
| AC-STOR-001 | Cumplido | `runner` sin directorio de uploads local; único estado local es `/tmp`/`.next/cache` |
| AC-STOR-002 | Cumplido | Verificado con upload real (Grupo 6): objeto confirmado en Object Storage, no en filesystem |
| AC-STOR-003 | Cumplido | Verificado recreando el container `runner` (Grupo 6): Media sigue accesible |
| AC-SEC-009 | Cumplido | CSP/HSTS/headers base verificados en rutas públicas; headers base también en `/admin`/`/api` (Grupo 3) |
| AC-HEALTH-001 | Ya cumplido (sin cambios) | Reconfirmado decenas de veces a lo largo de la implementación |
| AC-HEALTH-002 | Ya cumplido (sin cambios) | Respuesta inspeccionada: sin connection string, password ni `PAYLOAD_SECRET` |
| AC-LOG-001 | Cumplido | Logs de Payload (pino) y errores no capturados van a stdout/stderr - confirmado en cada `docker logs`/build de esta fase |
| AC-LOG-002 | Parcialmente re-verificado | DB (health `unreachable`, fallas de build con stack trace completo) y migración (stack trace completo verificado en Grupo 4) confirmados esta fase; revalidación (`console.error` en `src/lib/cache/invalidate.ts`) y redirects heredan comportamiento de Phase 8 sin cambios - no se tocó ese código, no se re-verificó desde cero en esta fase |

Ninguna excepción bloqueante. La única entrada no verificada de punta a punta en esta fase (revalidación/redirects bajo AC-LOG-002) es porque Phase 10 no modificó ese código, no por una limitación descubierta.
