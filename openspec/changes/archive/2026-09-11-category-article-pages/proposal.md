## Why

Tras la Fase 6, el sitio público solo tiene Home: no existe ninguna forma de ver una Categoría, un Artículo o una Página genérica, así que el contenido editorial real (Posts, Categories, Pages) es inalcanzable para un visitante. Esta change implementa la Fase 7 del Master Spec (`docs/60-segundos-spec.md`) — el bloque de rutas públicas de contenido — sin el cual el CMS no tiene ningún consumidor final más allá de Home.

## What Changes

- Nuevo resolver de ruta raíz `/<slug>` (`root-content-routing`) que distingue Category de Page usando la integridad de namespace ya garantizada en el CMS, y nuevo 404/error boundary públicos con identidad de marca.
- Nueva ruta de Category `/<slug>` con listado paginado server-side (12/página, `?page=N`), membership inclusivo (`primaryCategory` OR `additionalCategories`) — misma semántica que `PostsByCategory` de Fase 6.
- Nueva ruta de Article `/<category>/<post>` con corrección canónica en vivo: si la categoría de la URL no coincide con `primaryCategory` del Post, redirige (`permanentRedirect`) a la URL canónica — nunca crea una segunda URL pública por `additionalCategories`.
- Nuevo renderizado seguro de contenido Lexical del body de Article (API oficial de `@payloadcms/richtext-lexical`, nunca `dangerouslySetInnerHTML`) y de los 6 Article Content Blocks (Image/Gallery/Video/Quote/Callout/Embed), vía un `ArticleBlockRenderer` nuevo.
- Nuevo `PageBlockRenderer` para Generic Pages y sus 8 Page Blocks, reutilizando la infraestructura de Gallery/Video/RichText de Article donde el schema ya es idéntico, y el `BannerSection` ya compartido desde Fase 6.
- Nuevo Author Card público, construido sobre el `AuthorSummary` ya implementado (`displayName`/`avatar`/`bio`/`socialLinks`/`slug`) — sin ruta `/autor/[slug]` ni enlace hacia ella.
- Nuevas Related Posts: misma `primaryCategory`, excluye el Post actual, solo publicados, `ORDER BY publishedAt DESC LIMIT ~4`, sin configuración manual.
- Nuevo componente `ShareActions` (Facebook/X/WhatsApp/Copy link/Web Share API), sin botón falso de Instagram.
- **BREAKING**: el Page Block `CTA` (`src/payload/blocks/page/CTA.ts`) migra de los campos planos `linkLabel`/`linkURL` al modelo `linkFields` ya usado por `Banner`/`HeroNews`/`EditorialIntro` — requiere migración de schema y transformación de datos existentes (incluidas tablas de versiones de Pages) antes de eliminar las columnas viejas.
- **Nuevo (post-implementación, tras revisión manual)**: aside del Article con listado de posts en formato `compact`, junto al contenido en layout de 2 columnas (`lg:` en adelante; apilado en mobile) y sticky al hacer scroll — controlado globalmente (no por Post) por un nuevo Payload Global `ArticleSidebar`, con selección de modo (`latest`/`newest-per-category`/`featured`), heading opcional y límite de posts. Pensado como el mismo espacio donde una fase futura (fuera de este alcance) agregará una opción de anuncios.

## Capabilities

### New Capabilities
- `root-content-routing`: resolución de `/<slug>` a Category o Page, reserved roots, 404 branded y error boundary branded para el frontend público.
- `category-page`: ruta y listado paginado de Posts por categoría (membership inclusivo), encabezado de categoría.
- `article-page`: ruta de Article, corrección canónica de categoría, composición completa de la página (breadcrumb, metadata, share, tags, author, related), Author Card, Related Posts, Sharing.
- `article-content-rendering`: renderizado seguro de Lexical y de los 6 Article Content Blocks.
- `page-content-rendering`: `PageBlockRenderer` y los 8 Page Blocks, reutilizando `article-content-rendering` y el `BannerSection` compartido.
- `article-sidebar`: Payload Global `ArticleSidebar` (control site-wide, no por Post) + aside de posts en formato `compact` junto al contenido del Article, layout de 2 columnas sticky desde `lg:`.

### Modified Capabilities
- `page-blocks`: el Page Block `CTA` cambia su modelo de enlace de `linkLabel`/`linkURL` a `link` (`linkFields`) — cambio de requirement de schema, no solo de implementación.
- `frontend-data-access`: se agregan `getPostBySlug()`, `getPageBySlug()`, `getCategoryBySlug()`, `getRelatedPosts()` al DAL, preservando el boundary `overrideAccess:false` sin escape hatch.
- `public-view-models`: se agrega el view model de detalle de Article; se formaliza como requirement el `AuthorSummary` enriquecido (`bio`/`socialLinks`) ya implementado, como contrato aprobado para el Author Card público.

## Impact

- **Código nuevo**: `src/app/(frontend)/[category]/page.tsx` (resolver de raíz: Category o Page), `src/app/(frontend)/[category]/[post]/page.tsx`, `src/app/(frontend)/not-found.tsx`, `src/app/(frontend)/error.tsx`; DAL nuevo en `src/lib/data/`; view models nuevos en `src/lib/view-models/`; componentes nuevos (`CategoryHeader`, `ArticleHeader`, `AuthorCard`, `ShareActions`, renderers de blocks y sus Sections); `src/payload/globals/ArticleSidebar.ts` (nuevo Global), `src/components/content/article-aside.tsx`, DAL nuevo en `src/lib/data/article-sidebar.ts` + funciones nuevas en `src/lib/data/posts.ts`/`categories.ts`.
- **Código modificado**: `src/payload/blocks/page/CTA.ts` (schema), `src/payload-types.ts` (regenerado), migraciones de Payload revisadas contra una base desechable (nunca contra la base de desarrollo push-managed) — una para el schema de `CTA`, otra pendiente para el nuevo Global `ArticleSidebar`.
- **Dependencias nuevas, acotadas a Embed/Video** (excepción post-implementación, ver Decisión 13 en `design.md`): `@vidstack/react` (solo `VideoBlock`/`VideoFeature`) y `react-social-media-embed` (solo `EmbedBlock`, providers `instagram`/`x`/`facebook`/`linkedin`). Todo lo demás usa `@payloadcms/richtext-lexical` ya instalado; el `GalleryBlock` sigue sin librería de carousel (patrón nativo de scroll-snap ya establecido en Fase 6).
- **Sin cambios** a Home, Navigation, Footer o SiteSettings salvo que surja un defecto real de integración durante la implementación.
- **Documentación**: nueva sección en `docs/FRONTEND-ARCHITECTURE.md` ("Article/Category/Page Pipeline — Fase 7").
