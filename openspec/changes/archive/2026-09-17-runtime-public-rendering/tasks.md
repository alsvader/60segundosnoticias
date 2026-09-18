## 1. Implementación

- [x] 1.1 `src/app/(frontend)/layout.tsx`: agregar `export const dynamic = 'force-dynamic'`. Verificar con `pnpm typecheck`.
- [x] 1.2 `src/app/sitemap.ts`: agregar `export const dynamic = 'force-dynamic'`. Verificar con `pnpm typecheck`.

## 2. Verificación de cache (Data Cache sobrevive a force-dynamic)

- [x] 2.1 Prueba de integración determinista sobre una función DAL representativa
  (`getSettings`) probando la secuencia: request 1 (cache miss, la consulta real
  a Payload se ejecuta) → request 2 (resultado cacheado reutilizado, sin nueva
  consulta) → `revalidateTag` sobre su tag → request 3 (la consulta real se
  ejecuta de nuevo). Verificado con instrumentación temporal
  (`console.log` en el callback interno de `getSettings`) contra un build de
  producción real (`node scripts/run-e2e-server.mjs`, no el servidor de
  desarrollo - `next dev` no respeta `dynamic`/Data Cache de la misma forma):
  request 1 disparó 3 ejecuciones concurrentes (layout + `generateMetadata` +
  página, sin dedupe entre sí, cache fría), request 2 disparó 0 (cache
  caliente), un `PATCH` real a `siteSettings` vía la API REST (Admin de
  fixture) disparó el hook `afterChange` → `revalidateTag('settings')`, y
  request 3 volvió a disparar 3 ejecuciones frescas - confirmado también en
  el HTML devuelto (`branding.tagline` cambiado visible en la respuesta).
  `unstable_cache`/Vitest fuera de un request de Next no puede ejecutar esta
  secuencia real (ver `tests/integration/cache-invalidation.test.ts`, que
  mockea `next/cache` precisamente por eso) - la cobertura automatizada
  permanente que sí puede correr en CI queda en ese archivo existente
  (prueba que las tags correctas se invalidan ante cada mutación relevante).
- [x] 2.2 Confirmar que no queda instrumentación de depuración temporal en el
  código de producción tras 2.1 (solo la prueba en `tests/`). Confirmado:
  `git diff -- src/lib/data/settings.ts` no muestra cambios tras remover el
  `console.log` temporal.

## 3. Build limpio sin base de datos

- [x] 3.1 Borrar `.next` por completo (documentado en design.md: una caché
  local existente da un falso positivo) y ejecutar `next build` con un
  `DATABASE_URI` sintácticamente válido pero inalcanzable. Verificado: el
  build se completa exitosamente (`exit: 0`) y la tabla de rutas muestra `/`,
  `/buscar` y `/sitemap.xml` como `ƒ` (Dynamic), `/robots.txt` como `○`
  (Static) y `/llms.txt` como `ƒ` (ya lo era antes del cambio).

## 4. Regresión de Docker

- [x] 4.1 Ejecutar `bash scripts/docker-smoke.sh` de punta a punta bajo el
  proyecto de Compose aislado ya existente (`60segundosnoticias-smoke`).
  Verificado de punta a punta: el build de la imagen `runner` se completó
  antes de que existiera ningún Postgres (la falla original de esta misma
  fase ya no ocurre), las migraciones corrieron, `app` reportó `healthy`, y
  `/api/health`, `/`, `/fixture-noticias` (Category), `/fixture-noticias/
  fixture-post-publicado` (Article), `/buscar` y `/admin/login` respondieron
  200. Usuario del proceso confirmado no-root (`node`).

  **Hallazgo no planeado, corregido dentro del mismo alcance**: al ejecutar
  4.1 por primera vez con el fix de esta sección ya aplicado, el build/app
  arrancaron correctamente pero `scripts/seed-e2e.ts` fue rechazado por
  `tests/setup/assert-test-database.ts` (`UnsafeTestDatabaseError`) - el
  Postgres desechable de `compose.prod.yaml --profile self-hosted` usa el
  nombre `60segundos` (forma de producción, a propósito) y el host `db`
  dentro de la red de Compose, ninguno de los cuales el guard reconocía
  (solo `localhost:5433`/`*_test`). Este guard nunca se había ejercitado
  contra este flujo porque la tarea 8.1 jamás había corrido de punta a punta
  antes de este change. Fix, sin debilitar el guard: `docker-smoke.sh` ahora
  fija `POSTGRES_DB=60segundos_smoke_test` (sigue terminando en `_test`), y
  `assert-test-database.ts` reconoce explícitamente un segundo par
  host/puerto (`db:5432`, además de `localhost:5433`) - ambas condiciones
  (sufijo Y host/puerto reconocido) siguen siendo obligatorias juntas.
  Cobertura nueva en `tests/setup/assert-test-database.test.ts` probando
  que el nuevo par se acepta solo con el sufijo correcto, y sigue
  rechazándose sin él.
- [x] 4.2 Confirmar que los contenedores/volúmenes de desarrollo
  (`60segundosnoticias-app-1`/`60segundosnoticias-db-1`/
  `60segundosnoticias_postgres_data`) permanecen sin cambios antes y después
  de 4.1. Confirmado por inspección directa (`docker ps`/`docker volume ls`)
  antes y después de cada corrida - el `app` de desarrollo se detuvo
  (`docker compose stop app`, nunca `down`/`down -v`) solo para liberar el
  puerto 3000 (ambos compose files lo publican), y se reinició
  (`docker compose start app`) inmediatamente después; el volumen y la base
  de datos de desarrollo nunca se tocaron.

## 5. Verificación de rutas públicas y sitemap

- [x] 5.1 Con Postgres de runtime disponible (dev), verificado `/`, `/buscar`,
  `/noticias` (Category), `/sitemap.xml`, `/robots.txt` y `/llms.txt` - todas
  responden 200. Category/Article/Page adicionales ya verificadas en 4.1
  contra el stack de smoke (`/fixture-noticias`, `/fixture-noticias/
  fixture-post-publicado`).
- [x] 5.2 `/sitemap.xml` contra el dev reconstruido muestra exactamente las 5
  Categories, el Page y los Posts publicados reales, con `<lastmod>`
  coherente - generado por las mismas funciones DAL sin cambios
  (`getAllCategories`/`getPublishedPostsForSitemap`/
  `getPublishedPagesForSitemap`), ahora en tiempo de solicitud en vez de en
  build time. Filtrado no debilitado - ningún cambio a esas funciones.

## 6. Verificación general y cierre

- [x] 6.1 `pnpm typecheck && pnpm lint && pnpm test` (incluye `test:importmap`
  y `test:unit`) y `pnpm test:integration` - todos pasan (91/91 unit,
  28/28 integration).
- [x] 6.2 `graphify update .` ejecutado.
- [x] 6.3 `/opsx:verify runtime-public-rendering` ejecutado, sin discrepancias
  bloqueantes.
