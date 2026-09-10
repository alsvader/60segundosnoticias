# 60 Segundos Noticias — Frontend Architecture (Fase 5)

Este documento describe cómo se implementó el acceso a datos y el site shell público (`openspec/changes/public-frontend-core/`), extendido en Fase 6 (`openspec/changes/dynamic-home-builder/`) con el pipeline dinámico de Home. Los requisitos de producto viven en `docs/60-segundos-spec.md` §18-§26/§32/§37-40; este archivo documenta convenciones de implementación.

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

- `posts.ts`: `getLatestPosts({ limit, categoryId? })` (el filtro `categoryId` se agregó en Fase 6 para el bloque Home `LatestPosts`) y `getPostsByCategory({ categoryId, limit })` (Fase 6, consumidor: bloque Home `PostsByCategory`; usa membership inclusivo `primaryCategory` OR `additionalCategories`, la misma semántica que usará la futura Category Page). Ambas con `depth: 1`, `select: { content: false }`, orden `-publishedAt`. `getPostBySlug()` sigue sin implementarse — su consumidor es la página de Artículo, Fase 7.
- `categories.ts`: `getCategoriesForNavigation()` — filtra `showInNavigation: true`. `getCategoryBySlug()` no se implementó por la misma razón (consumidor es la página de Categoría, Fase 7).
- `pages.ts`: no existe — su único consumidor (la página de Page genérica) es Fase 7.
- `navigation.ts` / `footer.ts` / `settings.ts`: `getNavigation()`/`getFooter()`/`getSettings()`, leen los Globals homónimos con `depth: 1`.
- `home.ts` (Fase 6): `getHome()`, lee el Global `Home` con `depth: 2` (los blocks referencian Posts/Categories a depth 1, y esos Posts necesitan su propia `primaryCategory`/`featuredImage`/`author` poblada a depth 2 para que `mapPostToArticleCardData` pueda construir un `href` válido).

## View Models (`src/lib/view-models/`)

Normalizan documentos/relaciones de Payload hacia los contratos frontend de Fase 4 (`ArticleCardData`, `CategoryCardData`) y nuevos:

- `media.ts` — `mapMediaToMediaData()`: selecciona el tamaño de imagen generado apropiado al contexto (`card`/`tablet`, nunca `hero` para tarjetas — AC-MEDIA-004), maneja Media ausente.
- `author.ts` — `mapUserToAuthorSummary()`: **allowlist explícito** (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`). `email`/`role`/`active`/campos de auth nunca se copian — verificado en tiempo de ejecución contra un `User` real con esos campos poblados.
- `category-card.ts` — `mapCategoryToCategoryCardData()`: preserva `colorTheme`/`icon` tal cual (ya tipados como unions controladas por Payload).
- `article-card.ts` — `mapPostToArticleCardData()`: requiere `primaryCategory` poblado (`depth >= 1`); devuelve `undefined` si no lo está, en vez de construir un `href` inválido.

## URLs (`src/lib/url/`)

- `canonical.ts`: `getCategoryUrl()`, `getPostUrl()`, `getPageUrl()`, `normalizePath()` — únicas funciones que construyen estas rutas. Las rutas dinámicas correspondientes (`/[category]`, `/[category]/[post]`, `/[slug]`) no existen todavía (Fase 7).
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

## Los cuatro roles de la base de datos en desarrollo

Ver `README.md` — "Los cuatro roles de la base de datos en este proyecto": base de desarrollo local (push-managed) / migraciones versionadas en `src/payload/migrations/` / verificación de la cadena de migraciones en una base desechable / orquestación de migraciones en producción-CI (Fase 10). Este documento no repite esa distinción; solo referencia el flujo cuando el DAL o el schema cambian.

## Fuera de alcance de esta Fase

Rutas de Categoría/Artículo/Page genérica, `PageBlockRenderer` (Fase 7), Draft Mode, resolución de Redirects, revalidación por tags, metadata/JSON-LD, sitemap/robots, búsqueda, almacenamiento de objetos en producción, orquestación de migraciones en CI/producción (Fase 8/10/11).
