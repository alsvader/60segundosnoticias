## Why

El repositorio tiene la base técnica de Phase 0/1 (Next.js + Payload + PostgreSQL, sin errores de build, con Docker Compose reproducible), pero Payload no define ninguna Collection ni Global. Sin el modelo de datos editorial (Users, Media, Categories, Tags, Posts, Pages, Redirects) no existe forma de crear contenido, autenticar autores reales, ni exponer una API con control de acceso real. Este change entrega el núcleo de datos de Payload — Phase 2 del Master Spec — del que dependen todas las fases editoriales y de frontend público posteriores.

## What Changes

- Se crean las 7 Collections de V1 (`Users`, `Media`, `Categories`, `Tags`, `Posts`, `Pages`, `Redirects`) con sus campos, relaciones e índices según `docs/60-segundos-spec.md`, sin lógica de ciclo de vida editorial (eso corresponde a Phase 3).
- Se definen los 6 Article Content Blocks (`ImageBlock`, `GalleryBlock`, `VideoBlock`, `QuoteBlock`, `CalloutBlock`, `EmbedBlock`) como parte del `BlocksFeature` de Lexical usado por `Posts.content`.
- Se definen los 8 Page Blocks (`Hero`, `RichText`, `ImageText`, `Gallery`, `Video`, `CTA`, `FAQ`, `Banner`) como Payload blocks usados por `Pages.layout`, con almacenamiento relacional estándar (sin `blocksAsJSON`).
- Se crean field configs reutilizables: `seoFields`, `slugField` (forma/validación base, sin hooks de generación), `socialLinksField`.
- Se implementa control de acceso server-side base: lectura pública restringida a `_status: published` en Posts y Pages; en `Users`, los campos sensibles (`email`, `role`, `active`) nunca son públicos — solo el "public author shape" del Master Spec (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`) es legible sin autenticación; un hook mínimo de login bloquea el acceso cuando `active=false`.
- Se implementa la integridad de namespace de slugs: constante compartida de reserved slugs, validación de reserved slugs en `Categories`/`Pages`, prevención de colisión cruzada entre `Categories` y `Pages`, y slugs únicos e indexados en las Collections que lo requieren.
- Se configura el directorio de migraciones de Payload/PostgreSQL (`migrationDir`) y se genera y commitea la primera migración explícita cubriendo el schema completo de esta fase, sin configurar ejecución automática de migraciones en producción (eso es Phase 10).
- Se agrega el flujo real de generación de tipos de Payload (`payload generate:types`) como script de `package.json`, y se genera y commitea `src/payload-types.ts`.

**Modificación de comportamiento existente**: el módulo de validación de entorno (`src/lib/env/`) deja de poder cargarse únicamente dentro del runtime de Next.js — se ajusta para que `payload.config.ts` sea cargable desde el CLI de Payload (`generate:types`, `migrate:create`), que se ejecuta fuera del bundler de Next.js. Esto no es un cambio de requisito de comportamiento de la aplicación (la validación de entorno para el runtime de la app sigue igual), pero sí toca la implementación de una capability ya archivada.

Ningún cambio de esta lista es **BREAKING**: no existe implementación previa de Collections que romper, y el ajuste al módulo de entorno no cambia su contrato de validación observable.

## Capabilities

### New Capabilities

- `users-collection`: Collection `Users` (auth), con el public author shape protegido y el rol admin/writer.
- `media-collection`: Collection de upload `Media` con tamaños de imagen editoriales y restricciones MIME.
- `categories-collection`: Collection `Categories` con theme/icon controlados y campos de navegación/SEO.
- `tags-collection`: Collection `Tags` simple para taxonomía editorial.
- `posts-collection`: Collection `Posts` con relaciones, contenido Lexical con blocks, y campos SEO/editoriales estructurales.
- `pages-collection`: Collection `Pages` institucional con layout de blocks y SEO.
- `redirects-collection`: Collection `Redirects` (esquema únicamente, sin generación automática).
- `article-content-blocks`: los 6 blocks de contenido embebidos en el editor Lexical de Posts.
- `page-blocks`: los 8 blocks de layout usados por Pages.
- `cms-access-control`: reglas de acceso server-side base compartidas (lectura pública solo-publicado en Posts/Pages, escritura de Posts restringida a Admin/Writer autenticados con delete admin-only, protección de Users, bloqueo de login por cuenta inactiva).
- `slug-namespace-integrity`: reserved slugs y prevención de colisión Categories↔Pages.

### Modified Capabilities

- `environment-validation`: el módulo de validación de entorno se ajusta para ser cargable desde el CLI de Payload sin el guard `server-only`, preservando la validación existente para el runtime de la aplicación Next.js.

## Impact

- **Código nuevo**: `src/payload/collections/*` (7 collections), `src/payload/blocks/article/*` (6), `src/payload/blocks/page/*` (8), `src/payload/fields/*` (`seoFields`, `slugField`, `socialLinksField`), `src/payload/access/*`, `src/payload/hooks/*` (hook mínimo de login), `src/lib/constants/reserved-slugs.ts`, `src/payload/migrations/*` (primera migración generada).
- **Código modificado**: `payload.config.ts` (registra las 7 Collections y `migrationDir`), `src/lib/env/` (compatibilidad con el CLI de Payload), `package.json` (script `generate:types` y, si aplica, script de migración), `README.md` (al finalizar el change, con los comandos realmente implementados).
- **Dependencias nuevas**: `@payloadcms/richtext-lexical@3.87.1` (Lexical rich text + `BlocksFeature`), `sharp` (generación de tamaños de imagen de `Media`).
- **Fuera de alcance**: cualquier hook de ciclo de vida editorial (generación de slug, ownership de Writer, workflow de publish/unpublish, reading time, creación automática de redirects), Home/Navigation/Footer/SiteSettings Globals, rutas públicas de contenido, almacenamiento de objetos en producción, seeds, y el Design System editorial completo.
