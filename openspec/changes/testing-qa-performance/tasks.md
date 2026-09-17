## 1. Tooling base

- [x] 1.1 Añadir `vitest`, `@vitejs/plugin-react` (si se requiere) y `happy-dom`
  como devDependencies; crear `vitest.config.ts` con dos `test.projects`
  (`node` para unit/integración, `happy-dom` para componente) resolviendo los
  alias `@/*` y `@payload-config` de `tsconfig.json`. Verificar con
  `pnpm vitest --run --reporter=verbose` ejecutando un test trivial de humo.
- [x] 1.2 Añadir `@testing-library/react` y `@testing-library/user-event` como
  devDependencies. Verificar renderizando un componente trivial en una prueba
  de humo bajo el proyecto `happy-dom`.
- [x] 1.3 Añadir `@playwright/test` y `@axe-core/playwright` como
  devDependencies; crear `playwright.config.ts` con proyecto Chromium por
  defecto y proyectos adicionales Firefox/WebKit acotados por tag
  `@smoke-cross-browser`. Verificar con `pnpm playwright test --list`.
- [x] 1.4 Añadir `lighthouse`/`@lhci/cli` como devDependency; crear
  `lighthouserc.json` con las 5 URLs representativas (Home, Category, Article,
  Page, Search) y las aserciones de presupuesto ratificadas (Performance ≥85,
  Accessibility ≥95, Best Practices ≥95, SEO ≥95, LCP ≤2.5s, CLS ≤0.10, TBT
  ≤200ms, `numberOfRuns: 3`). Verificar con `pnpm lhci healthcheck`.
- [x] 1.5 Crear `.env.test` committeado con valores obviamente no-productivos
  para `DATABASE_URI` (apuntando al Postgres de pruebas), `PAYLOAD_SECRET`,
  `PREVIEW_SECRET` y `NEXT_PUBLIC_SITE_URL`, siguiendo el patrón de
  `DevOnlyPass123!` de `seed:dev`. Verificar que ningún valor coincide con
  secretos reales de `.env`/`.env.production` (revisión manual + grep).
- [x] 1.6 Añadir `compose.test.yml` con un servicio `db` `postgres:17-alpine`
  en un puerto distinto al de desarrollo (p. ej. `5433`) y un nombre de base
  de datos con el sufijo de prueba reconocido. Verificar con
  `docker compose -f compose.test.yml up -d && pg_isready`.
- [x] 1.7 Añadir a `package.json` los scripts `test`, `test:unit`,
  `test:integration`, `test:e2e`, `test:a11y`, `test:visual`,
  `test:migrations`, `test:smoke` según el diseño de niveles rápido/PR/full.
  Verificar que `pnpm test` corre solo typecheck/lint/unit/componente sin
  requerir base de datos ni navegador.

## 2. Guard de seguridad de la base de datos de pruebas y fixtures

- [x] 2.1 Implementar `tests/setup/assert-test-database.ts` con
  `assertTestDatabase(uri)` que exige simultáneamente el sufijo de nombre
  reconocido y el host/puerto del servicio de pruebas declarado. Escribir
  pruebas unitarias que cubran los dos scenarios del requirement "Guard de
  seguridad de la base de datos de pruebas" de `specs/test-infrastructure`
  (reset rechazado / reset permitido). Verificar con `pnpm test:unit`.
- [x] 2.2 Implementar `tests/setup/env.ts` que fija `DATABASE_URI`,
  `PAYLOAD_SECRET`, `PREVIEW_SECRET` de prueba antes de cualquier import de
  `payload.config.ts`, y registrarlo en `vitest.config.ts` (`setupFiles`) y en
  `playwright.config.ts` (`globalSetup`). Verificar con una prueba de humo que
  falla explícitamente si `DATABASE_URI` no contiene el marcador de pruebas al
  momento de inicializar Payload.
- [x] 2.3 Implementar `scripts/run-migration-chain.ts`: levanta/reutiliza el
  Postgres de `compose.test.yml`, corre `payload migrate` contra el
  `DATABASE_URI` de pruebas, y expone el resultado para uso tanto por CLI
  (`pnpm test:migrations`) como por pruebas de integración. Verificar
  ejecutándolo manualmente contra una base de datos recién creada y
  confirmando salida exitosa.
- [x] 2.4 Implementar `tests/fixtures/get-test-payload.ts` (memoiza una
  instancia de Payload por proceso de prueba) y los builders en
  `tests/fixtures/`: Admin, Writer A, Writer B, categorías, Post publicado,
  Post en borrador, Page, configuración de Home/Navigation/Footer/
  SiteSettings — con credenciales fijas no-productivas. Verificar con una
  prueba de integración que crea el set completo de fixtures y lee cada uno
  vía el Local API.

## 3. Pruebas unitarias

- [x] 3.1 `src/lib/redirects/create-historical-redirect.test.ts`: cubrir
  aplanado de cadena, límite de saltos, protección contra ciclos, y el caso
  de cambio simultáneo de slug+categoría produciendo un solo salto. Verificar
  con `pnpm test:unit`.
- [x] 3.2 `src/lib/url/canonical.test.ts`: cubrir `normalizePath`,
  `getPostUrl`, `getCategoryUrl`, `getPageUrl`, `getAbsoluteUrl` incluyendo
  casos de slashes duplicados y slug raíz. Verificar con `pnpm test:unit`.
- [x] 3.3 `src/lib/url/resolve-link.test.ts`: cubrir que solo se aceptan
  esquemas `http://`/`https://` y que un esquema `javascript:` o similar es
  rechazado. Verificar con `pnpm test:unit`.
- [x] 3.4 `src/lib/seo/json-ld.test.tsx`: cubrir que `<` se escapa antes de
  `dangerouslySetInnerHTML` en un título/excerpt que contiene
  `</script>`. Verificar con `pnpm test:unit`.
- [x] 3.5 `src/lib/seo/llms-txt.test.ts`: cubrir el escapado de caracteres
  Markdown (`[`, `]`, `(`, `)`) en un título/excerpt que intenta inyectar un
  enlace `](javascript:...)`. Verificar con `pnpm test:unit`.
- [x] 3.6 `src/payload/plugins/build-search-doc.test.ts` (o el módulo
  equivalente de extracción de texto): cubrir que el texto extraído nunca
  incluye JSON crudo de Lexical ni campos de autor no públicos, y que se
  respeta el límite de 2000 caracteres. Verificar con `pnpm test:unit`.
- [x] 3.7 `src/lib/preview/authorize-draft-content.test.ts`: cubrir los tres
  casos de `canViewDraftRevision` (no-borrador, admin, autor) de forma
  exhaustiva y aislada. Verificar con `pnpm test:unit`.
- [x] 3.8 `src/lib/env/index.test.ts`: cubrir que `envSchema` lanza en modo
  producción cuando falta `PREVIEW_SECRET` o una variable S3 requerida, y que
  no lanza en desarrollo/prueba sin esas variables. Verificar con
  `pnpm test:unit`.

## 4. Pruebas de componente (React Testing Library)

- [x] 4.1 `src/components/site/header-search.test.tsx`: cubrir
  colapsado→click→expandido→foco en input, escritura, `Escape`
  (colapsa+limpia+retorna foco), blur fuera del formulario (colapsa sin
  limpiar), y envío bloqueado cuando el valor recortado está vacío. Verificar
  con `pnpm test:unit` (proyecto `happy-dom`).
- [x] 4.2 `src/components/content/share-actions.test.tsx`: cubrir el
  comportamiento de compartir/fallback a portapapeles al hacer click.
  Verificar con `pnpm test:unit`.
- [x] 4.3 Pruebas de componente para los wrappers de embed
  (`embed-block-client.test.tsx`, `tiktok-embed.test.tsx`,
  `facebook-video-embed.test.tsx`): cubrir la transición
  skeleton→cargado sin depender de una red real de terceros. Verificar con
  `pnpm test:unit`.

## 5. Pruebas de integración Payload + Postgres

- [x] 5.1 `tests/integration/migration-chain.test.ts`: usar
  `scripts/run-migration-chain.ts` contra una base de datos vacía y verificar
  lectura vía Local API de Navigation, Footer, SiteSettings, Home, Posts,
  Pages, Categories, Search y Redirects, más `payload migrate:status` limpio.
  Cubre los dos scenarios del requirement "La cadena de migraciones produce un
  esquema operable". Verificar con `pnpm test:integration`.
- [x] 5.2 `tests/integration/access-control.test.ts`: cubrir los cuatro
  scenarios del requirement "Límites de permisos del rol Writer" (edición
  propia, bloqueo en Post de otro writer, autoría no falsificable, Admin
  administra cualquier Post) y el scenario "Post en borrador ausente de la
  lectura pública", usando `roles.ts` real, sin mockear `access`. Verificar
  con `pnpm test:integration`.
- [x] 5.3 `tests/integration/draft-publish.test.ts`: cubrir los tres
  scenarios del ciclo de vida de borrador/publicación (publicar hace público,
  revisión en borrador no afecta lo publicado, despublicar elimina
  visibilidad). Verificar con `pnpm test:integration`.
- [x] 5.4 `tests/integration/redirects.test.ts`: cubrir los cuatro scenarios
  del requirement de redirecciones (salto único en cambio simultáneo,
  aplanado de cadena, protección contra ciclos, eliminar no inventa
  redirección). Verificar con `pnpm test:integration`.
- [x] 5.5 `tests/integration/search.test.ts`: cubrir los cuatro scenarios de
  sincronización de búsqueda (borrador nunca indexado, publicar indexa,
  reindexación idempotente, insensibilidad a acentos documentada como no
  requerida — prueba explícita de que esto NO falla). Verificar con
  `pnpm test:integration`.
- [x] 5.6 `tests/integration/preview.test.ts`: cubrir los cuatro scenarios de
  autorización de preview (writer en su propio borrador, writer denegado en
  el de otro, secreto inválido denegado, destino no controlable manipulando
  `collection`/`id`). Verificar con `pnpm test:integration`.
- [x] 5.7 `tests/integration/cache-invalidation.test.ts`: cubrir los tres
  scenarios de invalidación de caché (publicar actualiza lo público, edición
  solo-borrador no invalida nada público, falla de invalidación no bloquea la
  escritura — forzar la falla con un spy/mock del wrapper de revalidación).
  Verificar con `pnpm test:integration`.
- [x] 5.8 Ejecutar la suite completa de integración en CI localmente
  (`docker compose -f compose.test.yml up -d && pnpm test:integration`) y
  confirmar limpieza correcta entre pruebas (sin residuos que afecten una
  segunda ejecución consecutiva).

## 6. Infraestructura E2E y journeys críticos

- [x] 6.1 Configurar `webServer` de Playwright para levantar `next build &&
  next start` contra el Postgres de pruebas ya migrado (reutilizando fixtures
  de la sección 2). Verificar con `pnpm playwright test --list` y una prueba
  de humo que carga Home.
- [x] 6.2 `tests/e2e/public-reading.spec.ts`: Home → Category → Article.
  Verificar con `pnpm test:e2e`.
- [x] 6.3 `tests/e2e/search.spec.ts`: expandir HeaderSearch, enviar consulta,
  navegar a `/buscar`, verificar resultados y paginación. Verificar con
  `pnpm test:e2e`.
- [x] 6.4 `tests/e2e/mobile-nav.spec.ts`: abrir MobileNav en viewport móvil,
  navegar a Category → Article. Verificar con `pnpm test:e2e`.
- [x] 6.5 `tests/e2e/cms-page.spec.ts`: navegar a una Page publicada desde la
  navegación. Verificar con `pnpm test:e2e`.
- [x] 6.6 `tests/e2e/not-found.spec.ts`: URL desconocida renderiza el 404 de
  marca. Verificar con `pnpm test:e2e`.
- [x] 6.7 `tests/e2e/redirects.spec.ts`: URL legacy (fixture con slug
  histórico) resuelve al destino canónico actual. Verificar con
  `pnpm test:e2e`.
- [x] 6.8 `tests/e2e/preview.spec.ts`: sesión autenticada de editor →
  previsualizar borrador → salir de preview y confirmar vista pública
  restaurada. Verificar con `pnpm test:e2e`.
- [x] 6.9 `tests/e2e/admin-smoke.spec.ts`: login de Admin → colección core
  alcanzable (sin automatizar CRUD completo de Payload). Verificado con
  `pnpm exec playwright test tests/e2e/admin-smoke.spec.ts
  --project=chromium` (pasa) contra un build de producción fresco con
  MinIO.
  **RESUELTO** en `payload-s3-importmap`: la causa raíz no era solo un
  archivo generado desactualizado, sino que
  `src/payload/plugins/media-storage.ts` registraba el plugin
  `s3Storage()` de forma condicional (`isS3Configured() ?
  [s3Storage(...)] : []`), produciendo configuraciones de Payload
  estructuralmente distintas entre dev (sin S3) y producción (con S3) -
  `@payloadcms/plugin-cloud-storage` registra
  `@payloadcms/storage-s3/client#S3ClientUploadHandler` en
  `config.admin.dependencies` de forma incondicional en cuanto
  `s3Storage()` se registra, así que el import map generado oscilaba
  según qué entorno lo regeneró por última vez. Fix: registrar
  `s3Storage()` siempre, con `enabled: isS3Configured()`. Ver
  `openspec/changes/payload-s3-importmap` (design.md tiene el análisis
  completo del código fuente instalado) y `scripts/verify-importmap.sh`
  (`pnpm test:importmap`, encadenado en `pnpm test`) como regresión.
- [x] 6.10 Interceptar y bloquear (`page.route()`) dominios de
  YouTube/Instagram/TikTok/Facebook/X/LinkedIn en la configuración base de
  Playwright para que ningún journey dependa de red de terceros. Verificar
  que los 8 journeys anteriores pasan sin peticiones de red externas
  reales (revisar el log de red del reporte de Playwright).

## 7. Accesibilidad automatizada, regresión visual y QA responsive

- [x] 7.1 `tests/e2e/a11y.spec.ts`: escanear con `@axe-core/playwright` Home,
  Category, Article, Page, Search, 404, MobileNav abierto y HeaderSearch
  expandido; fallar si hay violaciones automáticamente detectables.
  Verificar con `pnpm test:a11y`.
- [x] 7.2 Fijar timestamps de contenido en los fixtures de E2E (sin
  `new Date()`) para eliminar variabilidad de orden/fecha entre corridas.
  Verificar inspeccionando los fixtures usados por 6.2-6.9.
- [x] 7.3 `tests/e2e/visual.spec.ts`: capturas de referencia con
  `toHaveScreenshot()` para Home (desktop), Article (desktop), HeaderSearch
  expandido (desktop/tablet) y MobileNav abierto (~375px), enmascarando
  regiones de fecha/hora derivada. Verificar con `pnpm test:visual` en una
  corrida limpia y confirmar que una segunda corrida idéntica no reporta
  diferencia.
- [x] 7.4 `tests/e2e/responsive.spec.ts`: verificar ausencia de scroll
  horizontal en Home, Category, Article, Page y Search a ~375px, 768px,
  1024px y 1440px, incluyendo MobileNav abierto y HeaderSearch expandido.
  Verificar con `pnpm test:e2e`.

## 8. Smoke de Docker de producción y Lighthouse

- [ ] 8.1 `scripts/docker-smoke.sh` (o equivalente TS): levanta Postgres
  desechable, corre el servicio `migrate` de `compose.prod.yaml` hasta éxito,
  levanta `app` (runner), y verifica `/api/health`, `/`, una Category
  conocida, un Article conocido, `/buscar`, y que la página de login de Admin
  responde. Verificar ejecutándolo localmente end-to-end.
- [ ] 8.2 Añadir al mismo script una aserción de que el proceso del
  contenedor `runner` corre como usuario no-root (`docker exec ... whoami` o
  inspección de `docker inspect`). Verificar en la misma corrida de 8.1.
- [ ] 8.3 Poblar contenido determinista representativo para Lighthouse (Home
  con bloques poblados, Category con tarjetas, Article con hero/body/media,
  un Article adicional con un embed soportado, Page con bloques típicos,
  Search con resultados) reutilizando los fixtures de la sección 2.
  Verificar listando el contenido creado vía Local API.
- [ ] 8.4 Ejecutar `pnpm lhci autorun` contra el build de producción sobre las
  5 URLs no-embed y confirmar que los presupuestos ratificados
  (Performance ≥85, Accessibility ≥95, Best Practices ≥95, SEO ≥95, LCP
  ≤2.5s, CLS ≤0.10, TBT ≤200ms) se cumplen o, si no, documentar la causa antes
  de continuar (política de fallos de presupuesto). Verificar revisando el
  reporte HTML/JSON generado.
- [ ] 8.5 Ejecutar Lighthouse por separado sobre el Article con embed y
  confirmar que su resultado se reporta como diagnóstico, no como gate.
  Verificar revisando la configuración de `lighthouserc.json` (URL en lista
  separada sin `assertions` bloqueantes).

## 9. CI en GitHub Actions

- [ ] 9.1 Crear `.github/workflows/ci.yml` con el job `quality`
  (install/typecheck/lint/`test:unit`) disparado en `pull_request` y `push` a
  `main`. Verificar abriendo un PR de prueba y confirmando que el check
  aparece y pasa.
- [ ] 9.2 Añadir el job `integration` a `ci.yml` (servicio Postgres
  17-alpine, `test:migrations`, `test:integration`), dependiente de
  `quality`. Verificar en el mismo PR de prueba.
- [ ] 9.3 Añadir el job `e2e-pr` a `ci.yml` (build de producción, Chromium,
  `test:e2e`, `test:a11y`), dependiente de `integration`. Verificar en el
  mismo PR de prueba.
- [ ] 9.4 Añadir verificación de build de Docker (`docker build --target
  runner` y `--target migrator`) como parte de `ci.yml` cuando el diff toca
  `Dockerfile`, `compose*.yml` o dependencias — cumple el requirement "CI
  verifica el build de Docker". Verificar modificando el `Dockerfile` en el PR
  de prueba y confirmando que el paso se ejecuta.
- [ ] 9.5 Crear `.github/workflows/release.yml` (`push` a `main`,
  `workflow_dispatch`) con los jobs `e2e-full` (matriz Firefox/WebKit sobre
  los 8 journeys críticos + `test:visual`), `docker-smoke` (script de 8.1) y
  `lighthouse` (script de 8.4). Verificar disparándolo manualmente
  (`workflow_dispatch`) una vez mergeado.
- [ ] 9.6 Configurar cachés de CI para el store de pnpm y los binarios de
  navegador de Playwright; confirmar que no se cachea ningún dato mutable de
  Postgres. Verificar revisando los tiempos de ejecución antes/después del
  caché en dos corridas consecutivas.
- [ ] 9.7 Confirmar que ningún paso de CI requiere un secreto real de
  producción (`PAYLOAD_SECRET`, `PREVIEW_SECRET`, credenciales S3/R2 reales)
  — solo los valores de `.env.test`. Verificar por revisión del YAML de ambos
  workflows.

## 10. Documentación y cierre

- [ ] 10.1 Crear `docs/TESTING.md` documentando capas de prueba, comandos,
  el guard de seguridad de la base de datos de pruebas, setup de E2E, smoke
  de producción, Lighthouse, checklist de QA manual (navegación solo con
  teclado, foco visible, orden de foco lógico, jerarquía de encabezados, zoom/
  reflow, sanity de lector de pantalla, `prefers-reduced-motion`), niveles de
  CI, y las limitaciones de V1 que las pruebas deben preservar (búsqueda
  insensible a acentos no soportada, sin coincidencia entre campos, sin
  tolerancia a errores de tipeo). Verificar que cada comando documentado
  existe realmente en `package.json`.
- [ ] 10.2 Añadir un párrafo en `README.md` reconociendo el quinto rol de
  base de datos (desechable para pruebas) junto a los roles ya documentados
  (dev/migración-manual/producción), con un enlace a `docs/TESTING.md`.
  Verificar que los comandos mencionados coinciden con los scripts reales.
- [ ] 10.3 Ejecutar `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  en el estado final del cambio y confirmar que los cuatro pasan.
- [ ] 10.4 Ejecutar `graphify update .` para refrescar el grafo con los
  nuevos archivos de prueba, configuración y workflows. Verificar que
  `graphify query "test infrastructure"` devuelve nodos relevantes tras el
  refresh.
- [ ] 10.5 Ejecutar `openspec verify testing-qa-performance` y resolver
  cualquier discrepancia entre lo implementado y los artefactos de la fase
  antes de proponer el archivado.
