## 1. Fields reutilizables y constantes compartidas

- [x] 1.1 Crear `seoFields` (`metaTitle`, `metaDescription`, `metaImage`, `canonicalURL`, `noIndex`) en `src/payload/fields/seo-fields.ts`; verificar que compila como un grupo de campos de Payload válido.
- [x] 1.2 Crear `slugField` base (texto, único, indexado, sin hooks de generación) en `src/payload/fields/slug-field.ts`; verificar tipo.
- [x] 1.3 Crear `socialLinksField` en `src/payload/fields/social-links-field.ts`; verificar tipo.
- [x] 1.4 Crear la constante compartida de reserved slugs en `src/lib/constants/reserved-slugs.ts` (como mínimo `buscar`, `admin`, `api`, `preview`, `media`, `autor`, `tag`, `_next`); verificar que el módulo no importa React, Tailwind ni Lucide.

## 2. Resolución del conflicto entre `src/lib/env` y el CLI de Payload

- [x] 2.1 Crear `src/lib/env/payload.ts` (sin `server-only`) validando únicamente `DATABASE_URI` y `PAYLOAD_SECRET`; verificar que `src/lib/env/index.ts` permanece sin modificar.
- [x] 2.2 Actualizar `payload.config.ts` para importar desde `src/lib/env/payload.ts`; verificar ejecutando `pnpm exec payload generate:types` (o equivalente) y confirmando que la configuración carga sin error de resolución de módulos. Nota: el alias `@/*` no lo resuelve el loader del CLI de Payload (confirmado al probar); se usa un import relativo con extensión explícita (`./src/lib/env/payload.ts`) que sí resuelve tanto en el CLI como en Next.js (se añadió `allowImportingTsExtensions` a `tsconfig.json`, seguro por tener `noEmit: true`).
- [x] 2.3 Verificar que `pnpm build` y `pnpm dev` siguen funcionando sin cambio de comportamiento observable (siguen usando `src/lib/env/index.ts` con su validación completa).

## 3. Dependencias nuevas

- [x] 3.1 Verificar `@payloadcms/richtext-lexical@3.87.1` y una versión estable de `sharp` contra el registro de paquetes antes de instalar (misma disciplina que en `bootstrap-technical-foundation`); si alguna cambió o es incompatible, detener y reportar en vez de forzar.
- [x] 3.2 Instalar ambas dependencias; verificar que `pnpm install` no requiere `--force` ni `--legacy-peer-deps` y que `package.json`/`pnpm-lock.yaml` registran las versiones instaladas.

## 4. Collection: Categories

- [x] 4.1 Crear `src/payload/collections/Categories.ts` con `name`, `slug` (`slugField`), `description`, `colorTheme` (enum controlado), `icon` (enum controlado), `image`, `showInNavigation`, `showOnHome`, `order` y `seo` (`seoFields`); verificar tipo y que no define ningún hook de ciclo de vida editorial (AC-CAT-003, AC-CAT-004).
- [x] 4.2 Agregar un `validate` en `Categories.slug` que rechace reserved slugs; verificar creando una Category con `slug: "admin"` y confirmando el rechazo (AC-ROUTE-002).
- [x] 4.3 Definir `access` de `Categories` (Admin CRUD completo, Writer sin acceso de administración); verificar que un intento de creación como Writer es rechazado server-side (AC-CAT-001, AC-CAT-005).

## 5. Collection: Tags

- [x] 5.1 Crear `src/payload/collections/Tags.ts` con `name` y `slug` (`slugField`); verificar tipo.
- [x] 5.2 Definir `access` de `Tags` (lectura pública, Writer lee/crea sin eliminar, Admin CRUD completo); verificar que un intento de eliminación como Writer es rechazado (AC-TAG-002, AC-TAG-003).

## 6. Collection: Users

- [x] 6.1 Crear `src/payload/collections/Users.ts` con `auth: true`, campos editoriales (`name`, `displayName`, `slug`, `avatar`, `bio`, `socialLinksField`) y campos administrativos (`email` vía auth, `role` select `admin`/`writer`, `active` checkbox default `true`); verificar tipo (AC-USER-001).
- [x] 6.2 Agregar `access.read` a nivel de campo en `email`, `role` y `active` retornando `Boolean(req.user)`; verificar con una petición no autenticada que esos tres campos no aparecen en la respuesta (AC-USER-008).
- [x] 6.3 Agregar `hooks.beforeLogin` que rechace el login cuando `active === false`; verificar manualmente que un `User` con `active: false` no puede autenticarse (AC-USER-005).
- [x] 6.4 Registrar `Users` en `payload.config.ts` (reemplazando la Collection `users` mínima que Payload genera por defecto); verificar que `/admin` usa esta Collection real para el flujo de creación de primer usuario/login (AC-SEC-001).

## 7. Collection: Media

- [x] 7.1 Crear `src/payload/collections/Media.ts` como upload collection con `alt`, `caption`, `credits`, `description`; verificar tipo (AC-MEDIA-002).
- [x] 7.2 Configurar `imageSizes` (thumbnail/card/tablet/desktop/hero) y `mimeTypes` restringido a formatos de imagen seguros, excluyendo `image/svg+xml` en esta fase; verificar subiendo una imagen de prueba y confirmando que se generan las variantes configuradas (AC-MEDIA-003, AC-SEC-005).
- [x] 7.3 Definir `access` de `Media` (Admin/Writer autorizado suben y leen, lectura pública para servir imágenes); verificar (AC-MEDIA-001).

## 8. Article Content Blocks

- [x] 8.1 Verificar la API real de `BlocksFeature` en `@payloadcms/richtext-lexical@3.87.1` instalado antes de implementar los blocks; documentar el import usado. Import usado: `import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'` (ver `src/payload/fields/article-editor.ts`), confirmado inspeccionando `node_modules/@payloadcms/richtext-lexical/dist/index.d.ts`.
- [x] 8.2 Crear `ImageBlock`, `GalleryBlock`, `VideoBlock`, `QuoteBlock`, `CalloutBlock` y `EmbedBlock` en `src/payload/blocks/article/`, con los campos y enums controlados definidos en `specs/article-content-blocks/spec.md`; verificar que cada uno compila y que los enums (`alignment`, `layout`, `provider`, `variant`) solo aceptan los valores especificados (AC-BLOCK-IMG-001/002, AC-BLOCK-GAL-001, AC-BLOCK-VID-001, AC-EMBED-001).

## 9. Page Blocks

- [x] 9.1 Crear `Hero`, `RichText`, `ImageText`, `Gallery`, `Video`, `CTA`, `FAQ` y `Banner` en `src/payload/blocks/page/`, con los campos y enums controlados definidos en `specs/page-blocks/spec.md`; verificar que cada uno compila y que ninguno acepta HTML/CSS arbitrario.

## 10. Collection: Posts

- [x] 10.1 Crear `src/payload/collections/Posts.ts` con `title`, `slug` (`slugField`), `excerpt`, `featuredImage`, `source`, `photoCredits`; verificar tipo.
- [x] 10.2 Agregar `primaryCategory` (relación única, indexada), `additionalCategories` (relación múltiple), `tags` (relación múltiple) y `author` (relación a `Users`, indexada); verificar que `additionalCategories` es independiente de `primaryCategory` (AC-CAT-007, AC-CAT-008).
- [x] 10.3 Configurar `content` como Lexical Rich Text con `BlocksFeature` limitado a los 6 Article Content Blocks; verificar que no existe opción de insertar HTML crudo ni script (AC-CONTENT-001, AC-CONTENT-004, AC-CONTENT-005).
- [x] 10.4 Agregar `publishedAt` (indexado), `featured`, `readingTimeMinutes` (`admin.readOnly: true`) y `seo` (`seoFields`); verificar que `readingTimeMinutes` se muestra como solo lectura en el formulario (AC-READ-002).
- [x] 10.5 Habilitar `drafts: true`, `versions: true`, `admin.useAsTitle: 'title'`, sin campo `status` manual; verificar guardando un Draft con campos incompletos (AC-VER-001, AC-DRAFT-001).
- [x] 10.6 Definir el bloque `Posts.access` completo: `read` con constraint `_status: published` para peticiones anónimas y lectura completa para usuarios autenticados, más `create`/`update: isAdminOrWriter` y `delete: isAdmin` explícitos (Payload aplica `() => true` a cualquier operación no definida — ver hallazgo corregido en la tarea 16.3); verificar con una petición no autenticada que un Post en Draft no se devuelve, y que crear/actualizar/eliminar sin autenticación es rechazado (AC-DRAFT-002, AC-DRAFT-003, AC-POST-001, AC-SEC-002).

## 11. Collection: Pages

- [x] 11.1 Crear `src/payload/collections/Pages.ts` con `title`, `slug` (`slugField`), `layout` (blocks: los 8 Page Blocks) y `seo` (`seoFields`); verificar tipo (AC-PAGE-004, AC-PAGE-005).
- [x] 11.2 Agregar `validate` en `Pages.slug` que rechace reserved slugs y que rechace colisión con un `slug` existente de `Categories`; completar la validación simétrica en `Categories.slug` (tarea 4.2) para rechazar colisión con `Pages`; verificar en ambos sentidos: crear una Page con el slug de una Category existente es rechazado, y viceversa (AC-ROUTE-001).
- [x] 11.3 Habilitar `drafts: true`, `versions: true`; verificar guardando un Draft de Page.
- [x] 11.4 Definir `access` de `Pages` (lectura pública solo `_status: published`, Writer solo lectura, Admin CRUD completo); verificar con una petición no autenticada que una Page en Draft no se devuelve (AC-PAGE-001, AC-PAGE-002).

## 12. Collection: Redirects

- [x] 12.1 Crear `src/payload/collections/Redirects.ts` con `from` (único, indexado), `to`, `statusCode`, `active`; verificar tipo.
- [x] 12.2 Definir `access` de `Redirects` (solo Admin CRUD); verificar que un intento de creación como Writer es rechazado.
- [x] 12.3 Confirmar por inspección de código que ninguna Collection de este change dispara creación, modificación o eliminación automática de `Redirects`.

## 13. Registro final en `payload.config.ts`

- [x] 13.1 Registrar las 7 Collections en `payload.config.ts`; verificar que `collections` deja de estar vacío y que `pnpm build` compila correctamente (AC-GEN-002). Hallazgo adicional: al registrar `Pages` (que importa `@payloadcms/richtext-lexical` transitivamente), el CLI de Payload falló con `ERR_REQUIRE_ASYNC_MODULE` (ese paquete usa top-level await en su grafo ESM, incompatible con el `require()` síncrono que el CLI usa para cargar `payload.config.ts`). Solución: agregar `"type": "module"` a `package.json`, tal como lo hace la plantilla oficial de Payload 3.x (verificado contra `templates/blank/package.json` del repo de Payload en el tag `v3.87.1`). Verificado que esto no rompe `pnpm build`/`pnpm dev`/`pnpm lint`/Docker tras el cambio.
- [x] 13.2 Configurar `migrationDir: 'src/payload/migrations'` en el adaptador Postgres, sin configurar `prodMigrations`; verificar por inspección que `prodMigrations` no está presente en la configuración.

## 14. Migración inicial de PostgreSQL

- [x] 14.1 Con el schema completo y estable (todas las tareas 4–13 verificadas), ejecutar `payload migrate:create` para generar la primera migración; verificar que el archivo se crea en `src/payload/migrations/`.
- [x] 14.2 Revisar manualmente el contenido de la migración generada; verificar que cubre las 7 Collections y las tablas de los Page Blocks esperadas (AC-DB-002).
- [x] 14.3 Commitear la migración generada; verificar reconstruyendo el schema desde cero (`docker compose down -v && docker compose up`) que la aplicación arranca sin errores sobre una base de datos limpia (AC-DB-003).

## 15. Generación de tipos de Payload

- [x] 15.1 Agregar el script `"generate:types": "payload generate:types"` a `package.json`; verificar que el script existe y se ejecuta sin error tras la resolución de la tarea 2.
- [x] 15.2 Ejecutar el script y commitear `src/payload-types.ts`; verificar que el archivo se genera con tipos correspondientes a las 7 Collections.
- [x] 15.3 Ejecutar `pnpm typecheck` con los tipos generados presentes; verificar que pasa sin errores.

## 16. Validación final del change

- [x] 16.1 Ejecutar typecheck, lint y build de producción sobre el resultado completo; verificar que los tres pasan sin errores (AC-GEN-001, AC-GEN-002).
- [x] 16.2 Levantar `docker compose up --build` y verificar manualmente: `/admin` permite crear el primer `User` real, el login funciona, y se puede crear un `Category`, `Tag`, `Post`, `Page` y `Redirect` de prueba desde el Admin UI.
- [x] 16.3 Verificar server-side (no solo ocultamiento de UI) las reglas de acceso clave: una petición REST/GraphQL no autenticada a un Post en Draft no lo devuelve; una petición no autenticada a `Users` no incluye `email`/`role`/`active`; un `User` con `active: false` no puede autenticarse. **Hallazgo corregido durante esta verificación**: `Posts` solo definía `access.read`; Payload aplica `() => true` por defecto a `create`/`update`/`delete` no definidos, por lo que cualquier petición no autenticada podía crear/modificar/eliminar Posts. Se agregó `create`/`update: isAdminOrWriter` y `delete: isAdmin` a `Posts.access`. Re-verificado en vivo: creación/eliminación no autenticada ahora responde 403; Admin/Writer autenticados siguen pudiendo operar con normalidad; el resto de las 6 Collections restantes fueron auditadas y ya tenían `create`/`update`/`delete` completos.
- [x] 16.4 Ejecutar la actualización de Graphify sobre el repositorio; verificar que una consulta sobre las nuevas Collections encuentra nodos de código correspondientes.
- [x] 16.5 Actualizar `README.md` reflejando únicamente los comandos y scripts realmente implementados en este change (`generate:types` y, si aplica, comandos de migración), y actualizando la sección "Estado del proyecto" para reflejar que las Collections ya existen; verificar cada comando documentado ejecutándolo contra el repositorio antes de escribirlo.
- [x] 16.6 Reportar el estado (`PASS`/`FAIL`/`NOT TESTED`/`NOT APPLICABLE`) de los criterios de aceptación cubiertos por este change, incluyendo como mínimo: AC-USER-001, 004, 005, 007, 008; AC-POST-001; AC-SLUG-002; AC-CAT-001, 003, 004, 005, 007, 008; AC-TAG-001, 002, 003; AC-VER-001; AC-MEDIA-001, 002, 003; AC-CONTENT-001–005; AC-BLOCK-IMG-001/002; AC-BLOCK-GAL-001; AC-BLOCK-VID-001; AC-EMBED-001; AC-PAGE-001, 002, 004, 005; AC-ROUTE-001, 002; AC-DRAFT-002, 003; AC-SEC-001, 002, 006; AC-DB-002, 003; AC-GEN-001, 002.
