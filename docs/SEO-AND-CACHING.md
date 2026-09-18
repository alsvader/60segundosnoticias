# 60 Segundos Noticias — Preview, SEO, Cache y Redirects (Fase 8)

Este documento describe la implementación de `openspec/changes/preview-seo-cache-redirects/` (Master Spec §17, §30.6-30.10, §31, §40, §41, §42). Los requisitos de producto viven en `docs/60-segundos-spec.md`; este archivo documenta convenciones de implementación.

Versión instalada relevante: Next.js 16.3.3 **sin** `cacheComponents` habilitado (modelo de cache "legacy": `unstable_cache`/`revalidateTag`, no `use cache`/`cacheTag`). Payload 3.87.1.

## Origen canónico

`getSiteOrigin()`/`getAbsoluteUrl()` (`src/lib/url/canonical.ts`) son la única fuente de URLs absolutas. Leen `process.env.NEXT_PUBLIC_SITE_URL` directamente (no el módulo `env` guardado con `server-only`): en producción, ausente/inválido lanza un error explícito; en desarrollo cae a `http://localhost:3000`.

Todo el módulo `canonical.ts` es deliberadamente **sin** `import 'server-only'` — los hooks de creación de redirects (`src/lib/redirects/create-historical-redirect.ts` y los hooks que lo invocan) usan sus helpers de ruta relativa (`getPostUrl`/`getCategoryUrl`/`getPageUrl`/`normalizePath`), y esos hooks se cargan por `payload.config.ts` bajo la CLI standalone de Payload (`payload run`/`migrate`/`generate:types`), fuera del bundler de Next.js — el mismo motivo por el que `src/lib/env/payload.ts` existe como duplicado sin guardia del módulo `env` de la app.

## Metadata (`src/lib/seo/metadata.ts`)

Cadena de fallback (§41): `seo` del documento → contenido del documento → `SiteSettings.seo`. `buildMetadata()` (Home/Category/Page, OpenGraph `type: 'website'`) y `buildArticleMetadata()` (Article, `type: 'article'` con `publishedTime`/`modifiedTime`/`authors`).

- **Home** (`src/app/(frontend)/page.tsx`): fallback title = `siteName`; fallback description = `branding.tagline`.
- **Category** (`src/app/(frontend)/[category]/page.tsx`): fallback title literal `"{name} | 60 Segundos"` (§41.2); fallback description = `Category.description`.
- **Page**: fallback description/image tomados del primer block `Hero` del `layout`, si existe.
- **Article** (`src/app/(frontend)/[category]/[post]/page.tsx`): canonical siempre construido con la `primaryCategory` real del Post, nunca la categoría de la URL solicitada.

`generateMetadata` y el render de la página comparten la misma llamada de datos por request vía React `cache()` — envuelto sobre un argumento primitivo (`slug`), no un objeto literal, para que la memoización funcione de forma confiable.

Imágenes OG: Payload devuelve URLs relativas en desarrollo (`/api/media/file/...`) y puede devolver absolutas en producción (URL pública de S3) — `toAbsoluteMediaUrl()` normaliza ambos casos.

## Structured data (`src/lib/seo/json-ld.tsx`)

`JsonLd` serializa con `JSON.stringify` + escape de `<` antes de `dangerouslySetInnerHTML` — la única forma correcta de embeber JSON-LD en React (un `<script>` con hijos de texto normales sería escapado por React, corrompiendo el JSON).

- **Home**: `Organization` + `WebSite`, desde `resolveOrganizationInfo(settings)` (`SiteSettings.organization`, con fallback a `branding`).
- **Article**: `NewsArticle` + `BreadcrumbList`. El autor en el JSON-LD usa únicamente el `AuthorSummary` público (`displayName`/`slug`/`avatar`/`bio`) — nunca el `User` crudo.
- **Category**: `BreadcrumbList`, coincide con el breadcrumb visual ya renderizado.

## sitemap.xml / robots.txt

`src/app/sitemap.ts` y `src/app/robots.ts` — en la raíz de `app/`, no dentro de `(frontend)/` (son convenciones de archivo globales, los route groups no cambian esto pero tampoco aportan nada aquí).

- **sitemap**: Home + Categories + Pages publicadas + Posts publicados (URL con `primaryCategory`). Proyecciones estrechas nuevas: `getPublishedPostsForSitemap()`/`getPublishedPagesForSitemap()`.
- **robots**: producción permite indexación y referencia el sitemap; no-producción (`NODE_ENV !== 'production'`) bloquea todo — sin variable de entorno nueva. Sin reglas por user-agent de crawler de IA (política neutral). `/llms.txt` nunca se bloquea.

## Preview / Draft Mode

Flujo: Admin de Payload → botón Preview (`admin.preview`, `src/lib/preview/generate-preview-url.ts`) → `/api/preview?secret=...&collection=...&id=...` → valida `PREVIEW_SECRET` → resuelve el documento con la sesión Payload autenticada (`src/lib/preview/resolve-preview-document.ts`, `payload.auth({headers})` + `overrideAccess: false`, nunca `true`) → calcula el destino desde el documento ya resuelto (`getPostUrl`/`getPageUrl`/`/`, nunca de un parámetro de la solicitud) → `draftMode().enable()` → redirige. `/api/preview-exit` deshabilita Draft Mode.

Categories no tienen Preview (sin `versions`). La autorización de quién puede previsualizar qué está completamente delegada al `access.read` ya existente de Posts/Pages (Admin ve cualquiera; Writer ve publicado o propio) — ninguna lógica de ownership se duplicó.

`generatePostPreviewURL`/`generatePagePreviewURL`/`generateHomePreviewURL` viven fuera de `server-only`: son parte de la config de Collection/Global, cargada también por la CLI de Payload.

**Indicador visible de Draft Mode**: `(frontend)/layout.tsx` lee `draftMode()` (además de para las páginas que ya lo necesitaban para resolver el documento en Draft) y, si `isEnabled`, renderiza `DraftModeBanner` (`src/components/site/draft-mode-banner.tsx`) antes del skip-link — franja estática (no `fixed`), Server Component sin JS de cliente, con el token semántico `warning` y un enlace directo a `/api/preview-exit`. Existe porque `/api/preview-exit` (Fase 8) no estaba enlazado en ningún punto del frontend público: sin este indicador, cerrar la pestaña o la sesión de Payload Admin dejaba Draft Mode activo sin que quien navegara después el sitio en ese mismo navegador tuviera forma de notarlo o salir sin conocer la ruta de memoria. El cierre automático de Draft Mode al cerrar pestaña/sesión sigue sin implementarse — es un problema distinto (cookie de sesión de Next.js vs. cookie de auth de Payload, no enganchadas entre sí).

**Contenido en Draft consciente en el render real**: habilitar Draft Mode solo hace bypass de `fetch`/`unstable_cache` - no le dice a Payload que debe devolver la versión en Draft. Home/Article/`[slug]` (Page) verifican `draftMode().isEnabled` y, si está habilitado, resuelven el documento vía `src/lib/preview/draft-documents.ts` (`findDraftHome()`/`findDraftPostBySlug()`/`findDraftPageBySlug()` - `draft: true` + `overrideAccess: false` + usuario de la sesión) en vez de la función pública del DAL. `canViewDraftRevision()` (`src/lib/preview/authorize-draft-content.ts`) es una defensa en profundidad explícita: solo el autor de un Post o un Admin pueden ver el contenido de una revisión en Draft de un Post ya publicado (verificado en vivo que Payload ya lo resuelve así por sí solo; esto lo hace explícito y verificable en código).

`PREVIEW_SECRET` se pasa al contenedor `app` vía `compose.yaml` (agregado en Fase 8 — antes solo estaba documentada en `.env.example`, sin reenviarse).

## Cache y revalidación

Esquema de tags (`src/lib/cache/tags.ts`): `post:{id|slug}`, `category:{id|slug}`, `page:{id|slug}`, `posts`, `categories`, `home`, `navigation`, `footer`, `settings`, `article-sidebar`, `sitemap`, `llms`. `getPostBySlug()`/`getCategoryBySlug()`/`getPageBySlug()` — las únicas consultas que resuelven por slug público en vez de por id — se tagean por `slug`, no por `id`: el id no se conoce hasta que la consulta resuelve.

Invalidación (`src/lib/cache/invalidate.ts`): `revalidateTag(tag, { expire: 0 })` — no la forma de un solo argumento (deprecada en 16.3.3) ni `profile: 'max'` (semántica stale-while-revalidate, no coincide con "Publish deja el contenido accesible de inmediato", §30.4). Cada llamada está envuelta en un `try/catch` que registra el error sin relanzarlo (AC-ERR-003).

Hooks `afterChange`/`afterDelete` por Collection/Global en `src/payload/hooks/*/cache-invalidation.ts`. Posts/Pages/Home branchean draft-vs-published (`previousDoc._status`/`doc._status`) — un guardado que nunca hizo público el documento no invalida nada. `src/lib/cache/references.ts` determina si un Post afecta Home (bloques manuales `HeroNews`/`FeaturedPosts`/`VideoFeature`) o si un Category/Page afecta Navigation/Footer (solo el `slug` de esos documentos se embebe en los enlaces resueltos) antes de invalidar esos tags — nunca incondicionalmente.

`export const dynamic = 'force-dynamic'` (Fase 5) se removió de `(frontend)/layout.tsx` una vez verificada la invalidación, y volvió en Fase 11 (`openspec/changes/runtime-public-rendering`) - también en `src/app/sitemap.ts` - por una razón distinta: `next build` intenta generar `/`, `/buscar` y `/sitemap.xml` de forma estática por defecto, y esa generación ejecuta las mismas consultas a Payload que fallan sin una base de datos alcanzable en build time (invariante de Fase 10, `docker build --target runner` no debe requerir Postgres). Esto no reinstaura la postura sin-cache de Fase 5: es un límite de modo de render (Full Route Cache), independiente del Data Cache que `unstable_cache` sigue gestionando exactamente igual - verificado en vivo (miss → hit → `revalidateTag` → fresh) contra un build de producción real.

## Matriz de invalidación

| Cambio | Tags invalidados |
|---|---|
| Post publish/update | `post:{id,slug}`, `posts`, `category:{id}` de cada categoría (primaria + adicionales), `sitemap`, `llms`; `home` solo si el Post está referenciado por un bloque manual de Home |
| Category (campo) | `category:{id,slug}`, `categories`, `sitemap`, `llms`; `navigation` solo si referenciada ahí |
| Category (slug) | además, `post:{id}`/`posts` de cada Post publicado afectado |
| Page publish/update | `page:{id,slug}`, `sitemap`, `llms`; `navigation`/`footer` solo si referenciada ahí |
| Home | `home` únicamente |
| Navigation / Footer / ArticleSidebar | su propio tag únicamente |
| SiteSettings | `settings` siempre; `llms` solo si cambió `branding`/`seo` (`sitemap.xml` no lee ningún campo de SiteSettings) |

## Redirects

- **Lookup en runtime** (`src/lib/data/redirects.ts`, `findActiveRedirectByPath()`): server-only, `overrideAccess: true` acotado y aislado (excepción explícita al boundary público del DAL — `Redirects.access.read` permanece `isAdmin`-only, sin cambios). Integrado en los dos miss paths existentes — `resolveRootSlug()` (`src/lib/content/resolve-root-slug.ts`, nuevo caso `'redirect'`) y la búsqueda de Post por slug (`[category]/[post]/page.tsx`) — nunca antes de que la resolución normal ya falle, así que una ruta vigente nunca es eclipsada.
- **Emisión del status code**: Server Components solo pueden emitir 307 (`redirect()`) o 308 (`permanentRedirect()`) — un 301/302 literal solo es alcanzable desde un Route Handler/Middleware. `301` (almacenado) → `permanentRedirect` (308); `302` → `redirect` (307). Ver `src/lib/redirects/apply-redirect.ts`.
- **Generación automática** (`src/lib/redirects/create-historical-redirect.ts`, invocado desde hooks `afterChange` de Posts/Categories/Pages): cambio de `slug`/`primaryCategory` de un Post publicado, `slug` de una Category (cascadeando a cada Post publicado afectado), `slug` de una Page publicada. Nunca en `delete`.
- **Aplanado de cadenas y ciclos**: al crear `A → B`, si `B` ya es el `from` de un redirect activo, se seguye la cadena hasta el destino final (acotado a 5 saltos). Si la cadena lleva de vuelta al propio origen (un ciclo — típicamente una URL que cambió y volvió a su valor original), los redirects recorridos se **desactivan** (`active: false`, nunca se eliminan) y se crea el redirect con el destino solicitado originalmente. Aplanado hacia atrás: cualquier redirect activo que ya apuntaba al origen que está por convertirse en un nuevo origen se repunta directo al destino final.

## `/llms.txt`

`src/app/llms.txt/route.ts` + `src/lib/seo/llms-txt.ts` (LLM / Agent Discoverability — nunca "AI SEO", nunca garantiza ranking/citación/entrenamiento). Estructura v2 (H1/blockquote/secciones H2 de enlaces): identidad del sitio, Categorías, hasta 25 Posts publicados recientes (título + extracto + URL canónica), Pages publicadas. Proyecciones estrechas nuevas (`getPublishedPostsForLlms()`/`getPublishedPagesForLlms()`) — nunca cargan `content` Lexical. Caracteres con significado en Markdown (`[`, `]`, `(`, `)`, saltos de línea) se escapan/colapsan antes de interpolar.

`Content-Type: text/markdown; charset=utf-8`. Envuelto en `unstable_cache` con tag `llms` — ya cubierto por los hooks de invalidación de Posts/Categories/Pages/SiteSettings.

El layout público raíz anuncia el documento con `<link rel="describedby" href="/llms.txt" type="text/markdown" />` — la API de Metadata tipada de Next.js no modela esta relación (`alternates` solo cubre `canonical`/`languages`/`media`/`types`), así que se usa el `<head>` manual que el propio framework deja como escape hatch para esto.

Alternativas Markdown de páginas individuales (`/<category>/<post>.md`) quedan explícitamente diferidas — los 6 Article Content Blocks necesitarían un transformador Markdown propio cada uno, duplicando el trabajo ya hecho para HTML en Fase 7, sin un consumidor concreto que lo requiera hoy.

## Variables de entorno

Sin variables nuevas. `PREVIEW_SECRET` y `NEXT_PUBLIC_SITE_URL` pasan de "reservadas, aún no implementadas" a requeridas para Preview/URLs absolutas respectivamente; `REVALIDATION_SECRET` permanece sin usar (solo sería necesaria si se agrega un webhook de revalidación externo — los hooks de Payload llaman `revalidateTag` in-process y no lo necesitan).
