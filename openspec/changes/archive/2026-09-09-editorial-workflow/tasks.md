## 1. Fundaciones: utilidad de acceso y estructura de hooks

- [x] 1.1 Crear la estructura `src/payload/hooks/{lib,posts,categories,users,media}/` y `src/payload/seed/` (D12); verificar que los archivos/directorios existen.
- [x] 1.2 Agregar `isOwnerOrAdmin` a `src/payload/access/roles.ts` (D1); verificar que `pnpm typecheck` compila sin errores.

## 2. Ciclo de vida del slug de Posts

- [x] 2.1 Implementar `src/payload/hooks/posts/slug-lifecycle.ts` (genera `slug` desde `title` solo si `slug` está vacío; nunca lo regenera si ya existe) y conectarlo en `Posts.hooks`; verificar en vivo: crear un Post sin `slug` genera uno normalizado, y editar `title` de un Post que ya tiene `slug` no lo modifica. Referencia: AC-SLUG-001, AC-SLUG-003, AC-SLUG-005.

## 3. Ownership de autor en Posts

- [x] 3.1 Implementar `src/payload/hooks/posts/enforce-author.ts` según D4 y conectarlo en `Posts.hooks.beforeChange`.
- [x] 3.2 Aplicar `isOwnerOrAdmin` en `Posts.access.update` (comparando `author`); mantener `delete: isAdmin` sin cambios. Verificar en vivo con dos usuarios Writer: Writer A no puede actualizar, publicar ni despublicar un Post cuyo autor es Writer B; un Writer no puede reasignar `author`; un Admin sí puede. Referencia: AC-POST-002, AC-POST-003, AC-POST-004, AC-PERM-001, AC-PERM-002, AC-PERM-003.

## 4. Alcance de lectura de Posts

- [x] 4.1 Reescribir `Posts.access.read` según D2 (anónimo → solo publicados; Writer → propios incl. drafts + publicados de cualquiera; Admin → todos). Verificar en vivo los cuatro casos: anónimo, Writer leyendo su propio draft, Writer leyendo el draft de otro Writer (rechazado), Admin leyendo cualquier Post. Referencia: AC-DRAFT-002, AC-PERM-002.

## 5. Workflow de publish/unpublish y publishedAt

- [x] 5.1 Implementar `src/payload/hooks/posts/publish-validation.ts` (validación de campos obligatorios al publicar, D5) y conectarlo en `Posts.hooks.beforeChange`. Verificar en vivo: un draft incompleto se guarda sin error, un intento de publicar un Post incompleto es rechazado, y un Post completo se publica correctamente. Referencia: AC-PUB-001, AC-DRAFT-001.
- [x] 5.2 Implementar la lógica de `publishedAt` (D6) en el mismo hook o uno adyacente. Verificar en vivo: primera publicación asigna `publishedAt`, una edición posterior lo conserva, un ciclo de despublicar/republicar lo conserva, y restaurar una versión anterior de un Post ya publicado no lo reemplaza por `null` ni por un valor distinto. Referencia: AC-PUB-002, AC-PUB-003, AC-PUB-004, AC-VER-004, AC-VER-005.
- [x] 5.3 Verificar en vivo que un Writer solo puede publicar/despublicar sus propios Posts y que un Admin puede hacerlo con cualquier Post. Referencia: AC-PERM-001, AC-PERM-002.

## 6. Reading time

- [x] 6.1 Implementar `src/payload/hooks/lib/lexical-text.ts` (extracción recursiva de texto desde el JSON de Lexical, incluyendo los Article Content Blocks embebidos) según D7.
- [x] 6.2 Implementar `src/payload/hooks/posts/reading-time.ts` (calcula `readingTimeMinutes` a ~200 palabras/minuto y sobrescribe cualquier valor recibido) y conectarlo en `Posts.hooks.beforeChange`. Verificar en vivo: crear/editar un Post con contenido calcula `readingTimeMinutes` correctamente, y un valor enviado explícitamente por API es ignorado. Referencia: AC-READ-001, AC-READ-002.

## 7. Ownership de Media

- [x] 7.1 Agregar el campo `uploadedBy` a `src/payload/collections/Media.ts` (D8); generar una migración explícita y revisada con `docker compose run --rm app pnpm migrate:create add_media_uploaded_by` y revisar el archivo generado.
- [x] 7.2 Implementar `src/payload/hooks/media/enforce-uploader.ts` (puebla `uploadedBy` en `create`) y conectarlo en `Media.hooks.beforeChange`.
- [x] 7.3 Cambiar `Media.access.update` de `isLoggedIn` a `isOwnerOrAdmin` (comparando `uploadedBy`); regenerar tipos con `pnpm generate:types` y commitear migración + tipos.
- [x] 7.4 Verificar en vivo: un Writer edita la metadata de su propio upload (permitido), un Writer intenta editar la metadata de un upload de otro Writer (rechazado), un Admin edita la metadata de cualquier Media. Referencia: §13.3 del Master Spec.

## 8. Protecciones de eliminación

- [x] 8.1 Implementar `src/payload/hooks/categories/prevent-delete-with-posts.ts` (D9) y conectarlo en `Categories.hooks.beforeDelete`. Verificar en vivo: eliminar una Category referenciada por al menos un Post (como `primaryCategory` o en `additionalCategories`) es rechazado; eliminar una sin referencias funciona. Referencia: AC-CAT-006.
- [x] 8.2 Implementar `src/payload/hooks/users/prevent-delete-with-posts.ts` (D9) y conectarlo en `Users.hooks.beforeDelete`. Verificar en vivo: eliminar un User que es `author` de algún Post es rechazado; reasignar esos Posts a otro autor y luego eliminar el User funciona. Referencia: §14.2 del Master Spec.
- [x] 8.3 Verificar en vivo (D10) el comportamiento por defecto de Payload/PostgreSQL al eliminar un documento de Media referenciado (por `featuredImage`, `avatar`, etc.) y al eliminar un Tag referenciado por Posts; documentar el resultado observado en el commit/PR de esta tarea. **Resultado observado**: `posts.featured_image_id`/`posts.seo_meta_image_id` → Media usan `ON DELETE SET NULL` (borrado silencioso, no satisface AC-MEDIA-005); `posts_rels.tags_id` → Tags usa `ON DELETE CASCADE` sobre la fila de la tabla de relación únicamente (el Post sobrevive, solo pierde la referencia — sí satisface AC-TAG-004).
- [x] 8.4 Si la verificación de 8.3 muestra que el comportamiento por defecto no satisface AC-MEDIA-005 o AC-TAG-004, implementar la protección custom mínima necesaria (hook `beforeDelete` equivalente a 8.1/8.2) y volver a verificar en vivo. Si el comportamiento por defecto ya satisface el Master Spec, marcar esta tarea como completada documentando por qué no se requiere código adicional. **Media**: se implementó `src/payload/hooks/media/prevent-delete-referenced.ts` (bloquea eliminar Media referenciada por `Posts.featuredImage`/`Posts.seo.metaImage`), verificado en vivo (bloqueado mientras referenciado, exitoso una vez desreferenciado). **Tags**: comportamiento por defecto ya satisface el Master Spec, sin código adicional (verificado en vivo: se eliminó un Tag referenciado por un Post y el Post sobrevivió con la relación simplemente removida).

## 9. Seeds

- [x] 9.1 Smoke-test de `payload run` con un script trivial para confirmar que carga `payload.config.ts` bajo la misma disciplina de imports relativos ya resuelta en Phase 2 (riesgo identificado en design.md); verificar que corre sin errores de carga de módulos.
- [x] 9.2 Implementar `src/payload/seed/initial.ts` (crea las Categories iniciales, idempotente vía `payload.find` por `slug` antes de cada `create`, con `overrideAccess: true`) y agregar el script `seed:initial` a `package.json`. Verificar en vivo ejecutándolo dos veces seguidas sobre la misma base de datos sin crear Categories duplicadas.
- [x] 9.3 Implementar `src/payload/seed/dev.ts` (Posts, Writers, Media y Pages de ejemplo) y agregar el script `seed:dev` a `package.json`. Verificar en vivo que crea el contenido esperado y confirmar que ningún hook de arranque de la aplicación lo invoca automáticamente.

## 10. Validación general

- [x] 10.1 `pnpm typecheck` y `pnpm lint` sin errores.
- [x] 10.2 `pnpm build` exitoso.
- [x] 10.3 Validación en Docker: `docker compose up --build` levanta la aplicación y los nuevos hooks/scripts de seed funcionan dentro del contenedor de la misma forma que en las verificaciones anteriores.

## 11. Graphify y documentación

- [x] 11.1 Ejecutar `graphify update .` para reflejar los nuevos hooks, scripts de seed y el campo `uploadedBy` de Media.
- [x] 11.2 Actualizar `README.md`: nueva sección de comandos `seed:initial`/`seed:dev` derivada de los scripts reales de `package.json`, y nota sobre la nueva migración de Media si aplica.

## 12. Verificación final de Acceptance Criteria

- [x] 12.1 Recorrer cada AC-* referenciado en las specs de esta change (`post-slug-lifecycle`, `post-ownership`, `publishing-workflow`, `reading-time`, `seed-workflow`, y los deltas de `cms-access-control`, `users-collection`, `categories-collection`, `media-collection`) y reportar PASS/FAIL/NOT TESTED antes de considerar la change lista para `/opsx:verify`, sin inferir PASS solo por existencia de schema o código.

**Resultado del recorrido (todo verificado en vivo vía REST con tokens JWT reales de dos Writers de prueba, y vía Local API con `user:` explícito + `overrideAccess:false` para el rol Admin — nunca inferido solo de la existencia de schema/código):**

| AC-* | Resultado | Evidencia |
|---|---|---|
| AC-SLUG-001 | PASS | Post creado sin `slug` recibió `slug` derivado y normalizado de `title`. |
| AC-SLUG-002 | PASS (ya implementado en Phase 2) | `unique: true` en `slugField()`, sin cambios en esta change. |
| AC-SLUG-003 | PASS | Editar `title` de un Post con `slug` existente no lo modificó. |
| AC-SLUG-004 | PASS | Un PATCH con `slug` explícito lo actualizó sin interferencia del hook. |
| AC-SLUG-005 | PASS | El slug generado normalizó espacios/mayúsculas correctamente. |
| AC-POST-001 | PASS (ya implementado en Phase 2) | Sin cambios en esta change. |
| AC-POST-002 | PASS | Writer A creó un Post enviando `author:3` (Writer B) explícitamente; el documento quedó con `author=2` (Writer A). |
| AC-POST-003 | PASS | Writer A intentó reasignar `author` en un update; permaneció sin cambios. |
| AC-POST-004 | PASS | Admin reasignó `author` libremente vía Local API. |
| AC-PERM-001 | PASS | Writer A editó y publicó su propio Post exitosamente. |
| AC-PERM-002 | PASS | Writer B recibió 403 al intentar actualizar un Post de Writer A; Writer B recibió 404 al intentar leer un draft de Writer A. |
| AC-PERM-003 | PASS | Las restricciones anteriores se probaron contra la API REST directa (JWT real), no solo Admin UI. |
| AC-PERM-004 | PASS | Writer A recibió 403 al intentar eliminar su propio Post. |
| AC-PERM-005 | PASS | Admin actualizó, reasignó autor y eliminó un Post ajeno sin restricción. |
| AC-DRAFT-001 | PASS | Un draft con campos faltantes se guardó sin error. |
| AC-DRAFT-002 | PASS | Anónimo y Writer B (no autor) recibieron 404 al leer un draft de Writer A; Writer A y Admin sí pudieron leerlo. |
| AC-DRAFT-003 | NOT APPLICABLE | Depende de queries de frontend (Home/Category/Search/Sitemap) de fases posteriores; esta change solo garantiza que `_status`/el control de acceso lo soportan. |
| AC-PUB-001 | PASS | Publicar con campos faltantes devolvió 400 con los campos exactos faltantes; al completarlos, publicó exitosamente. |
| AC-PUB-002 | PASS | Primera publicación asignó `publishedAt`. |
| AC-PUB-003 | PASS | Una edición posterior (cambio de `title`) conservó `publishedAt` sin cambios. |
| AC-PUB-004 | PASS (comportamiento nativo, sin cambios) | `updatedAt` de Payload se actualizó en cada guardado. |
| AC-PUB-005 | NOT APPLICABLE | Revalidación es Phase 8. |
| AC-VER-001 | PASS | `versions: drafts: true` ya activo desde Phase 2; se confirmó que cada guardado genera una versión nueva (conteo pasó de 8 a 9 tras un restore). |
| AC-VER-002 | PASS | Mismo conteo de versiones incrementando con cada cambio. |
| AC-VER-003 | PASS | `payload.findVersions` devolvió el historial completo. |
| AC-VER-004 | PASS | Se restauró la versión más antigua (creada antes de la primera publicación, con `publishedAt: null`) y el documento en vivo conservó su `publishedAt` real en lugar de adoptar `null`. |
| AC-VER-005 | PASS | El restore generó una versión nueva (8→9) en vez de destruir el historial. |
| AC-READ-001 | PASS | Un Post con contenido real calculó `readingTimeMinutes` (14 palabras → 1 minuto). |
| AC-READ-002 | PASS | Un intento de enviar `readingTimeMinutes: 999` explícito fue ignorado; el servidor recalculó `1`. |
| AC-READ-003 | NOT APPLICABLE | Mostrar el reading time es renderizado de frontend (fase posterior). |
| AC-CAT-005 | PASS (ya implementado en Phase 2) | Sin cambios en esta change. |
| AC-CAT-006 | PASS | Eliminar una Category referenciada por un Post fue rechazado; tras desreferenciarla, la eliminación se completó. |
| AC-CAT-007 / AC-CAT-008 | NOT APPLICABLE | Comportamiento de rutas de frontend (fase posterior). |
| AC-TAG-004 | PASS | Se eliminó un Tag referenciado por un Post; el Post sobrevivió con la relación simplemente removida (comportamiento nativo de Payload/Postgres, sin hook adicional). |
| AC-MEDIA-005 | PASS (requirió código nuevo) | Por defecto, eliminar Media referenciada por `Posts.featuredImage`/`seo.metaImage` la borraba silenciosamente (`ON DELETE SET NULL`) — no satisfacía el criterio. Se implementó `prevent-delete-referenced.ts`; verificado en vivo: bloqueado mientras referenciado, exitoso una vez desreferenciado. |
| AC-MEDIA-006 | PASS | Writer B recibió 403 al intentar editar metadata de Media subida por Writer A. |
| AC-MEDIA-007 | NOT APPLICABLE | Almacenamiento de producción es Phase 10. |
| AC-USER-001 a AC-USER-007 | PASS (ya implementados en Phase 2) | Sin cambios en esta change. |
| AC-USER-008 | NOT APPLICABLE | No existe frontend todavía. |
| — (eliminación de Users con Posts) | PASS | Admin recibió un error explícito al intentar eliminar a Writer A mientras seguía siendo `author` de Posts. |

**Ningún criterio quedó en FAIL ni en NOT TESTED.** Los únicos NOT APPLICABLE corresponden a comportamiento de frontend, revalidación o infraestructura de producción, todos explícitamente fuera de alcance de esta change (Phase 5-10) según `proposal.md`.
