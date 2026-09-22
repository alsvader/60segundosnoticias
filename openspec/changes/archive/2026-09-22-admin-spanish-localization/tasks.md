## 1. i18n del admin

- [x] 1.1 Agregar `@payloadcms/translations` fijado en `3.87.1` a `dependencies` con `pnpm add @payloadcms/translations@3.87.1` y verificar que `pnpm-lock.yaml` resuelve la misma versión que `payload`
- [x] 1.2 Configurar `i18n: { supportedLanguages: { es }, fallbackLanguage: 'es' }` en `payload.config.ts` (import desde `@payloadcms/translations/languages/es`) y verificar con `pnpm typecheck`

## 2. Colecciones y globals

- [x] 2.1 Agregar `labels: { singular, plural }` en español a Users, Media, Categories, Tags, Pages y Redirects, siguiendo el patrón de `Posts.ts`, y verificar con `pnpm typecheck`
- [x] 2.2 Agregar `label` en español a los globals Navigation, Footer, SiteSettings, Home y ArticleSidebar, y verificar con `pnpm typecheck`
- [x] 2.3 Agregar `searchOverrides.labels`, `label` a los campos extra y un override de label para los `defaultFields` en `src/payload/plugins/search.ts`, y verificar que `build-search-doc.test.ts` sigue pasando

## 3. Campos

- [x] 3.1 Agregar `label` en español a todos los campos de `src/payload/collections/*.ts`, incluidas las opciones de select (`Users.role` → Administrador/Redactor, `Redirects.type` → Permanente/Temporal) sin tocar `name` ni `value`, y verificar con `pnpm typecheck`
- [x] 3.2 Agregar `label` en español (y `labels` en arrays) a los campos de `src/payload/globals/*.ts` y verificar con `pnpm typecheck`
- [x] 3.3 Agregar labels en español a los helpers compartidos `seo-fields.ts`, `slug-field.ts`, `link-fields.ts` y `social-links-field.ts`, conservando sus firmas, y verificar con `pnpm test:unit`

## 4. Bloques

- [x] 4.1 Agregar `labels: { singular, plural }` y `label` en campos a los bloques de `src/payload/blocks/article/*` (editor Lexical) y verificar que el menú de bloques del editor muestra los nombres en español
- [x] 4.2 Agregar labels en español a los bloques de `src/payload/blocks/home/*`, `page/*` y `shared/*` y verificar con `pnpm typecheck`

## 5. Pruebas y verificación

- [x] 5.1 Actualizar `tests/e2e/admin-smoke.spec.ts` para usar "Correo electrónico", "Contraseña" e "Iniciar sesión", y verificar con `pnpm test:e2e tests/e2e/admin-smoke.spec.ts --project=chromium`
- [x] 5.2 Ejecutar `pnpm generate:types` y verificar que `src/payload-types.ts` no cambia de forma estructural (diff vacío o solo comentarios)
- [x] 5.3 Crear una migración de prueba con `pnpm migrate:create` y verificar que no detecta cambios de esquema (descartar el archivo si se genera)
- [x] 5.4 Ejecutar `pnpm test` (typecheck, lint, importmap y unit) y `pnpm test:integration`, y verificar que pasan
- [x] 5.5 Revisión manual en `pnpm dev`: login, navegación, listas, formularios de cada colección y global, y selectores de bloques en Portada, Página y contenido de Noticia. Verificar que no queda texto en inglés visible en el admin
- [x] 5.6 Ejecutar `graphify update .` para refrescar el grafo
