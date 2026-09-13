## Why

El sitio público no tiene forma de buscar contenido: `/buscar` está reservado desde Fase 2 (`RESERVED_SLUGS`) pero no existe ninguna ruta, DAL ni UI detrás de él. Fase 9 del Master Spec (`docs/60-segundos-spec.md` §36) implementa esa búsqueda usando el Payload Search Plugin (`@payloadcms/plugin-search`) sobre la infraestructura PostgreSQL ya existente, sin introducir un servicio de búsqueda externo.

## What Changes

- Se agrega `@payloadcms/plugin-search@3.87.1` a `payload.config.ts`, indexando **Posts** y **Pages** publicados en una Collection `search` dedicada (`syncDrafts: false`, `deleteDrafts: true`).
- Se deriva texto plano acotado para búsqueda vía `beforeSync`, reutilizando y corrigiendo `extractLexicalText()` (`src/payload/hooks/lib/lexical-text.ts`) para Posts/RichText, y un nuevo extractor para los campos de texto de los demás Page Blocks (Hero/ImageText/CTA/FAQ/Banner).
- Se agrega una migración (`pnpm migrate:create`) para el schema nuevo de la Collection `search`.
- Se crea el DAL público `searchContent()` (`src/lib/data/search.ts`), server-side, sin cache (primera lectura deliberadamente dinámica del proyecto), y el view model `SearchResult`/`SearchResultPage` (`src/lib/view-models/search.ts`).
- Se crea la ruta pública `/buscar?q=...&page=N` (`src/app/(frontend)/buscar/page.tsx`): formulario GET progresivo, lista de resultados reutilizando `ArticleCardData`/`ArticleCard` y `Pagination`, estado vacío, metadata `noindex`.
- Se define el acceso de la Collection `search`: `create`/`update`/`delete` solo Admin (necesario para la acción de Reindex del propio plugin); `read` público, consistente con `Categories`/`Media`.
- Se documenta el procedimiento de reindexación inicial/bajo demanda tras el despliegue (manual, vía Admin UI del plugin — no automático en el arranque).
- **Categories NO se indexan como documentos de Search independientes** — su `name`/`slug` solo participan dentro del registro de Search de un Post, vía `primaryCategory`.
- Fuera de alcance: servicio de búsqueda externo (Algolia/Elasticsearch/OpenSearch/Meilisearch/Typesense), ranking semántico/vectorial/IA, autocomplete, sugerencias, historial, analítica de búsqueda, tolerancia a errores tipográficos/acentos (limitación V1 documentada, no resuelta), rutas de Tag/Author, y automatización de reindex en producción (Fase 10).

## Capabilities

### New Capabilities
- `search-index`: configuración del Payload Search Plugin, collections/campos indexados, extracción de texto (`beforeSync`), política de drafts, ciclo de vida de reindexación, migración.
- `public-search`: ruta `/buscar`, DAL/view model público, semántica de query/paginación, UI, accesibilidad, SEO/cache de la ruta de búsqueda.

### Modified Capabilities
(ninguna — Fase 9 no cambia el comportamiento ya especificado de ninguna capability existente)

## Impact

- `payload.config.ts`: registro del plugin.
- Nuevo `src/payload/plugins/search.ts` (primera convención de módulo de plugin en el proyecto).
- `src/payload/hooks/lib/lexical-text.ts`: corrección del gap de captions de `GalleryBlock`.
- Nuevo extractor de texto para Page Blocks no-Lexical.
- `src/payload/migrations/`: nueva migración + snapshot.
- `src/payload-types.ts`: regenerado (`pnpm generate:types`) para incluir la Collection `search`.
- Nuevos: `src/lib/data/search.ts`, `src/lib/view-models/search.ts`, `src/app/(frontend)/buscar/page.tsx`.
- `package.json`: nueva dependencia `@payloadcms/plugin-search@3.87.1`.
- Documentación: `docs/FRONTEND-ARCHITECTURE.md` y un `docs/SEARCH.md` nuevo (política de drafts, runbook de reindex, limitación de acentos).
