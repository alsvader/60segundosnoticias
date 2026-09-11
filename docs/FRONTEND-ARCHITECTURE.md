# 60 Segundos Noticias — Frontend Architecture (Fase 5-7)

Este documento describe cómo se implementó el acceso a datos y el site shell público (`openspec/changes/public-frontend-core/`), extendido en Fase 6 (`openspec/changes/dynamic-home-builder/`) con el pipeline dinámico de Home, y en Fase 7 (`openspec/changes/category-article-pages/`) con las rutas públicas de Category/Article/Page genérica. Los requisitos de producto viven en `docs/60-segundos-spec.md` §18-§26/§32/§37-40; este archivo documenta convenciones de implementación.

## Flujo general

```
Payload (Collections + Globals: Navigation/Footer/SiteSettings)
  ↓
src/lib/payload/get-payload.ts       (getPayload() centralizado)
  ↓
src/lib/data/                        (DAL — queries + convenciones)
  ↓
src/lib/view-models/                 (normalización → contratos frontend)
  ↓
Server Component (layout/page)
  ↓
Componente presentacional (Design System, Fase 4)
```

## Seguridad — acceso público a Payload

`src/lib/data/public-query.ts` es el **único** punto por el que el frontend público lee Payload. Expone `findPublished()`, `findOnePublished()` y `findGlobalPublished()`, todas con `overrideAccess: false` **hardcodeado** — no es un parámetro, no puede pasarse como `true`. Payload Local API por defecto bypassa el control de acceso de la Collection (`overrideAccess: true` implícito); sin este helper, cualquier función del DAL que lo olvidara expondría Drafts públicamente.

Para `posts`/`pages`, el helper además mezcla `_status: { equals: 'published' }` en el `where` recibido, como defensa en profundidad independiente del `access.read` ya correcto de esas Collections (Fase 2/3).

**Regla dura**: ninguna función pública del DAL acepta un argumento que permita cambiar `overrideAccess`. Un futuro acceso de preview/admin (Fase 8, Draft Mode) usa una función distinta y explícitamente nombrada — nunca un flag en el helper público.

Verificado en tiempo de ejecución (no solo por tipos): con 3 Posts en `draft` y 1 en `published` en la base de datos de desarrollo, `getLatestPosts()` devolvió únicamente el publicado.

`findPublished()`/`findOnePublished()` también aceptan `select` (tipado contra `TypedCollectionSelect` — el mismo tipo generado que usa `payload.find()` internamente, verificado contra los tipos instalados de Payload 3.87.1). `select` solo proyecta campos; nunca toca `overrideAccess`, que sigue hardcodeado. Payload usa "modo exclusión" cuando algún valor del `select` es `false` (verificado en `node_modules/payload/dist/utilities/getSelectMode.js`): `select: { content: false }` devuelve todos los demás campos excepto `content`. Verificado en tiempo de ejecución: `getLatestPosts()` devuelve `title`/`excerpt`/etc. pero el objeto no tiene la propiedad `content`.

## Data Access Layer (`src/lib/data/`)

- `posts.ts`: `getLatestPosts({ limit, categoryId? })` (Fase 6, bloque Home `LatestPosts`); `getPostsByCategory({ categoryId, limit, page? })` (Fase 6, extendido en Fase 7 con paginación — devuelve el resultado paginado completo de Payload, `docs`/`totalDocs`/`totalPages`, no solo el arreglo; membership inclusivo `primaryCategory` OR `additionalCategories`, reutilizado tal cual por la Category Page); `getPostBySlug({ slug })` (Fase 7, único consumidor de la Article Page — `depth: 2`, único punto del DAL que carga `content` completo); `getRelatedPosts({ postId, primaryCategoryId, limit? })` (Fase 7, mismo `primaryCategory`, excluye el Post actual, sin `content`).
- `categories.ts`: `getCategoriesForNavigation()` — filtra `showInNavigation: true`. `getCategoryBySlug({ slug })` (Fase 7) — Categories no tienen workflow de draft, así que `findPublished()` se usa solo por el boundary `overrideAccess: false` compartido, no por un filtro de `_status`.
- `pages.ts` (Fase 7): `getPageBySlug({ slug })` — solo Pages publicadas, `depth: 1`.
- `navigation.ts` / `footer.ts` / `settings.ts`: `getNavigation()`/`getFooter()`/`getSettings()`, leen los Globals homónimos con `depth: 1`.
- `home.ts` (Fase 6): `getHome()`, lee el Global `Home` con `depth: 2` (los blocks referencian Posts/Categories a depth 1, y esos Posts necesitan su propia `primaryCategory`/`featuredImage`/`author` poblada a depth 2 para que `mapPostToArticleCardData` pueda construir un `href` válido).

## View Models (`src/lib/view-models/`)

Normalizan documentos/relaciones de Payload hacia los contratos frontend de Fase 4 (`ArticleCardData`, `CategoryCardData`) y nuevos:

- `media.ts` — `mapMediaToMediaData()`: selecciona el tamaño de imagen generado apropiado al contexto (`card`/`tablet`, nunca `hero` para tarjetas — AC-MEDIA-004), maneja Media ausente.
- `author.ts` — `mapUserToAuthorSummary()`: **allowlist explícito** (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`). `email`/`role`/`active`/campos de auth nunca se copian — verificado en tiempo de ejecución contra un `User` real con esos campos poblados.
- `category-card.ts` — `mapCategoryToCategoryCardData()`: preserva `colorTheme`/`icon` tal cual (ya tipados como unions controladas por Payload).
- `article-card.ts` — `mapPostToArticleCardData()`: requiere `primaryCategory` poblado (`depth >= 1`); devuelve `undefined` si no lo está, en vez de construir un `href` inválido.
- `article.ts` (Fase 7) — `mapPostToArticleDetailData()`: contrato distinto de `ArticleCardData` (`ArticleDetailData`), normaliza `content`/`tags`/`source`/`photoCredits`/fechas/reading time además de lo que ya cubre `article-card.ts`; sin `additionalCategories` (sin consumidor real en la composición de Article, §34). `updatedAtLabel` solo se incluye si `updatedAt` difiere de `publishedAt` por más de un umbral pequeño — Payload actualiza ambos casi simultáneamente en la primera publicación.

## URLs (`src/lib/url/`)

- `canonical.ts`: `getCategoryUrl()`, `getPostUrl()`, `getPageUrl()`, `normalizePath()` — únicas funciones que construyen estas rutas. Las rutas dinámicas correspondientes (`src/app/(frontend)/[category]/page.tsx`, `src/app/(frontend)/[category]/[post]/page.tsx`) se implementaron en Fase 7 — ver "Article/Category/Page Pipeline" más abajo.
- `resolve-link.ts`: `resolveLink()`/`resolveLinks()`/`resolveNavItems()` resuelven el "modelo reutilizable de enlace" (Master Spec §27/§28 — Navigation items, Footer links/legalLinks, y los CTA de `HeroNews`/`Banner`/`EditorialIntro` de Fase 6 comparten el mismo shape `label/type/category/page/url/openInNewTab`, ver `src/payload/fields/link-fields.ts`). Un enlace `external` solo se resuelve si su URL empieza con `http://`/`https://` (allowlist, no denylist — así `javascript:`/`data:` nunca pasan, AC-SEC-007). `resolveLink()` devuelve `undefined` (nunca lanza) ante un item ausente, un `label` vacío, o un tipo mal configurado (p. ej. `type: 'category'` sin `category` seleccionada, o una URL externa que no pasa el allowlist) — cada bloque consumidor decide si eso oculta solo el CTA o el bloque completo (ver más abajo).

## Fechas

`src/lib/format/date.ts` centraliza `Intl.DateTimeFormat('es-MX', ...)`. Ningún componente instancia su propio formatter.

## Site shell (`src/components/site/`)

`Header` y `Footer` son Server Components presentacionales — reciben todo por props, no importan Payload. `src/app/(frontend)/layout.tsx` es el único punto que llama al DAL para el shell (Navigation/Footer/SiteSettings en paralelo vía `Promise.all`) y le pasa los datos ya resueltos.

`MobileNav` (`src/components/site/mobile-nav.tsx`) es el único Client Component (`'use client'`) de esta change — acotado a la interacción de apertura/cierre del menú móvil, usando el primitivo shadcn `Sheet` (primer consumidor real; instalación incremental, sin dependencias nuevas — `Sheet` se apoya en `radix-ui`, ya instalado). Escape-to-close, focus trap y scroll lock del fondo son comportamiento propio de Radix Dialog (que `Sheet` envuelve), no código propio.

### Next.js 16 y contenido administrable

`src/app/(frontend)/layout.tsx` declara `export const dynamic = 'force-dynamic'`. Sin esto, Next.js 16 pre-renderiza `/` estáticamente en build time, horneando Navigation/Footer/SiteSettings en un snapshot fijo hasta el siguiente rebuild — contradiciendo "administrable sin cambio de código" (AC-NAV-004, AC-FOOT-001/002). Esta es la postura de caché más pequeña posible (sin caché, siempre fetch fresco); Fase 8 puede añadir revalidación por tags encima sin conflicto.

## Home Block Pipeline (Fase 6)

```
Payload Block (Home.layout[])
  ↓
src/lib/data/home.ts                 (getHome() — overrideAccess: false)
  ↓
src/lib/home/resolve-home-blocks.ts  (resolveHomeBlocks() — un resolver por tipo de bloque)
  ↓
Unión discriminada frontend-safe (ResolvedHomeBlock)
  ↓
src/components/sections/home/home-block-renderer.tsx  (HomeBlockRenderer — switch exhaustivo)
  ↓
Section presentacional (src/components/sections/home/*, src/components/sections/banner-section.tsx)
```

Primera vez que este pipeline (Payload Block → Resolver → View Model → Renderer → Section, Master Spec §61) se implementa en el repo — los Page Blocks de Fase 2 (`Hero`, `RichText`, `ImageText`, `Gallery`, `Video`, `CTA`, `FAQ`, `Banner`) siguen sin `PageBlockRenderer` propio; eso es Fase 7.

- **8 Home Blocks V1** (`src/payload/blocks/home/`): `EditorialIntro`, `HeroNews`, `CategoryExplorer`, `LatestPosts`, `PostsByCategory`, `FeaturedPosts`, `VideoFeature`. `Banner` se reubicó a `src/payload/blocks/shared/Banner.ts` — el mismo schema se usa desde `Home.layout` y `Pages.layout`, en vez de duplicarlo; `src/components/sections/banner-section.tsx` es el único `BannerSection`, fuera de `sections/home/`/`sections/pages/` precisamente porque ambas fases lo comparten.
- **`EditorialIntro`** (agregado por aprobación explícita durante revisión visual manual, `docs/60-segundos-spec.md` §19.2): composición editorial introductoria sin dependencia de un Post — dos relaciones a Media independientes (`backgroundImage` a ancho completo de la sección, `foregroundImage` junto al texto) y un titular en dos colores (`headlinePrimary` en tinta, `headlineAccent` en rojo de marca). Ambas imágenes se resuelven con el mismo `mapMediaToMediaData()` ya usado por el resto de los bloques — sin DAL nuevo.
- **Revalidación de contenido no publicado en relaciones manuales** (`HeroNews.mainPost`/`secondaryPosts` en modo manual, `FeaturedPosts.posts`, `VideoFeature.post`): verificado contra `node_modules/payload/dist/fields/hooks/afterRead/relationshipPopulationPromise.js` (Payload 3.87.1) que una relación que falla el control de acceso (p. ej. un Post en Draft) cae de vuelta al ID crudo, nunca a un objeto poblado ni a `null`. `resolve-home-blocks.ts` trata cualquier relación que llegue como `typeof === 'number'` como ausente — el mismo criterio que `mapPostToArticleCardData` ya usa para `primaryCategory`.
- **`VideoFeature` con `source: external`**: `src/lib/editorial/video-provider.ts` restringe a URLs de YouTube/Vimeo por hostname, normalizadas a `{ provider, embedId }`. Nunca se acepta un iframe/HTML arbitrario.
- **Un único H1 en Home**: la página (`src/app/(frontend)/page.tsx`) renderiza su propio `<h1 className="sr-only">`, independiente del layout configurado. Ningún Section renderiza `<h1>` — `HeroNewsSection` usa `<h2>` para el titular, incluso cuando su escala tipográfica visual es la de un H1.
- **Layouts `carousel`/`horizontal`** (`FeaturedPosts`, `PostsByCategory`): `overflow-x-auto` + CSS scroll-snap nativo, sin dependencia de carousel.
- **CTA de `HeroNews`/`Banner`/`EditorialIntro` sobre `linkFields`**: los tres usan un campo `group` (`cta` en `HeroNews`/`EditorialIntro`, `link` en `Banner`) con el mismo modelo `linkFields` de Navigation/Footer — el Admin elige Category/Page/External, nunca escribe una URL a mano sin ese selector. `EditorialIntro.cta` es requerido (`fields: linkFields`); `HeroNews.cta`/`Banner.link` son opcionales (`fields: optionalLinkFields`, ver `src/payload/fields/link-fields.ts`) — `optionalLinkFields` deriva de `linkFields` vía `.map()` (mismo modelo, sin duplicarlo), solo relajando `required` en los subcampos `label`/`type`, porque Payload exige el `required` de un subcampo sin importar si el `group` padre es opcional (verificado empíricamente: un `cta` vacío en `linkFields` sin relajar falla la validación aunque el grupo no sea requerido). El resolver de cada bloque llama `resolveLink()` sobre ese grupo: en `HeroNews`/`Banner`, un CTA no resuelto simplemente omite el CTA (el resto del bloque se renderiza); en `EditorialIntro`, un CTA no resuelto oculta el bloque completo (su CTA es parte de la composición requerida, no un extra).
- **Seeds**: `seed:initial` establece un `Home.layout` baseline de un único bloque `CategoryExplorer` (el único bloque V1 sin dependencia de Posts reales) solo si `Home.layout` está vacío — nunca sobrescribe una configuración ya guardada. `seed:dev` anexa (no reemplaza) bloques de ejemplo para los 8 tipos de bloque V1 (`EditorialIntro`, `HeroNews`, `LatestPosts`, `PostsByCategory` por categoría, `FeaturedPosts`, `VideoFeature`, `Banner`), usando dos claves de idempotencia distintas según el bloque: un `title` fijo para los bloques repetibles (`LatestPosts`, `FeaturedPosts`, `PostsByCategory` por categoría, `Banner`); "¿ya existe alguna instancia de este tipo?" para los bloques que son singleton de página (`HeroNews`, `VideoFeature`), para no duplicar el hero o el video destacado si un Admin ya configuró uno manualmente.

## Article/Category/Page Pipeline (Fase 7)

```
request /<slug>
  |
  v
resolveRootSlug()  (src/lib/content/resolve-root-slug.ts)
  |-- Category?  --> Category Page (getPostsByCategory, membership inclusivo)
  |-- Page?       --> PageBlockRenderer (los 8 Page Blocks)
  `-- ninguno     --> notFound()

request /<category>/<post>
  |
  v
getPostBySlug() --> ¿categoría solicitada == primaryCategory?
  |-- sí  --> Article Page
  `-- no  --> permanentRedirect(getPostUrl(primaryCategory.slug, post.slug))
```

Ambas rutas viven en la misma carpeta `src/app/(frontend)/[category]/` —
`[category]/page.tsx` (resolver de raíz) y `[category]/[post]/page.tsx`
(Article). Next.js App Router exige que todo segmento dinámico en la
misma posición de ruta comparta un único nombre de carpeta (falla en
runtime con "You cannot use different slug names for the same dynamic
path" si no); el nombre `[category]` es solo esa restricción de framework
— el resolver de raíz trata su valor como un slug genérico (Category o
Page), no asume que siempre es una categoría.

- **`resolveRootSlug()`**: Category primero (siempre pública, `read: () =>
  true`, sin estado draft), luego `getPageBySlug()` (solo published).
  Secuencial, no `Promise.all` — el namespace de slugs ya es mutuamente
  excluyente entre Categories y Pages (`slug-namespace-integrity`, Fase
  2), así que como máximo una de las dos consultas resuelve.
- **Corrección canónica de Article**: `permanentRedirect()` de
  `next/navigation` (no la Collection `Redirects`, que sigue siendo
  exclusivamente Fase 8) cuando la categoría de la URL no es la
  `primaryCategory` real del Post — cubre también el caso de una URL
  construida con una `additionalCategory`, que nunca produce una segunda
  página pública.
- **Renderizado de Lexical y Article/Page Blocks**
  (`src/components/content/lexical-renderer.tsx`): usa la API oficial de
  `@payloadcms/richtext-lexical/react` (`RichText` + `JSXConvertersFunction`),
  nunca `dangerouslySetInnerHTML`. Los 6 Article Content Blocks
  (`src/components/content/blocks/`) se registran en `converters.blocks`,
  keyed por `blockType` — el mismo mecanismo que un `switch` exhaustivo,
  expresado en la forma que exige la API del paquete. Un `blockType` sin
  entrada simplemente no se renderiza (mismo "log warning, skip safely"
  que `HomeBlockRenderer`, §61).
- **`ImageBlock`** (`src/components/content/blocks/image-block.tsx`): un
  campo `size` (`small`/`medium`/`large`/`full`, no el `alignment`
  `normal`/`wide`/`full` del diseño original — refinamiento post-implementación,
  ver `design.md` Decisión 14) mapea a una clase fija en un `Record`, nunca
  a CSS/margen libre proveniente de Payload.
- **`EmbedBlock`** (`src/lib/editorial/embed-provider.ts`): `instagram`/`x`/
  `tiktok`/`facebook`/`linkedin` reciben tratamiento de proveedor
  controlado (ampliado sobre los 3 originalmente previstos, vía
  `react-social-media-embed` para instagram/x/facebook/linkedin — dependencia
  nueva, acotada a este Content Block, ver `design.md` Decisión 13); `generic`
  (y cualquier URL inválida) siempre degrada a una tarjeta de enlace externo
  segura — nunca un iframe. Un campo `alignment` (`left`/`center`/`right`)
  posiciona la caja del embed (capada a un ancho fijo responsivo: 550px, o
  420px para TikTok) dentro de la columna vía `justify-start/center/end` en
  el `<figure>` envolvente. `VideoBlock` reutiliza `resolveExternalVideoUrl()`
  sin modificarlo para `youtube`/`vimeo` (extendido para detectar YouTube
  Shorts verticales); `uploaded` es un `<video>` nativo separado, sin
  proveedor externo; un campo `portrait` controla el aspect ratio 9:16
  para Shorts/Reels. Ambos (`VideoBlock`/`VideoFeature`) usan `@vidstack/react`
  (segunda dependencia nueva acotada, ver `design.md` Decisión 13).
- **`RichText` de Page y `GalleryBlock`/`VideoBlock` de Page comparten
  componente** con sus equivalentes de Article (mismo schema exacto,
  confirmado en `page-blocks`) — `PageBlockRenderer`
  (`src/components/sections/pages/page-block-renderer.tsx`) los reutiliza
  en vez de duplicar la implementación. `Banner` de Page usa el mismo
  `BannerSection` ya compartido desde Fase 6.
- **Un único H1 por página**: `ArticleHeader`/`CategoryHeader` lo poseen
  en Article/Category; la Generic Page usa un `<h1 className="sr-only">`
  en la propia ruta (mismo patrón que `HomePage`), independiente de si el
  `layout` de la Page incluye un bloque `Hero` o no.
- **Seguridad de datos**: `getPostBySlug()`/`getPageBySlug()`/
  `getCategoryBySlug()`/`getRelatedPosts()` (Fase 7) usan el mismo helper
  público compartido (`overrideAccess: false`, sin escape hatch) que el
  resto del DAL. `getPostsByCategory()` se extendió para devolver el
  resultado paginado completo (`docs`/`totalDocs`/`totalPages`) en vez de
  solo el arreglo — los consumidores de Fase 6 (`resolveHomeBlocks`) se
  actualizaron a leer `.docs`.
- **Article Sidebar** (post-implementación, ver `design.md` — nueva
  capability `article-sidebar`): el Global `ArticleSidebar` (`postsPanel`:
  `enabled`/`mode`/`heading`/`limit`) controla, para todos los Articles a
  la vez, un aside de posts en formato `compact` (`ArticleAside`,
  reutiliza `ArticleCard variant="compact"`). `src/lib/data/article-sidebar.ts`
  resuelve el modo (`latest`/`newest-per-category`/`featured` — vía
  `getLatestPosts()`/`getNewestPostPerCategory()`/`getFeaturedPosts()`,
  todas con el mismo boundary `overrideAccess: false`) y excluye siempre
  el Post actual (sobre-pide un elemento y filtra, ya que ninguna de esas
  consultas soporta un argumento de exclusión). Cuando hay posts para el
  aside, el Article page (`[category]/[post]/page.tsx`) renderiza un
  `grid gap-8 lg:grid-cols-[2fr_1fr]` (contenido + aside, mobile-first —
  una sola columna por debajo de `lg`) con el aside `lg:sticky lg:top-24
  lg:self-start`; sin posts o deshabilitado, vuelve al layout centrado de
  una columna (`mx-auto max-w-[70ch]`) sin dejar espacio vacío.

## Los cuatro roles de la base de datos en desarrollo

Ver `README.md` — "Los cuatro roles de la base de datos en este proyecto": base de desarrollo local (push-managed) / migraciones versionadas en `src/payload/migrations/` / verificación de la cadena de migraciones en una base desechable / orquestación de migraciones en producción-CI (Fase 10). Este documento no repite esa distinción; solo referencia el flujo cuando el DAL o el schema cambian.

## Fuera de alcance de esta Fase

Draft Mode/Preview, resolución en runtime de la Collection `Redirects`, revalidación por tags, metadata/JSON-LD, sitemap/robots, búsqueda, ruta de Autor/Tag, almacenamiento de objetos en producción, orquestación de migraciones en CI/producción (Fase 8/9/10/11).
