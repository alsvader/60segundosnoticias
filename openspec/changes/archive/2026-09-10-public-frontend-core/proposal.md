## Why

Las Fases 0-4 dejaron el CMS y el Design System operativos, pero el frontend público (`src/app/(frontend)/`) sigue siendo boilerplate: no existe capa de acceso a datos, ningún componente del Design System (Fase 4) ha recibido datos reales de Payload, y `payload.config.ts` no define ningún Global (`globals: []`). Antes de construir Home (Fase 6) o las páginas de Categoría/Artículo (Fase 7) se necesita la infraestructura base — DAL, view models, URLs, fechas y el site shell (Header/Navigation/Footer/SiteSettings) — que esas fases consumirán.

## What Changes

- Crear una Data Access Layer (`src/lib/data/`) que envuelva Payload Local API para lectura pública server-side: Posts (por slug, últimos, por categoría), Categories (por slug, para navegación), Pages (por slug), y los nuevos Globals `Navigation`/`Footer`/`SiteSettings`.
- **Seguridad crítica**: introducir el helper de acceso público más pequeño posible que fuerce `overrideAccess: false` como comportamiento seguro por defecto en toda lectura pública, sin exponer un booleano genérico que permita a una función DAL pública cambiar a `overrideAccess: true`. Filtrar explícitamente `_status: published` en Posts/Pages como defensa adicional, incluso con `overrideAccess: false`.
- Crear una capa de view models (`src/lib/view-models/`) que normalice documentos/relaciones de Payload hacia los contratos frontend ya definidos en Fase 4 (`ArticleCardData`, `CategoryCardData`) y nuevos (`AuthorSummary`, `MediaData`, `NavigationItem`/`ResolvedLink`), exponiendo solo los campos públicos seguros de `Users` (nunca `email`/`role`/`active`).
- Crear helpers de URL centralizados (`getCategoryUrl`, `getPostUrl`, `getPageUrl`, `resolveLink`, `normalizePath`) sin implementar las rutas dinámicas que los consumirán en Fase 7.
- Crear una utilidad de formato de fecha `es-MX` centralizada sobre `Intl.DateTimeFormat`, sin dependencia nueva.
- **Añadir los Payload Globals `Navigation`, `Footer` y `SiteSettings`** (schema + access control), consumidos por el DAL. No se añade el Global `Home`.
- Construir el site shell público: `Header` (desktop + mobile mediante un Client Component acotado para el menú), `Footer`, integrados en `src/app/(frontend)/layout.tsx`, alimentados vía DAL → view model → props — nunca consultando Payload directamente desde los componentes.
- Adaptar la ruta `/` existente para renderizar dentro del nuevo shell, sin construir contenido editorial de Home.
- Mapear `Post → ArticleCardData` y `Category → CategoryCardData` con un consumidor real mínimo suficiente para verificar la arquitectura en tiempo de ejecución (no una página de Categoría/Artículo completa).

## Capabilities

### New Capabilities

- `frontend-data-access`: DAL server-side sobre Payload Local API, helper de acceso público con `overrideAccess: false` forzado, convenciones de proyección/profundidad, Globals Navigation/Footer/SiteSettings.
- `public-view-models`: normalización de documentos/relaciones de Payload hacia contratos frontend seguros (`ArticleCardData`, `CategoryCardData`, `AuthorSummary`, `MediaData`, `NavigationItem`/`ResolvedLink`), exclusión explícita de campos privados de `Users`.
- `public-url-system`: `getCategoryUrl`, `getPostUrl`, `getPageUrl`, `resolveLink`, `normalizePath`.
- `locale-formatting`: utilidad de formato de fecha `es-MX` centralizada.
- `site-shell`: Header (desktop/mobile), Footer, integración de SiteSettings, composición del layout público, adaptación de `/` al nuevo shell sin contenido de Home.
- `frontend-accessibility`: continuidad de los fundamentos de accesibilidad de Fase 4 (skip link, landmarks, foco, teclado, touch targets) dentro del Header/navegación móvil.

### Modified Capabilities

Ninguna. Las capabilities de Fase 4 (`editorial-components`, `category-theme-system`, etc.) no cambian de requisitos — esta change las consume, no las modifica.

## Impact

- `payload.config.ts`: `globals: []` → `[Navigation, Footer, SiteSettings]`.
- Nuevos: `src/payload/globals/{Navigation,Footer,SiteSettings}.ts`.
- Nuevos: `src/lib/payload/get-payload.ts` (helper `getPayload()` centralizado, primera vez que existe en el repo).
- Nuevos: `src/lib/data/{posts,categories,pages,navigation,footer,settings}.ts` + un helper de acceso público compartido.
- Nuevos: `src/lib/view-models/{article-card,category-card,author,media,link}.ts` (nombres exactos sujetos a diseño).
- Nuevos: `src/lib/url/` o similar (helpers de URL) y `src/lib/format/date.ts`.
- Nuevos: `src/components/site/{header,footer,mobile-nav}.tsx` (nombres exactos sujetos a diseño) — presentacionales, sin import de Payload.
- Modificado: `src/app/(frontend)/layout.tsx` (integra Header/Footer), `src/app/(frontend)/page.tsx` (renderiza dentro del shell, sin contenido de Home).
- Sin dependencias nuevas de runtime.
- Fuera de alcance: Home Global/Dynamic Home Builder (Fase 6), rutas de Categoría/Artículo/Page genérica (Fase 7), Draft Mode, resolución de Redirects, revalidación por tags, metadata/JSON-LD, sitemap/robots, búsqueda, almacenamiento de objetos en producción (Fase 8/10/11).
