# 60 Segundos Noticias — Frontend Architecture (Fase 5)

Este documento describe cómo se implementó el acceso a datos y el site shell público (`openspec/changes/public-frontend-core/`). Los requisitos de producto viven en `docs/60-segundos-spec.md` §32/§37-40; este archivo documenta convenciones de implementación.

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

- `posts.ts`: `getLatestPosts()` — único query de Posts con consumidor real en esta change (`depth: 1`, `select: { content: false }` para no cargar el documento Lexical completo en listados, orden `-publishedAt`). `getPostBySlug()`/`getPostsByCategory()` no se implementaron — sus consumidores son las páginas de Artículo/Categoría, Fase 7.
- `categories.ts`: `getCategoriesForNavigation()` — filtra `showInNavigation: true`. `getCategoryBySlug()` no se implementó por la misma razón (consumidor es la página de Categoría, Fase 7).
- `pages.ts`: no existe — su único consumidor (la página de Page genérica) es Fase 7.
- `navigation.ts` / `footer.ts` / `settings.ts`: `getNavigation()`/`getFooter()`/`getSettings()`, leen los Globals homónimos con `depth: 1`.

## View Models (`src/lib/view-models/`)

Normalizan documentos/relaciones de Payload hacia los contratos frontend de Fase 4 (`ArticleCardData`, `CategoryCardData`) y nuevos:

- `media.ts` — `mapMediaToMediaData()`: selecciona el tamaño de imagen generado apropiado al contexto (`card`/`tablet`, nunca `hero` para tarjetas — AC-MEDIA-004), maneja Media ausente.
- `author.ts` — `mapUserToAuthorSummary()`: **allowlist explícito** (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`). `email`/`role`/`active`/campos de auth nunca se copian — verificado en tiempo de ejecución contra un `User` real con esos campos poblados.
- `category-card.ts` — `mapCategoryToCategoryCardData()`: preserva `colorTheme`/`icon` tal cual (ya tipados como unions controladas por Payload).
- `article-card.ts` — `mapPostToArticleCardData()`: requiere `primaryCategory` poblado (`depth >= 1`); devuelve `undefined` si no lo está, en vez de construir un `href` inválido.

## URLs (`src/lib/url/`)

- `canonical.ts`: `getCategoryUrl()`, `getPostUrl()`, `getPageUrl()`, `normalizePath()` — únicas funciones que construyen estas rutas. Las rutas dinámicas correspondientes (`/[category]`, `/[category]/[post]`, `/[slug]`) no existen todavía (Fase 7).
- `resolve-link.ts`: `resolveLink()`/`resolveLinks()`/`resolveNavItems()` resuelven el "modelo reutilizable de enlace" (Master Spec §27/§28 — Navigation items y Footer links/legalLinks comparten el mismo shape `label/type/category/page/url/openInNewTab`, ver `src/payload/fields/link-fields.ts`). Un enlace `external` solo se resuelve si su URL empieza con `http://`/`https://` (allowlist, no denylist — así `javascript:`/`data:` nunca pasan, AC-SEC-007).

## Fechas

`src/lib/format/date.ts` centraliza `Intl.DateTimeFormat('es-MX', ...)`. Ningún componente instancia su propio formatter.

## Site shell (`src/components/site/`)

`Header` y `Footer` son Server Components presentacionales — reciben todo por props, no importan Payload. `src/app/(frontend)/layout.tsx` es el único punto que llama al DAL para el shell (Navigation/Footer/SiteSettings en paralelo vía `Promise.all`) y le pasa los datos ya resueltos.

`MobileNav` (`src/components/site/mobile-nav.tsx`) es el único Client Component (`'use client'`) de esta change — acotado a la interacción de apertura/cierre del menú móvil, usando el primitivo shadcn `Sheet` (primer consumidor real; instalación incremental, sin dependencias nuevas — `Sheet` se apoya en `radix-ui`, ya instalado). Escape-to-close, focus trap y scroll lock del fondo son comportamiento propio de Radix Dialog (que `Sheet` envuelve), no código propio.

### Next.js 16 y contenido administrable

`src/app/(frontend)/layout.tsx` declara `export const dynamic = 'force-dynamic'`. Sin esto, Next.js 16 pre-renderiza `/` estáticamente en build time, horneando Navigation/Footer/SiteSettings en un snapshot fijo hasta el siguiente rebuild — contradiciendo "administrable sin cambio de código" (AC-NAV-004, AC-FOOT-001/002). Esta es la postura de caché más pequeña posible (sin caché, siempre fetch fresco); Fase 8 puede añadir revalidación por tags encima sin conflicto.

## Fuera de alcance de esta Fase

Home Global/Dynamic Home Builder (Fase 6), rutas de Categoría/Artículo/Page genérica (Fase 7), Draft Mode, resolución de Redirects, revalidación por tags, metadata/JSON-LD, sitemap/robots, búsqueda, almacenamiento de objetos en producción (Fase 8/10/11).
