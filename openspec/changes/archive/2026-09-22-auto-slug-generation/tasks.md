## 1. Slugify compartido

- [x] 1.1 Crear `src/lib/url/slugify.ts` con la normalización de `hooks/posts/slug-lifecycle.ts` (NFD, sin diacríticos, minúsculas, guiones) y `src/lib/url/slugify.test.ts` (acentos, `ñ`, `¿?¡!`, espacios repetidos, emojis, vacío); verificar con `pnpm test:unit`.

## 2. Campo de slug compartido

- [x] 2.1 Reescribir `src/payload/fields/slug-field.ts` sobre `slugField` de `payload` (D1): `useAsSlug`, `position: 'sidebar'`, `required`, `slugify` síncrono para el hook nativo, deduplicación `-2`, `-3` en un `beforeValidate` del campo y en `custom.slugify` del botón "Generar" (D3), y `validate` vía `overrides` que valida formato y delega en `createNamespaceSlugValidate` (D4); verificar con `pnpm typecheck`.
- [x] 2.2 Aplicar el helper en `Posts` (`title`), `Pages` (`title`, namespace `categories`), `Categories` (`name`, namespace `pages`), `Tags` (`name`) y `Users` (`displayName`, `required: false`); quitar `generateSlugFromTitle` de `Posts` y eliminar `src/payload/hooks/posts/slug-lifecycle.ts`; verificar con `pnpm typecheck` y `pnpm lint` (AC-SLUG-001, AC-SLUG-005).

## 3. Artefactos generados y migración

- [x] 3.1 `pnpm generate:types` y `pnpm payload generate:importmap`; confirmar que `@payloadcms/next/client#SlugField` está en `src/app/(payload)/admin/importMap.js` y que `pnpm test:importmap` pasa.
- [x] 3.2 `pnpm migrate:create auto_slug_generation` y agregar en `up` el `UPDATE ... SET generate_slug = false` (y `version_generate_slug` en `_posts_v`/`_pages_v`) para filas existentes (D5); verificar con `pnpm test:migrations`.

## 4. Tests de integración

- [x] 4.1 Crear `tests/integration/slug-generation.test.ts`: generación sin slug en las cinco Collections, slug estable al editar el campo fuente (incluido Post publicado), slug explícito respetado, formato inválido rechazado, sufijo `-2` por título duplicado, Page "Admin" → `admin-2`, Page con título de Category existente → sufijo, slug explícito reservado rechazado; verificar con `pnpm test:integration` (AC-SLUG-003, AC-SLUG-004, AC-ROUTE-001, AC-ROUTE-002).
- [x] 4.2 Ejecutar la suite de integración completa (`redirects`, `draft-publish`, `search`, `fixtures`, `migration-chain`, `access-control`) sin regresiones.

## 5. Verificación general

- [x] 5.1 Verificación manual en `/admin`: crear Noticia, Página, Categoría, Tag y Usuario llenando solo el campo fuente → se guarda y el slug aparece; editar el campo fuente → el slug no cambia; candado y botón "Generar" funcionan. Se verificó que el form-state no requiere tolerar el vacío y se retiró para campos obligatorios (D4).
- [x] 5.2 `pnpm test` (typecheck, lint, importmap, unit) pasa y `graphify update .` refresca el grafo.
- [x] 5.3 Al archivar, actualizar el `## Purpose` de `openspec/specs/post-slug-lifecycle/spec.md` y `openspec/specs/slug-namespace-integrity/spec.md` para reflejar la generación automática en todas las Collections con slug.
