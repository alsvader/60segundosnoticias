## Why

Fase 5 dejó `/` como el placeholder estático de Fase 0. El Master Spec exige que el Home sea completamente administrable por el Admin desde Payload (agregar, eliminar, reordenar y configurar bloques, sin deploy), y el DAL público, los view models y los componentes editoriales de Fases 4/5 ya existen para soportarlo. Falta construir el pipeline dinámico real que los conecta: el Global `Home`, sus 7 bloques V1 y el resolver/renderer que los transforma en contenido público seguro.

## What Changes

- Nuevo Global `Home` en Payload: `layout` (`blocks[]`), `seo` opcional, `versions: { drafts: true }` — gestionable solo por Admin, lectura pública del estado publicado.
- 8 Home Blocks V1 en `src/payload/blocks/home/`: `EditorialIntro`, `HeroNews`, `CategoryExplorer`, `LatestPosts`, `PostsByCategory`, `FeaturedPosts`, `VideoFeature`, `Banner`. `Banner` reutiliza/comparte el schema ya existente de `src/payload/blocks/page/Banner.ts` en vez de duplicarlo.
- `EditorialIntroBlock` (agregado por aprobación explícita durante revisión visual manual, inspirado en `docs/references/home-reference.jpeg`): composición editorial introductoria — no depende de un Post (a diferencia de `HeroNews`) ni es contenido secundario/promocional (a diferencia de `Banner`). Campos: `headlinePrimary`/`headlineAccent` (titular en dos colores), `description`, `ctaLabel`/`ctaLink`, `backgroundImage` y `foregroundImage` (dos relaciones a Media independientes, compuestas en capas — el fondo es una sola composición visual preparada por el Admin, sin campos CMS separados por elemento decorativo).
- Home DAL: `getHome()` nuevo; `getPostsByCategory()` nuevo (consumo Home-específico únicamente, sin implementar la ruta de Categoría de Fase 7); reuso de `getLatestPosts()`/`getCategoriesForNavigation()` ya existentes.
- `resolveHomeBlocks()`: normaliza cada block Payload a un view-model discriminado frontend-safe. Revalida en runtime que cualquier Post seleccionado manualmente (`HeroNews.mainPost/secondaryPosts`, `FeaturedPosts.posts`, `VideoFeature` con `source: post`) siga publicado, sin depender solo del filtrado del Admin UI. `PostsByCategory` usa membership inclusivo (`primaryCategory` OR `additionalCategories`).
- `HomeBlockRenderer`: renderer type-safe por discriminated union; un tipo de block desconocido se omite con warning, sin romper la página; garantiza un único `H1` en Home sin importar el orden que configure el Admin.
- 7 Section components nuevos en `src/components/sections/home/` (`HeroNewsSection`, `CategoryExplorerSection`, `LatestPostsSection`, `PostsByCategorySection`, `FeaturedPostsSection`, `VideoFeatureSection`, `BannerSection`). `BannerSection` queda compartida para un futuro uso desde el renderer de Pages (Fase 7).
- `VideoFeature` con `source: external`: allowlist server-side por dominio (YouTube/Vimeo únicamente), normalizado a un shape frontend-safe; nunca acepta iframe/HTML arbitrario.
- Layouts `carousel`/`horizontal` (`FeaturedPosts`, `PostsByCategory`) implementados con scroll nativo (`overflow-x-auto` + CSS scroll-snap), sin dependencias nuevas.
- `src/app/(frontend)/page.tsx` reemplaza el placeholder de Fase 0 por el pipeline real (`getHome()` → `resolveHomeBlocks()` → `HomeBlockRenderer`), sigue siendo Server Component envuelto por el site shell de Fase 5, mantiene `force-dynamic`.
- Migración de Payload para el Global `Home` y regeneración de `payload-types.ts`.
- `seed:initial`: baseline de Home mínima e idempotente, sin depender de Posts de prueba, sin sobrescribir una configuración de Home ya existente. `seed:dev`: bloques de ejemplo usando datos de desarrollo.
- Actualiza `docs/FRONTEND-ARCHITECTURE.md` con el pipeline de blocks documentado (Payload Block → Resolver → View Model → Renderer → Section).

## Capabilities

### New Capabilities
- `home-global`: schema y permisos del Global `Home` (`layout[]` reordenable, `versions: drafts`, acceso Admin-only en escritura, lectura pública del estado publicado, sin CSS/Tailwind arbitrario desde el CMS).
- `home-data-resolution`: `getHome()`, `resolveHomeBlocks()` y las queries del DAL Home-específicas; exclusión en runtime de contenido no publicado tanto en selección manual como automática, preservando `overrideAccess: false`.
- `home-block-renderer`: `HomeBlockRenderer` type-safe, manejo seguro de block desconocido (log + skip), jerarquía de encabezados (un único H1) independiente del orden configurado por el Admin.
- `home-sections`: los 8 Home Blocks V1 y sus Section components correspondientes — contrato resuelto por bloque, responsabilidad de cada Section, comportamiento de estado vacío/degradado por bloque, validación de proveedor de video controlado, composición en capas de `EditorialIntro` (backgroundImage/foregroundImage).

### Modified Capabilities
- `frontend-data-access`: el requisito "Globals Navigation, Footer y SiteSettings accesibles vía DAL... el Global Home no SHALL existir" deja de ser cierto — se agrega `getHome()` al DAL y un nuevo requisito sobre la existencia y lectura pública segura del Global `Home`.
- `seed-workflow`: el requisito "seed:initial pobla solo entidades con schema ya implementado... SHALL NOT crear ni simular datos de Globals que aún no están implementados (Navigation, Home, SiteSettings)" cambia para `Home` — `seed:initial` puede ahora establecer una configuración base de Home idempotente, y `seed:dev` puede configurar bloques de Home con datos de desarrollo.

## Impact

- **Código nuevo:** `src/payload/globals/Home.ts`, `src/payload/blocks/home/*.ts`, `src/lib/data/home.ts` (+ extensión de `src/lib/data/posts.ts` con `getPostsByCategory()`), un resolver `resolveHomeBlocks()`, `src/components/sections/home/*.tsx`, `HomeBlockRenderer`.
- **Código modificado:** `payload.config.ts` (registra el Global `Home`), `src/app/(frontend)/page.tsx` (reemplaza el placeholder), `src/payload/blocks/page/Banner.ts` o su reubicación compartida, `src/payload/seed/initial.ts` y `dev.ts`, `docs/FRONTEND-ARCHITECTURE.md`.
- **Base de datos:** nueva migración de Payload para las tablas generadas del Global `Home` y sus blocks; regeneración de `src/payload-types.ts`.
- **Dependencias:** ninguna nueva.
- **Fuera de alcance (Fase 7+):** rutas de Categoría/Artículo/Page genérica, Draft Mode/Preview, revalidación por tags/cache targeting, metadata/JSON-LD, sitemap/robots, búsqueda, almacenamiento en producción.
