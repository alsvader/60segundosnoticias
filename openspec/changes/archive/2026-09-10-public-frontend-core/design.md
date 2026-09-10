## Context

Ver `proposal.md` - Why. Estado actual confirmado por inspección directa (Fases 0-4 archivadas):

- `payload.config.ts` tiene `globals: []` — no existe ningún Global. `collections: [Users, Media, Categories, Tags, Posts, Pages, Redirects]`.
- No existe ningún `getPayload()` en el repo. El único código que importa `@payload-config` es el generado automáticamente por Payload (`src/app/(payload)/layout.tsx`, `.../api/[...slug]/route.ts`, `.../api/graphql*`) — ninguno es reutilizable como patrón de aplicación.
- `Posts.access.read` (anónimo) ya devuelve `{ _status: { equals: 'published' } }`; `Pages.access.read` (anónimo) el mismo patrón. `Categories`/`Tags`/`Media` tienen `read: () => true`. `Users` tiene `read: () => true` a nivel de Collection con campos sensibles (`email`, `role`, `active`) protegidos por `access.read` a nivel de campo.
- `payload-types.ts` genera cada relación como unión `(number | null) | <Tipo>` — depende de la profundidad de consulta que el campo llegue como ID o como objeto poblado.
- `src/lib/` hoy solo tiene `constants/`, `editorial/category-theme.ts`, `env/` (carga de variables, no un accessor de Payload) y `utils.ts`.
- `src/app/(frontend)/` tiene `layout.tsx` (fuentes + `globals.css`), `page.tsx` (boilerplate Fase 4: título + lead + Button dentro de `Container`), `fonts.ts`. Ningún archivo declara `'use client'`.
- Los 8 componentes editoriales de Fase 4 (`ArticleCard`, `CategoryCard`, etc.) están construidos y no tienen consumidor con datos reales.
- `tsconfig.json` ya registra el alias `@payload-config` (usado por el código generado de Payload) — es el mismo import que el nuevo `getPayload()` centralizado usará.

## Goals / Non-Goals

**Goals:**
- Un único punto de acceso público a Payload donde `overrideAccess: false` es estructuralmente imposible de evitar para código público.
- DAL y view models como capas separadas y delgadas, cada una con responsabilidad propia (no un wrapper genérico de una línea).
- Header/Footer/navegación móvil funcionando con datos reales de los nuevos Globals, sin que ningún componente de UI importe Payload.
- Cero dependencias nuevas de runtime.

**Non-Goals:**
- No se implementa el Global `Home` ni Dynamic Home Builder (Fase 6).
- No se implementan las rutas `/[category]`, `/[category]/[post]`, `/[slug]` (Fase 7).
- No se implementa Draft Mode, resolución de Redirects, revalidación por tags, metadata/JSON-LD, sitemap/robots, búsqueda (Fase 8+).
- No se decide aquí el árbol de bloques dinámicos de Home — eso es diseño de Fase 6.

## Decisions

### D1: `getPayload()` centralizado en `src/lib/payload/get-payload.ts`
Un único módulo exporta una función `getPayload()` que importa `config` desde `@payload-config` (el mismo alias que el código generado de Payload ya usa) y llama a `getPayload({ config })` de la librería `payload`, cacheando la promesa de inicialización dentro del mismo módulo (patrón estándar de Payload 3.x + Next.js: `getPayload()` ya memoiza internamente por config, así que el módulo no necesita su propio cache adicional — solo centraliza el import y evita que cada archivo del DAL repita `import config from '@payload-config'`).

Alternativa considerada: dejar que cada archivo del DAL importe `@payload-config` y llame `getPayload()` directamente. Rechazada — duplica el import en cada archivo del DAL sin ganar nada, y dificulta un futuro cambio (por ejemplo, envolver la inicialización con instrumentación) si no hay un único punto.

### D2: Helper de acceso público — la decisión de seguridad central
`src/lib/data/public-query.ts` (nombre tentativo) expone únicamente funciones con nombre concreto por operación pública — por ejemplo `findPublished<T>(collection, args)` y `findOnePublished<T>(collection, args)` — que internamente siempre llaman a Payload con `overrideAccess: false` **hardcodeado, no parametrizado**. Estas funciones no aceptan ningún argumento que permita cambiar `overrideAccess`. Para Posts/Pages, además inyectan `_status: { equals: 'published' }` en el `where` recibido (merge, no reemplazo), como defensa en profundidad independiente del control de acceso de la Collection.

Un futuro acceso de preview/admin (Fase 8, Draft Mode) NO SHALL extender este mismo helper con un flag — usará un módulo/función distinta y explícitamente nombrada (por ejemplo `findForPreview()`), de modo que revisar el código del DAL público basta para confirmar que nunca puede ver drafts, sin tener que rastrear el valor de un parámetro en cada call site.

Alternativa considerada: una función `find(collection, args, { overrideAccess })` con el flag como parámetro opcional (default `false`). Rechazada explícitamente por el usuario — un parámetro booleano en una función pública es exactamente el tipo de superficie que un cambio futuro descuidado puede voltear a `true`; una función separada para el caso confiable no tiene ese riesgo porque cambiar de una a otra es una decisión visible en el call site, no un argumento que pueda quedar en `true` por defecto de copy-paste.

### D3: `src/lib/data/` (DAL) y `src/lib/view-models/` (normalización) como capas separadas
`src/lib/data/{posts,categories,pages,navigation,footer,settings}.ts` — cada uno usa el helper de D2, aplica las convenciones de orden/profundidad/proyección (D4), y devuelve tipos de Payload (`Post`, `Category`, etc.) o construcciones cercanas a ellos — nunca los contratos frontend directamente.
`src/lib/view-models/{article-card,category-card,author,media,link}.ts` — reciben la salida del DAL y producen `ArticleCardData`/`CategoryCardData`/`AuthorSummary`/`MediaData`/`ResolvedLink`.

Alternativa considerada: co-ubicar mapper y query en el mismo archivo de `src/lib/data/`. Rechazada por el usuario — mantener la normalización en su propia capa deja más claro dónde se aplica la regla "nunca exponer campos privados de Users" (D del punto de vista de seguridad, no solo de organización), y permite que Fase 6/7 reutilicen los mismos mappers sobre queries distintas sin duplicar la lógica de normalización.

### D4: Profundidad y proyección de consultas
Las consultas de listado de Posts (para `ArticleCard`) usan `depth: 1` — suficiente para que `featuredImage`, `primaryCategory` y `author` lleguen poblados como objetos, sin poblar relaciones anidadas dentro de esos objetos (por ejemplo, no se necesita poblar la `image` de la `Category` poblada). Se evalúa en implementación si la versión instalada de Payload (3.87.1) soporta `select` para excluir `content` explícitamente en estas consultas; si no aporta una mejora medible sobre simplemente no usarlo en el tipo de retorno, no se fuerza su uso solo por principio.

### D5: Globals — schema y acceso
Campos por Global, tomados literalmente de Master Spec §27-29:

- **Navigation**: `logo` (upload), `items[]` (`label`, `type: category|page|external`, `category` relationship, `page` relationship, `url`, `openInNewTab`, `children[]` mismo shape sin anidar más de un nivel), `socialLinks` (reutiliza `socialLinksField`), `CTA` (label + link).
- **Footer**: `logo`, `description`, `columns[]` (`title`, `links[]`), `socialLinks`, `legalLinks[]`, `copyright`.
- **SiteSettings**: Branding (`siteName`, `tagline`, `logo`, `logoDark` opcional, `favicon`), Contact (`publicEmail`, `phone`, `whatsapp`), Social (`facebook`, `instagram`, `x`, `youtube`, `tiktok`), SEO (`defaultMetaTitle`, `defaultMetaDescription`, `defaultMetaImage`, `siteURL`), Organization (`organizationName`, `organizationLogo`).

Acceso (los tres Globals, mismo patrón): `read: () => true` (deben ser legibles públicamente para que el shell funcione sin autenticación) y `update: isAdmin` (reutilizando `src/payload/access/roles.ts`, sin rol `editor` — consistente con Fase 3). Ningún campo operativo/secreto (credenciales, tokens, configuración interna de infraestructura) se agrega a `SiteSettings` — todo lo que contiene es información ya pensada para ser pública (branding, contacto, redes, SEO por defecto).

### D6: Helpers de URL en `src/lib/url/`
Funciones puras, sin import de Payload ni de React: `getCategoryUrl(categorySlug)`, `getPostUrl(primaryCategorySlug, postSlug)`, `getPageUrl(pageSlug)`, `resolveLink(item)`, `normalizePath(path)`. `resolveLink()` centraliza la lógica de "¿este NavigationItem es category/page/external?" para que `Header`/`Footer` no dupliquen ese switch.

### D7: Formato de fecha en `src/lib/format/date.ts`
Una función (`formatPublishedDate` o similar) sobre `Intl.DateTimeFormat('es-MX', {...})`, invocada desde los view models (D3), nunca desde un componente.

### D8: Header/Footer/navegación móvil
`Header` y `Footer` son Server Components presentacionales (`src/components/site/header.tsx`, `footer.tsx`), reciben `NavigationItem[]`/`FooterData`/`SiteSettingsSummary` ya resueltos por la página/layout que los compone. El menú móvil es un Client Component acotado (`src/components/site/mobile-nav.tsx`, usa `shadcn` `Sheet` — primer consumidor real que justifica instalarlo, consistente con la política de instalación incremental de Fase 4) que solo maneja apertura/cierre/foco/Escape; recibe los mismos `NavigationItem[]` ya resueltos, no vuelve a consultar nada.

### D9: `/` se adapta al shell, no se convierte en Home
`src/app/(frontend)/page.tsx` se recompone dentro del nuevo `layout.tsx` (que ahora renderiza `Header`/`Footer` alrededor de `{children}`), conservando el mismo contenido boilerplate mínimo (o una versión ligeramente ajustada), sin agregar bloques, Posts o Categorías reales como contenido de la página. Cualquier verificación en tiempo de ejecución de `mapPostToArticleCardData`/`mapCategoryToCategoryCardData` con datos reales se hace vía una página de desarrollo temporal (mismo patrón que Fase 4: se documenta en tasks.md, se elimina antes de archivar) o pruebas, nunca dejando ese contenido en `/`.

### D10: `export const dynamic = 'force-dynamic'` en el layout público (descubierto en implementación)
`pnpm build` reveló que Next.js 16 intenta pre-renderizar estáticamente `/` en build time por defecto, lo que horneaba Navigation/Footer/SiteSettings en un snapshot fijo hasta el siguiente rebuild — contradiciendo directamente AC-NAV-004/AC-FOOT-001/002 ("administrable sin cambio de código"). Se agregó `export const dynamic = 'force-dynamic'` en `src/app/(frontend)/layout.tsx`, la postura de caché más pequeña posible (sin caché alguna, siempre fetch fresco) — no implementa ni anticipa la revalidación por tags de Fase 8, solo evita que el comportamiento por defecto de Next.js 16 horneé contenido del CMS de forma silenciosa e inesperada (riesgo identificado explícitamente en la exploración de Fase 5, §21).

### D11: `select` en `findPublished()`/`findOnePublished()` (agregado en la ronda de `/opsx:verify`)
D4 dejó pendiente "evaluar si Payload soporta `select`"; la evaluación nunca se hizo y `getLatestPosts()` quedó cargando el campo `content` (Lexical) completo en cada listado, incumpliendo el propio requirement de `frontend-data-access`. Se agregó `select?: TSelect` a `FindPublishedArgs`, tipado como `TSelect extends TypedCollectionSelect[TSlug]` — `TypedCollectionSelect` es el tipo que Payload expone públicamente desde el paquete `payload` (a diferencia de `SelectFromCollectionSlug`, que no está re-exportado; confirmado por error de `tsc` al intentar importarlo) y que `payload-types.ts` puebla vía `declare module 'payload'`, así que es exactamente el mismo tipo que usa `payload.find()` internamente — no una aproximación. `getLatestPosts()` ahora pasa `select: { content: false }`. El modo "exclusión" de Payload (cualquier valor `false` hace que se devuelvan todos los demás campos) se confirmó leyendo `node_modules/payload/dist/utilities/getSelectMode.js` de la versión instalada (3.87.1), y se verificó en tiempo de ejecución: la respuesta de `getLatestPosts()` no tiene la propiedad `content`, pero sí `title`/`excerpt`/etc. `select` es puramente de proyección de campos — no interactúa con `overrideAccess`, que sigue hardcodeado en `false` (D2 no cambia).

Alternativa considerada: seguir sin `select` y aceptar la sobre-consulta. Rechazada — el requirement ya existía explícitamente en `frontend-data-access/spec.md` desde la primera versión de esta change; no implementarlo era dejar un requirement incumplido, no una decisión de diseño.

## Risks / Trade-offs

- **[Riesgo] Que una función pública del DAL termine con `overrideAccess: true` por copy-paste** → Mitigado por D2: la función pública ni siquiera acepta ese parámetro; cambiarlo requiere escribir una función nueva y nombrarla de forma distinta, un cambio visible en revisión de código.
- **[Riesgo] Sobre-poblar relaciones y filtrar campos privados de Users por accidente en depth alto** → Mitigado por D3/D4: el mapper de `AuthorSummary` es el único lugar que decide qué campos de `User` cruzan hacia el frontend, independientemente de cuántos campos vengan poblados desde el DAL.
- **[Riesgo] Que `/` se convierta silenciosamente en un Home parcial** → Mitigado por D9 y por la tarea de verificación explícita en tasks.md que confirma que `page.tsx` no contiene bloques/Posts/Categorías reales como contenido.
- **[Trade-off] Un solo nivel de profundidad para `children[]` de Navigation** → El Master Spec solo pide soportar un item tipo "Más" con `children[]`, no submenús arbitrariamente anidados; limitar a un nivel evita complejidad de UI (mobile) no solicitada.

## Migration Plan

1. Crear los tres Globals en `payload.config.ts` y correr `payload generate:types` para que `payload-types.ts` incluya `Navigation`/`Footer`/`SiteSettings`.
2. Crear `getPayload()` y el helper de acceso público (D1/D2) antes que cualquier función del DAL.
3. Implementar el DAL (D3/D4) collection por collection/global por global.
4. Implementar los view models (D3), helpers de URL (D6) y formato de fecha (D7).
5. Implementar `Header`/`Footer`/navegación móvil (D8) y recomponer el layout/`/` (D9).
6. Verificar en tiempo de ejecución que una consulta pública nunca devuelve un Draft (dato real: crear un Draft de prueba, confirmar que el DAL público no lo retorna).
7. Sin rollback especial — aditivo sobre un frontend que hoy es boilerplate.
