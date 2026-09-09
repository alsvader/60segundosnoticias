## Why

Phase 2 (`payload-cms-core`) entregó el schema, las relaciones y el control de acceso base de las 7 Collections de V1, pero dejó explícitamente fuera todo el ciclo de vida editorial: generación de slug, ownership de Writer, workflow de publish/unpublish, reading time y seeds (ver Non-Goals de `payload-cms-core`). Hoy cualquier Writer autenticado puede editar, publicar, despublicar o reasignar el autor de un Post de otro Writer, y puede leer los drafts de otros Writers — el campo `author` es una relación libre sin hook, y el `access.update` de Posts no valida ownership. `publishedAt` y `readingTimeMinutes` existen en el schema pero no los calcula ni los protege nada. Sin esto, el CMS no es seguro para más de un Writer y no cumple la Fase 3 — "Editorial Workflow" — del Master Spec (§82).

## What Changes

- Hook de ciclo de vida de slug en Posts: genera el slug desde el título solo cuando no existe; nunca lo regenera al editar el título después.
- Enforcement de ownership de autor en Posts: al crear, un Writer recibe automáticamente `author = currentUser` y no puede cambiarlo; Admin puede asignar/cambiar el autor libremente. Aplicado server-side (hook + función de acceso), no solo en el Admin UI.
- **Cambio de comportamiento en lectura de Posts**: un Writer autenticado deja de ver los drafts de otros Writers (hoy los ve). El nuevo modelo: anónimo → solo publicados; Writer → sus propios Posts (incluidos drafts) + publicados de cualquier autor; Admin → todos. El acceso de escritura (update/publish/unpublish/delete) no cambia — sigue restringido a los Posts propios del Writer.
- Workflow de publish/unpublish: validación de campos editoriales obligatorios (`title`, `slug`, `excerpt`, `featuredImage`, `primaryCategory`, `author`, `content`) únicamente en la transición a publicado, sin volver esos campos `required` de forma incondicional (los drafts siguen pudiendo ser parciales). `publishedAt` se asigna una sola vez en la primera publicación y permanece estable ante ediciones posteriores, unpublish/republish y restauración de versiones.
- Cálculo automático de `readingTimeMinutes` a partir del contenido Lexical de `content` (~200 palabras/minuto), sobrescrito server-side en cada guardado — el campo deja de depender de que nadie lo edite manualmente.
- Protección de eliminación: una Category no puede eliminarse mientras existan Posts que la referencien (como `primaryCategory` o `additionalCategories`); un User no puede eliminarse mientras existan Posts que lo referencien como `author` (Admin debe reasignarlos primero). El flujo preferido para retirar un Writer sigue siendo `active = false`.
- Verificación (sin asumir) del comportamiento por defecto de Payload/PostgreSQL al eliminar Media o Tags referenciados; solo se agrega protección custom si esa verificación muestra que el comportamiento por defecto no cumple el Master Spec.
- Ownership de Media: nuevo campo `uploadedBy` (relación a `users`, poblado automáticamente al crear) y restricción de `update` para que un Writer solo pueda editar metadata de Media que subió él mismo; Admin conserva acceso completo.
- Scripts `seed:initial` (idempotente, limitado a las Categories iniciales — el único schema ya implementado que aplica; explícitamente NO crea Navigation/Home/SiteSettings) y `seed:dev` (contenido de ejemplo — Posts, Writers, Media, Pages de prueba —, nunca se ejecuta automáticamente en producción).
- Nueva utilidad de acceso `isOwnerOrAdmin` en `src/payload/access/roles.ts`, reutilizada por `Posts.access.update` y `Media.access.update`.
- Nuevo directorio `src/payload/hooks/` con un módulo por responsabilidad (slug, ownership, publish-validation, reading-time, protecciones de eliminación), sin recursión ni escrituras internas dentro de los propios hooks.

No se crean redirects automáticos al cambiar el slug de un Post publicado, ni Draft Mode, revalidación dirigida, sitemap/robots, ni renderizado de SEO/JSON-LD — esas piezas son Phase 8 según el roadmap, aunque parte de la regla de negocio (crear redirect al cambiar slug) sea alcance de V1.

## Capabilities

### New Capabilities
- `post-slug-lifecycle`: generación inicial del slug de Posts desde el título y no regeneración automática al editar el título.
- `post-ownership`: asignación automática de autor para Writer, bloqueo de reasignación de autor por Writer, y aplicación server-side de ownership en `update`/`publish`/`unpublish`/`delete` de Posts.
- `publishing-workflow`: validación de campos obligatorios para publicar y ciclo de vida de `publishedAt` (asignación única, estabilidad ante ediciones, unpublish/republish y restauración de versiones).
- `reading-time`: cálculo automático y server-side de `readingTimeMinutes` a partir del contenido Lexical de Posts.
- `seed-workflow`: scripts `seed:initial` (baseline idempotente limitado a Categories) y `seed:dev` (contenido de desarrollo, nunca en producción).

### Modified Capabilities
- `cms-access-control`: nuevo requisito de que un Writer no puede leer los drafts de otros Writers (solo los propios y los Posts publicados de cualquier autor).
- `users-collection`: nuevo requisito de que un User no puede eliminarse mientras existan Posts que lo referencien como `author`.
- `categories-collection`: nuevo requisito de que una Category no puede eliminarse mientras existan Posts que la referencien.
- `media-collection`: nuevo requisito de ownership de Media (`uploadedBy`) y de que un Writer solo puede editar metadata de Media que subió él mismo.

## Impact

- Código: `src/payload/collections/Posts.ts`, `Media.ts`, `Categories.ts`, `Users.ts`; nuevo `src/payload/hooks/**`; `src/payload/access/roles.ts` (nueva función `isOwnerOrAdmin`).
- Base de datos: una migración explícita y revisada para el nuevo campo `uploadedBy` en `Media` (relación a `users`); regeneración de `src/payload-types.ts`. Sin otros cambios de schema.
- Scripts: nuevos `seed:initial`/`seed:dev` en `package.json` (ubicación e implementación exacta se definen en `design.md`).
- Documentación: `README.md` — sección de comandos de seed y, si aplica, nota sobre la migración de Media.
- Sin impacto en frontend, Globals (Home/Navigation/Footer/SiteSettings), redirects automáticos, cache/revalidation, SEO/JSON-LD, búsqueda o infraestructura de producción — todo eso queda fuera de esta change (Phase 5-10).
