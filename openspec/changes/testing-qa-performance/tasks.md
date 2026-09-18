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

- [x] 8.1 `scripts/docker-smoke.sh` (o equivalente TS): levanta Postgres
  desechable, corre el servicio `migrate` de `compose.prod.yaml` hasta éxito,
  levanta `app` (runner), y verifica `/api/health`, `/`, una Category
  conocida, un Article conocido, `/buscar`, y que la página de login de Admin
  responde. Verificado ejecutándolo localmente end-to-end - **OK** en todas
  las rutas.

  Bloqueado inicialmente por un bug de producción real, resuelto por separado
  en `openspec/changes/runtime-public-rendering`: `next build` intentaba
  generar `/`, `/buscar` y `/sitemap.xml` de forma estática por defecto, y
  esa generación ejecutaba consultas a Payload que fallan sin una base de
  datos alcanzable en build time - exactamente la situación de este script
  (construye la imagen antes de que exista el Postgres desechable). Fix:
  `export const dynamic = 'force-dynamic'` en `src/app/(frontend)/layout.tsx`
  y `src/app/sitemap.ts`. Ver ese change para el análisis completo y la
  verificación de que el Data Cache (`unstable_cache`) sobrevive intacto.
- [x] 8.2 Añadir al mismo script una aserción de que el proceso del
  contenedor `runner` corre como usuario no-root (`docker exec ... whoami` o
  inspección de `docker inspect`). Verificado en la misma corrida de 8.1 -
  usuario del proceso: `node`.
- [x] 8.3 Poblar contenido determinista representativo para Lighthouse (Home
  con bloques poblados, Category con tarjetas, Article con hero/body/media,
  un Article adicional con un embed soportado, Page con bloques típicos,
  Search con resultados) reutilizando los fixtures de la sección 2.
  Extendido `tests/fixtures/builders.ts`: `createEmbedPost` (Article con
  `EmbedBlock` de TikTok), `createPage` ahora agrega `layout` (Hero +
  RichText), `configureHomeBlocks` (EditorialIntro/HeroNews/LatestPosts/
  PostsByCategory, mismo patrón idempotente que `seed/dev.ts`), y
  `configureShellGlobals` agrega `seo.defaultMetaDescription`. Verificado
  listando el contenido creado vía Local API y renderizado real contra una
  base de datos de pruebas recién creada (una corrida anterior contra el
  Postgres desechable ya usado, con datos viejos de sesiones previas,
  produjo un falso negativo en el bloque RichText de Page - documentado en
  design.md).
- [x] 8.4 Ejecutar `pnpm lhci autorun` contra el build de producción sobre las
  5 URLs no-embed. Los presupuestos ratificados se cumplen en las 4 rutas de
  contenido (Home/Category/Article/Page: Performance 0.99-1.0, Accessibility
  0.96-1.0, Best Practices 0.96, SEO 1.0, LCP 583-1016ms, CLS 0, TBT 0ms -
  muy por debajo de los límites). `/buscar?q=fixture` reveló un presupuesto
  aprobado estructuralmente irreal para su categoría SEO (score 0.63,
  `is-crawlable` falla porque la página SHALL ser `noindex` por diseño -
  §36 del Master Spec, `generateMetadata` de `/buscar`) - reportado al
  usuario con evidencia antes de tocar nada (política de fallos de
  presupuesto ya ratificada). Decisión del usuario: mantener `/buscar` en
  el gate estricto para Performance/Accessibility/Best Practices/LCP/CLS/
  TBT, y bajar únicamente su aserción de `categories:seo` a nivel `warn`
  (se sigue reportando, nunca bloquea) vía `assertMatrix` de
  `lighthouserc.json` con `matchingUrlPattern` - las otras 4 URLs
  mantienen SEO en `error`/`minScore: 0.95` sin cambios. Verificado:
  `pnpm exec lhci autorun` termina con éxito, `/buscar` sigue fallando si
  cualquier otro presupuesto (no-SEO) regresara. Ver design.md.
- [x] 8.5 Ejecutar Lighthouse por separado sobre el Article con embed y
  confirmar que su resultado se reporta como diagnóstico, no como gate.
  `/fixture-noticias/fixture-post-embed` agregado a `collect.url` con su
  propia entrada de `assertMatrix`, las 7 aserciones en nivel `warn` (nunca
  `error`) - a diferencia de `/buscar` (solo su SEO es diagnóstica, el
  resto sigue siendo gate real). Verificado: la corrida real mostró
  `categories:best-practices` en 0.74 (tráfico real de TikTok, sin bloquear
  - design.md, Decisión 9) como advertencia, y `pnpm exec lhci autorun`
  terminó exitosamente pese a eso.

## 9. CI en GitHub Actions y calificación de release

Alcance revisado (ver design.md, Decisión 13): la dirección de producción
elegida es Hostinger VPS + Dokploy + Docker Compose, con GitHub Actions
como orquestador de release y GHCR como registro de imágenes - nunca
Vercel/Supabase/Neon, y nunca Dokploy Auto Deploy directo sobre `main`.
Fase 11 llega hasta el punto exacto de entrega a Dokploy (contrato de
despliegue, imágenes publicadas, provenance) y se detiene ahí a propósito;
aprovisionar el VPS real, Dokploy real, DNS/Cloudflare, secretos de
producción reales y Postgres de producción real quedan fuera de Fase 11,
en un change separado (`production-deployment-dokploy`).

- [x] 9.1 Crear `.github/workflows/ci.yml` con el job `quality`
  (install/typecheck/lint/`test:unit`) disparado en `pull_request` y `push` a
  `main`. Verificado con una corrida real en GitHub Actions (PR #1,
  https://github.com/alsvader/60segundosnoticias/pull/1) - el check
  aparece y pasa.
- [x] 9.2 Añadir el job `integration` a `ci.yml`, dependiente de `quality`.
  Postgres 17-alpine desechable únicamente - nunca la base de datos de
  desarrollo ni de producción. Ejecuta la regresión de la cadena de
  migraciones desde cero (`test:migrations`) y `test:integration`.
  Verificado con una corrida real en GitHub Actions (PR #1) - pasa.
- [x] 9.3 Añadir el job `e2e-pr` a `ci.yml`, dependiente de `integration`.
  Postgres y MinIO/almacenamiento S3-compatible desechables (el servidor
  real de producción/standalone los exige - ver design.md, Decisión 3/7).
  Build de producción real, Playwright solo Chromium, `test:e2e:pr` (todos
  los journeys funcionales + `test:a11y`, excluyendo deliberadamente
  `visual.spec.ts` - ver más abajo). Preserva íntegros los invariantes ya
  establecidos (S3 en runtime, estabilidad del import map, guards de
  seguridad de base de datos, aislamiento de proyectos de Docker). MinIO
  se levanta con `docker run` manual (no `services:` de GitHub Actions -
  la imagen oficial no trae un CMD ejecutable por defecto, a diferencia de
  `compose.test.yml`) usando el container `quay.io/minio/mc` (el binario
  de `dl.min.io` está descontinuado - 410 Gone, confirmado en vivo en la
  primera corrida real). Verificado con una corrida real en GitHub Actions
  (PR #1) - pasa, incluyendo la violación de contraste de marca (Facebook/
  WhatsApp) ya resuelta (ver design.md, sección Risks).

  **Alcance corregido tras la primera corrida real**: `test:e2e:pr`
  (nuevo script, excluye `tests/e2e/visual.spec.ts` vía un regex negativo
  explícito) reemplaza `test:e2e` en este job - las 5 capturas de
  referencia committeadas son `*-chromium-darwin.png` (generadas en Mac),
  el runner de GitHub Actions es Linux, y la regresión visual real (con
  baselines Linux generadas, revisadas y committeadas ahí) pertenece a la
  calificación FULL de `release.yml` (tarea 9.5), no al gate rápido de PR
  - `test:e2e`/`test:visual` sin cambios para uso local/release.
- [x] 9.4 Añadir verificación de build de Docker (`docker build --target
  runner` y `--target migrator`) a `ci.yml`, dependiente de `e2e-pr`. El
  build en frío SHALL completarse sin un Postgres de runtime alcanzable
  (invariante de `openspec/changes/runtime-public-rendering`) - verificado
  localmente con `docker build --target runner`/`--target migrator` y
  `DATABASE_URI` sintácticamente válido pero inalcanzable: ambos targets
  completan, la tabla de rutas del build confirma `/`/`/buscar`/
  `/sitemap.xml` como `ƒ` (Dynamic). Filtrado por path
  (`dorny/paths-filter@v3`) en PRs para `Dockerfile`/`compose*.y*ml`/
  `package.json`/`pnpm-lock.yaml`/`.dockerignore`; siempre se ejecuta en
  `push` a `main`, sin excepción. Verificado con una corrida real en
  GitHub Actions (PR #1) - el PR modificaba `package.json`, el filtro de
  path lo detectó correctamente y ambos targets construyeron con éxito.
- [ ] 9.5 Crear `.github/workflows/release.yml` (`push` a `main`,
  `workflow_dispatch`) con la calificación FULL completa antes de publicar
  cualquier artefacto: journeys críticos E2E en Firefox/WebKit, regresión
  visual seleccionada, smoke de Docker de producción (script de 8.1),
  Lighthouse (script de 8.4), y cualquier otro gate ya aprobado por el
  diseño activo. Ningún gate puede fallar sin bloquear la publicación de
  imágenes ni la entrega a despliegue. Concurrencia de release: dos
  releases de producción SHALL NOT correr en simultáneo. Verificar
  disparándolo manualmente (`workflow_dispatch`) una vez mergeado.
- [ ] 9.6 Configurar cachés de CI para el store de pnpm y los binarios de
  navegador de Playwright. SHALL NOT cachearse: datos de Postgres, datos
  mutables de MinIO, cualquier estado de base de datos de pruebas, ni
  `.next` en las pruebas cuyo propósito es validar un build genuinamente en
  frío (documentar la excepción explícitamente). Verificar comparando los
  tiempos de ejecución entre dos corridas consecutivas.
- [ ] 9.7 Aislamiento de secretos. `ci.yml`: SHALL NOT requerir ningún
  secreto real de producción — solo secretos de prueba deterministas
  (equivalentes a `.env.test`), Postgres y MinIO desechables. `release.yml`:
  los jobs de calificación/prueba tampoco usan secretos de aplicación de
  producción; crear/usar un GitHub Environment `production` reservado
  exclusivamente para las responsabilidades de despliegue/publicación
  posteriores a la calificación que requieran credenciales privilegiadas
  (metadata futura esperada: `DOKPLOY_URL`, `DOKPLOY_API_KEY`,
  `DOKPLOY_COMPOSE_ID`, `PRODUCTION_URL`). `DATABASE_URI`/contraseña de
  Postgres/`PAYLOAD_SECRET`/credenciales S3/R2 de producción SHALL NOT
  colocarse directamente en jobs de CI ordinarios cuando Dokploy puede
  poseer esos valores en runtime. Verificar por revisión del YAML de ambos
  workflows.
- [ ] 9.8 Publicación de imágenes en GHCR. Tras pasar la calificación FULL
  de 9.5: construir imágenes Docker inmutables para `runner` y `migrator`,
  publicarlas en GHCR con tags basados en el SHA de Git inmutable (p. ej.
  `ghcr.io/<owner>/60-segundos:runner-<git-sha>`), alias legibles como
  `main` opcionales pero el contrato de despliegue SHALL usar el SHA
  inmutable. Usar permisos de GitHub Actions (`contents: read`,
  `packages: write`) en vez de un PAT innecesario. Verificar que ambas
  imágenes existen en GHCR y corresponden exactamente al commit validado.
- [ ] 9.9 Contrato de Compose de producción para Dokploy. Definir el
  artefacto de despliegue esperado - preferir un archivo dedicado
  (`compose.dokploy.yaml`) en vez de reutilizar directamente
  `compose.prod.yaml` (que permanece como el artefacto local de
  producción-smoke, sin otro rol). El contrato conceptual usa `image:`
  apuntando a GHCR (nunca `build:` en el VPS), Postgres 17 con volumen
  nombrado persistente, sin publicar el puerto 5432 al host, servicio de
  migración de un solo uso, servicio de aplicación, secretos/entorno de
  runtime provistos por Dokploy - la app SHALL arrancar solo después de
  una migración exitosa. No se aprovisiona ni se despliega a un VPS real en
  Fase 11. Verificar el contrato de forma local/estática y documentar su
  comportamiento de runtime esperado.
- [ ] 9.10 Documentar el modelo de migración de producción esperado: los
  runners hospedados por GitHub SHALL NOT conectarse directamente al
  container de Postgres del VPS; Postgres SHALL NOT exponerse a Internet
  para CI/CD. Las migraciones de producción se ejecutan dentro de la red
  Docker/Dokploy del VPS a través del `migrator` dedicado. Flujo requerido:
  Postgres disponible → imagen `migrator` del release → migraciones de
  Payload → exit 0 → arranca el `runner` del mismo release. Si la
  migración falla, el despliegue de la app SHALL NOT proceder. Preserva la
  regla expand/contract / migraciones retrocompatibles (el rollback de la
  aplicación no revierte automáticamente el esquema de Postgres). Verificar
  documentando y validando el contrato de orquestación.
- [ ] 9.11 Definir cómo `release.yml` entregará eventualmente el release
  calificado a Dokploy: GitHub Actions → API de Dokploy → desplegar/
  actualizar Compose → pull de las imágenes GHCR inmutables → correr
  migración → arrancar app. Dokploy Auto Deploy sobre `push` a `main`
  SHALL NOT ser la ruta de producción. No se requieren credenciales reales
  de Dokploy en Fase 11 salvo que exista una instancia no-productiva
  segura disponible; si no existe, esta tarea valida el contrato de la
  API/payload y defiere la invocación real a
  `production-deployment-dokploy`.
- [ ] 9.12 Definir el contrato de smoke post-despliegue que el despliegue
  Dokploy posterior deberá ejecutar, como mínimo: `/api/health`, `/`, una
  Category, un Article, `/buscar`, `/admin/login`. El release SHALL
  considerarse no exitoso si health/readiness no converge. No afirmar
  rollback automático salvo que esté realmente configurado y verificado en
  Dokploy.
- [ ] 9.13 El workflow de release SHALL registrar: SHA de Git, tag GHCR de
  `runner`, tag GHCR de `migrator`, la corrida del workflow, timestamp del
  release, y el identificador de despliegue de Dokploy cuando exista.
  Rollback SHALL seleccionar una imagen `runner` inmutable ya construida,
  sin reconstruir desde código fuente. Documentar explícitamente: rollback
  de aplicación ≠ rollback de base de datos - la seguridad del esquema
  sigue dependiendo de migraciones retrocompatibles.
- [ ] 9.14 Verificación de punta a punta con corridas reales de GitHub
  Actions: (1) PR de prueba - `quality`, `integration`, `e2e-pr`,
  validación de build de Docker; (2) merge a `main` o
  `workflow_dispatch` - calificación FULL, publicación de la imagen
  `runner` en GHCR, publicación de la imagen `migrator` en GHCR, salida de
  provenance del release. Si no existe todavía infraestructura Dokploy real
  aprovisionada, el workflow automatizado se detiene en el límite de
  entrega a Dokploy ya definido - no fabricar credenciales de producción
  falsas solo para marcar la tarea como completa. La verificación real
  contra VPS/Dokploy pertenece a `production-deployment-dokploy`.

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
