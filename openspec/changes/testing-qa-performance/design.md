## Context

El repositorio llega a esta fase sin ningún tooling de pruebas ni CI (ver
proposal.md - Why). Esto da libertad total de diseño, pero también significa
que no hay convención existente que seguir para: layout de `tests/`,
inicialización de Payload fuera del runtime de Next.js, o una base de datos
de pruebas. Restricciones concretas del código actual que sí condicionan el
diseño:

- `tsconfig.json` es ESM puro (`"type": "module"`, `moduleResolution:
  "bundler"`) con alias `@/*` y `@payload-config` — cualquier runner debe
  soportar ESM nativo sin transpilación adicional.
- `payload.config.ts` lee variables de entorno (incluyendo `DATABASE_URI`) en
  tiempo de import — un test runner necesita inyectar el URI de la base de
  datos de pruebas *antes* de que `payload.config.ts` se importe por primera
  vez.
- `next build` prerenderiza `/`, `/robots.txt` y `/sitemap.xml` vía el Local
  API de Payload en build time, así que cualquier job de CI que construya la
  app necesita una Postgres ya migrada y alcanzable *antes* del build, no
  solo después.
- El Dockerfile ya tiene una separación clara `migrator` (un solo uso, fuerza
  `NODE_ENV=production`) / `runner` (no-root, `HEALTHCHECK` a `/api/health`),
  y `compose.prod.yaml` ya ordena `migrate → app` vía
  `service_completed_successfully`, con `db` solo bajo el profile
  `self-hosted` y nunca publicado al host.
- Existen 13 migraciones; la más reciente corrige el vacío de
  Navigation/Footer/SiteSettings descubierto en Fase 10 por revisión manual,
  no por ninguna prueba automatizada.
- `seed:dev` ya sigue la convención de credenciales obviamente no-productivas
  (`DevOnlyPass123!`).
- Solo existen 8 componentes `"use client"` en todo el proyecto.

## Goals / Non-Goals

**Goals:**
- Definir un layout de `tests/` y una estrategia de inicialización de Payload
  que funcionen con el ESM/alias actuales sin tocar `tsconfig.json` ni
  `payload.config.ts`.
- Definir cómo se provisiona, protege y limpia la base de datos Postgres
  desechable, de forma que sea imposible apuntar un reset/drop a la DB de
  desarrollo o producción por error.
- Definir la topología exacta de CI en GitHub Actions (jobs, triggers,
  servicios) que separa el feedback rápido de PR del smoke pesado de
  main/release.
- Definir cómo se mantiene determinismo en E2E, regresión visual y Lighthouse
  frente a contenido con fechas y orden dinámico.
- Definir el mapeo de qué vive en cada una de las tres capacidades nuevas
  para que tasks.md pueda ordenar el trabajo sin ambigüedad.

**Non-Goals:**
- No se diseña aquí el contenido detallado de cada prueba individual (eso es
  trabajo de implementación guiado por los `Scenario:` de cada spec).
- No se diseña verificación contra un proveedor S3 real ni contra
  credenciales de producción — permanece fuera de esta fase.
- No se rediseña ninguna arquitectura de producto (acceso, redirecciones,
  búsqueda, caché, preview) — esas ya están construidas y solo se verifican.
- No se optimiza performance real todavía — este documento define cómo se
  mide, no qué se corrige (eso depende de lo que la medición encuentre).

## Decisions

### 1. Runner unitario/integración: Vitest con dos entornos, no dos herramientas
Un solo `vitest.config.ts` con dos `test.projects`: uno en entorno `node`
(pruebas unitarias puras y de integración Payload/Postgres) y otro en entorno
`happy-dom` (pruebas de componente con React Testing Library). Se elige
`happy-dom` sobre `jsdom` porque los únicos componentes candidatos
(`HeaderSearch`, `ShareActions`, los wrappers de embed) no requieren APIs de
DOM exóticas y `happy-dom` es notablemente más rápido; se puede migrar a
`jsdom` sin cambiar ninguna prueba si aparece una necesidad real. Se rechaza
Jest explícitamente: no hay convención previa que preservar y añadiría fricción
ESM que Vitest no tiene.

### 2. Layout de `tests/`: unitario colocado, integración/E2E centralizados
- Pruebas unitarias (`*.test.ts`) colocadas junto al archivo que prueban
  (p. ej. `src/lib/url/canonical.test.ts`) — descubribilidad inmediata, patrón
  estándar de Vitest.
- Pruebas de componente (`*.test.tsx`) colocadas junto al componente
  (`src/components/site/header-search.test.tsx`).
- Pruebas de integración bajo `tests/integration/*.test.ts` (una por área:
  `access-control`, `draft-publish`, `redirects`, `search`, `preview`,
  `cache-invalidation`, `migration-chain`) — centralizadas porque comparten
  setup/teardown de base de datos que no tiene sentido colocar junto a un
  archivo fuente concreto.
- Pruebas E2E bajo `tests/e2e/*.spec.ts`, con capturas de referencia en
  `tests/e2e/__screenshots__/` (convención por defecto de Playwright).
- Fixtures compartidos bajo `tests/fixtures/` (builders de Admin, Writer A,
  Writer B, categorías, Post publicado/borrador, Page, Home/Navigation/
  Footer/SiteSettings) — reutilizados por integración y E2E, sin duplicar la
  lógica de `seed:dev`.

### 3. Guard de seguridad de la base de datos de pruebas
Toda operación destructiva (reset/drop/truncate usada por el setup de
integración) pasa por una función `assertTestDatabase(uri)` que exige que el
`uri` cumpla **ambas** condiciones: (a) el nombre de base de datos termina en
un sufijo fijo reconocible (p. ej. `_test`) y (b) el host/puerto coincide con
el servicio de Postgres de pruebas declarado (contenedor de CI o
`compose.test.yml` local en un puerto distinto al de desarrollo, p. ej.
`5433`). Si cualquiera de las dos condiciones falla, la función lanza antes de
ejecutar cualquier statement destructivo. Se prefiere esta doble condición
(nombre + origen) sobre una sola bandera de entorno (`IS_TEST=true`) porque
una bandera booleana es trivial de dejar mal configurada por accidente; exigir
que la propia URI lo delate es más difícil de pasar por alto.

### 4. Inicialización de Payload en pruebas
Un archivo `tests/setup/env.ts`, cargado por Vitest (`setupFiles`) y por el
`globalSetup` de Playwright antes de cualquier import de `payload.config.ts`,
fija `process.env.DATABASE_URI` (y `PAYLOAD_SECRET`/`PREVIEW_SECRET` de
prueba) al valor de pruebas. Un helper `tests/fixtures/get-test-payload.ts`
memoiza una única instancia de Payload por proceso de prueba (no por archivo
de prueba) para evitar reabrir el pool de conexión en cada test — el mismo
patrón de "una instancia por worker" que ya usa el propio Local API en
producción.

### 5. Migraciones, nunca push, para inicializar la base de datos de pruebas
El setup de integración ejecuta `payload migrate` como proceso hijo contra el
`DATABASE_URI` de pruebas antes de inicializar Payload. La prueba de
regresión de migraciones (`tests/integration/migration-chain.test.ts`)
reutiliza el mismo script (`scripts/run-migration-chain.ts`) que también se
expone como `pnpm test:migrations` — una sola implementación, invocada tanto
por humanos como por CI, evitando el problema que el propio Fase 10 sufrió
con `migrate:create`: esa prueba corre contra una base de datos
*completamente vacía* en cada ejecución, no contra un snapshot.

### 6. Limpieza entre pruebas de integración: borrado dirigido, no transacciones ni reset completo
Cada prueba de integración registra los IDs que crea y los elimina en un
`afterEach`, en vez de envolver la prueba en una transacción de Postgres. Se
rechaza el rollback transaccional porque los hooks de Payload
(`afterChange`, invalidación de caché, hooks de redirección) no son
transaccionales de por sí y algunos disparan efectos fuera de la base de
datos (p. ej. `revalidateTag`) que un rollback de DB no puede deshacer de
forma consistente. Se rechaza también un reset completo de base de datos por
prueba porque, a la escala actual del proyecto, es innecesariamente lento
para una suite serial — coherente con la recomendación de la exploración de
mantener la infraestructura simple mientras el proyecto sea de este tamaño.

### 7. Server E2E: build de producción para PR, contenedor Docker real solo para smoke
El E2E de nivel PR corre Playwright contra `next build && next start`
(build de producción, no `next dev`) con Postgres de pruebas ya migrado —
suficientemente representativo del comportamiento de producción sin pagar el
costo de un build de imagen Docker en cada PR. El smoke de Docker de
producción (nivel FULL) es la única capa que efectivamente construye y
levanta la imagen `runner` real vía `compose.prod.yaml`, porque es la única
forma de verificar el usuario no-root, el `HEALTHCHECK` y la topología
`migrate → app` reales.

### 8. Determinismo en E2E, regresión visual y Lighthouse
Todos los fixtures de contenido usan timestamps fijos (no `new Date()`), y
las cuatro capturas de referencia (Home, Article, HeaderSearch expandido,
MobileNav abierto) enmascaran (`mask` de Playwright) cualquier región que
muestre fecha/hora derivada, en vez de intentar congelar el reloj del
sistema del navegador. Esto evita que un cambio de "hace 3 horas" a "hace 4
horas" entre corridas rompa una comparación de píxeles sin necesidad de tocar
el código de formateo de fechas en producción.

### 9. Terceros/embeds en pruebas: bloqueados por red, no mockeados a nivel de aplicación
Las pruebas E2E interceptan y bloquean las peticiones de red hacia dominios
de YouTube/Instagram/TikTok/Facebook/X/LinkedIn (`page.route()` de
Playwright) para que un journey no dependa de la disponibilidad de un
proveedor externo. El Article con embeds usado para el audit de Lighthouse
es la única prueba que deliberadamente *no* bloquea red — su resultado es
diagnóstico precisamente porque incluye ese tráfico real no controlado.

### 10. Topología de GitHub Actions
Dos workflows:
- **`.github/workflows/ci.yml`** (`pull_request` y `push` a `main`): jobs
  `quality` (sin DB: install, typecheck, lint, unit, componente) →
  `integration` (servicio Postgres 17-alpine de GitHub Actions, migraciones,
  pruebas de integración, regresión de migraciones) → `e2e-pr` (build de
  producción + Postgres del mismo job o reutilizando el servicio del job
  anterior según límites de tiempo, Playwright solo Chromium, axe
  automatizado sobre las páginas representativas).
- **`.github/workflows/release.yml`** (`push` a `main` tras merge, y
  `workflow_dispatch` manual): reutiliza los gates de `ci.yml` como
  prerequisito y añade `e2e-full` (matriz Firefox/WebKit solo sobre los 8
  journeys críticos + las 4 capturas de regresión visual), `docker-smoke`
  (build real de `migrator`/`runner`, `compose.prod.yaml`), y `lighthouse`
  (LHCI, mediana de 3 corridas, sube el reporte HTML/JSON como artifact).

Se elige *dos* workflows (no uno con `if` condicionales por job) para que el
árbol de checks de un PR sea corto y legible; el desglose exacto de nombres
de job puede ajustarse en tasks.md sin afectar este enfoque.

### 11. Secretos de prueba
Se commitea un `.env.test` con valores obviamente falsos (mismo patrón que
`DevOnlyPass123!` de `seed:dev`) para `PAYLOAD_SECRET`, `PREVIEW_SECRET` y
`NEXT_PUBLIC_SITE_URL` de pruebas — son secretos de mentira, no credenciales
reales, así que commitearlos no es un riesgo y hace que cualquier persona
pueda reproducir la suite localmente sin configurar nada. Nunca se reutiliza
ningún secreto real de desarrollo o producción.

### 12. Ubicación de las pruebas de componente (RTL) en el mapa de capacidades
Las pruebas de componente de `HeaderSearch`/`ShareActions`/wrappers de embed
se implementan y ejecutan como parte del tooling de `test-infrastructure`
(mismo `vitest.config.ts`, mismo comando `pnpm test:unit`), aunque el
comportamiento que protegen también se ejercita, a mayor nivel, en el
journey de búsqueda E2E de `quality-and-performance`. No se duplica la
aserción: RTL verifica el contrato de foco/teclado en aislamiento; Playwright
verifica la navegación real a `/buscar`.

## Risks / Trade-offs

- **[Incidente real, defecto de infraestructura de esta fase] El primer
  `scripts/docker-smoke.sh` (sección 8) destruyó la base de datos Postgres
  de desarrollo y su volumen (`60segundosnoticias_postgres_data`) durante
  su propia implementación.** Causa raíz exacta: ni `compose.yaml`
  (desarrollo) ni `compose.prod.yaml` declaraban un `name:` de proyecto
  explícito, así que ambos heredaban el mismo nombre de proyecto derivado
  del directorio (`60segundosnoticias`); ambos además usan los mismos
  nombres de servicio (`app`, `db`). Al ejecutar `docker compose -f
  compose.prod.yaml --profile self-hosted up -d --build` bajo ese mismo
  namespace de proyecto compartido, Compose reemplazó los contenedores
  `app`/`db` de desarrollo ya en ejecución (en vez de crear unos nuevos y
  separados) con la imagen/configuración de producción; el `trap cleanup
  EXIT` del script, que corría `docker compose ... down -v`, entonces
  eliminó esos contenedores **y el volumen `postgres_data` de desarrollo**
  al salir. Esto NO fue un error del usuario: es exactamente la misma
  clase de defecto (namespace de proyecto de Compose sin aislar) ya
  encontrada y corregida una vez en esta misma fase para
  `compose.test.yml` colisionando con `compose.yaml` — la lección no se
  aplicó preventivamente a `compose.prod.yaml`/`docker-smoke.sh` antes de
  ejecutarlos. → Corregido con un nombre de proyecto Compose explícito y
  aislado para el smoke stack (`-p 60segundosnoticias-smoke`), un guard
  de seguridad en el propio script que rechaza cualquier limpieza
  destructiva a menos que el proyecto activo sea exactamente ese nombre
  esperado, y una prueba de regresión (`tests/integration/
  docker-compose-isolation.test.ts` o equivalente) que prueba en vivo que
  la limpieza del stack de smoke nunca toca recursos de otro proyecto de
  Compose. Ver `docs/TESTING.md` para la regla de aislamiento documentada.
  Contenido de la base de datos de desarrollo perdido: el esquema y todo
  el contenido sembrado vía `pnpm seed:initial`/`pnpm seed:dev` es
  perfectamente reproducible (son scripts deterministas e idempotentes);
  cualquier cuenta de Admin creada manualmente, edición manual sobre el
  contenido sembrado, o Media subida a mano NO lo es y no pudo
  recuperarse (sin backups configurados para la base de datos de
  desarrollo local — explícitamente fuera de alcance hasta Fase 12 por
  `docs/DEPLOYMENT.md`).
- **[Riesgo, no corregido] `tests/e2e/a11y.spec.ts` detecta dos violaciones
  reales de contraste AA (WCAG 4.5:1) en el Article: el azul oficial de
  Facebook (`#1877f2`, 4.23:1) y el verde oficial de WhatsApp (`#25d366`,
  1.98:1) en `ShareActions`/`globals.css`, ambos con texto blanco - una
  limitación real de usar el color de marca oficial de terceros tal cual,
  confirmada en vivo, no un defecto de la prueba ni del resto del sistema
  de colores (el resto de las 8 páginas/estados auditados pasa limpio tras
  corregir, dentro de esta misma fase, un contraste real de placeholder,
  dos saltos de nivel de encabezado (`<h1>` a `<h3>`) y dos landmarks
  `role="search"` sin nombre accesible único).** → Deliberadamente sin
  corregir aquí: cambiar el azul/verde oficial de una marca de terceros es
  una decisión de producto/diseño (aceptar el riesgo vs. agrandar/engrosar
  el texto vs. desviarse del color oficial), no una corrección de
  infraestructura de prueba. Documentado también junto a la regla CSS
  correspondiente (`src/app/globals.css`).
- **[Riesgo] `docker compose -f compose.test.yml` sin un `name:` de
  proyecto explícito deriva su nombre de proyecto del directorio —el
  mismo que usa `compose.yaml` de desarrollo por defecto—, lo que hace
  que el servicio `db` de pruebas colisione con el contenedor `db` de
  desarrollo y pueda reemplazarlo (confirmado durante la implementación:
  `docker compose -f compose.test.yml up -d` recreó momentáneamente el
  `db` de desarrollo antes de que este riesgo se corrigiera).** →
  Mitigación: `compose.test.yml` declara `name: 60segundosnoticias-test`
  explícitamente, garantizando contenedores (`60segundosnoticias-test-db-1`)
  y redes completamente separados de `compose.yaml`/`compose.prod.yaml`
  sin importar el directorio de trabajo. El volumen nombrado del `db` de
  desarrollo (`60segundosnoticias_postgres_data`) nunca se declaró en
  `compose.test.yml` (que usa `tmpfs`), así que aunque la colisión
  ocurriera de nuevo, los datos de desarrollo no se eliminarían — solo el
  contenedor quedaría temporalmente desviado hasta recrearlo desde
  `compose.yaml`.
- **[Riesgo] `pnpm exec payload migrate` (el CLI de Payload, vía `tsx`)
  puede no terminar el proceso de Node incluso después de aplicar todas
  las migraciones correctamente - confirmado empíricamente en este
  entorno: una corrida contra una base ya migrada (nada pendiente) quedó
  con 0% CPU, sin nueva salida, con una conexión a Postgres ya
  establecida pero inactiva, indefinidamente (7+ minutos sin progreso,
  nunca se resolvió sola). Es consistente con un problema conocido de
  interacción entre el worker de transpilación de `tsx` y las versiones
  recientes de Node (>=23.5) que Payload intenta parchear en su propio
  `bin.js`, pero aparentemente no siempre logra. La bandera oficial
  `--disable-transpile` NO es alternativa: el árbol de hooks
  (`src/payload/hooks/**`) importa vía el alias `@/*` de tsconfig.json,
  que la resolución nativa de módulos de Node no entiende sin la
  transpilación de `tsx` - confirmado empíricamente
  (`ERR_MODULE_NOT_FOUND: Cannot find package '@/lib'`).** → Mitigación:
  `scripts/run-migration-chain.ts` NO espera a que el proceso hijo
  termine. Sondea directamente la tabla `payload_migrations` en Postgres
  - la fuente de verdad real, vía un `pg.Client` propio, independiente
  del CLI - hasta confirmar que todas las migraciones esperadas quedaron
  aplicadas (con un techo de 10 minutos para cubrir además una corrida en
  frío de `tsx`), y entonces termina explícitamente el grupo de procesos
  hijo (`pnpm` → `node` → posible worker de `tsx`) sin esperar a que se
  cierre por su cuenta. Esto desacopla "el trabajo en la base de datos ya
  terminó" de "el proceso de Node decidió salir", que en este entorno no
  son la misma cosa.
- **[Riesgo] Inicialización de Payload atada al orden de imports de ESM
  puede romperse si algún archivo de prueba importa `payload.config.ts`
  antes de que `tests/setup/env.ts` fije las variables de entorno.** →
  Mitigación: `setupFiles` de Vitest y `globalSetup` de Playwright están
  documentados como el único punto de entrada permitido; se añade una
  prueba de humo que falla rápido y explícito si `DATABASE_URI` no apunta a
  la base de pruebas al momento de inicializar Payload.
- **[Riesgo] Limpieza por borrado dirigido puede dejar residuos si una
  prueba falla antes de su `afterEach`.** → Mitigación: el job de CI destruye
  y recrea el contenedor de Postgres en cada corrida (no hay estado
  persistente entre ejecuciones de CI); localmente, `pnpm test:integration`
  puede exponer un modo `--reset` que recrea la base desde cero antes de
  correr.
- **[Riesgo] Lighthouse en hardware compartido de CI (GitHub-hosted
  runners) puede fluctuar entre corridas.** → Mitigación: mediana de 3,
  presupuestos con margen razonable (no exigir 100), y tratar una falla
  aislada como señal para revisar, no para bajar el umbral automáticamente
  (según política de fallos de presupuesto ya ratificada).
- **[Riesgo] Bloquear red de terceros en E2E puede ocultar una regresión
  real de integración con un proveedor (p. ej. cambio de markup de
  embed).** → Mitigación: el audit de Lighthouse del Article con embeds
  sigue corriendo con red real, deliberadamente sin bloqueo, como
  contrapeso diagnóstico.
- **[Trade-off] Ejecutar E2E de PR contra `next start` en vez de la imagen
  Docker real ahorra tiempo pero no prueba el usuario no-root ni el
  `HEALTHCHECK` en cada PR.** → Aceptado explícitamente: esas propiedades
  solo cambian cuando se toca el Dockerfile/compose, así que verificarlas
  únicamente en el nivel FULL es proporcional al riesgo.

## Migration Plan

Esta fase no despliega ningún cambio de producto ni de runtime — es tooling
de desarrollo/CI. No hay plan de rollback de datos porque no se toca ninguna
base de datos real. Orden de introducción (detalle completo en tasks.md):

1. Tooling base (Vitest, Playwright, config, `.env.test`) sin CI todavía —
   verificable localmente antes de tocar GitHub.
2. Guard de seguridad de DB + fixtures + regresión de migraciones.
3. Pruebas unitarias y de componente.
4. Pruebas de integración Payload/Postgres.
5. Infraestructura y journeys E2E críticos.
6. Accesibilidad automatizada + regresión visual + QA responsive.
7. Smoke de Docker de producción + Lighthouse.
8. `.github/workflows/ci.yml`, luego `release.yml`.
9. `docs/TESTING.md` + referencia en `README.md`.
10. Refresh de Graphify + `openspec verify`.

Si algún paso revela que un presupuesto aprobado es estructuralmente
irreal después de optimización genuina, se detiene y se reporta evidencia
antes de cambiarlo (política ya ratificada) — no se ajusta el número
silenciosamente durante la implementación.

## Open Questions

- Nombres exactos de los jobs de GitHub Actions y el nivel de paralelismo
  entre `integration` y `e2e-pr` (mismo job vs. jobs separados) pueden
  ajustarse en tasks.md según el tiempo real de ejecución observado, sin
  afectar el enfoque de dos workflows ya decidido.
