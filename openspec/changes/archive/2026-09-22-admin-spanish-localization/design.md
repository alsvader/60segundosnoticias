## Context

- `payload.config.ts` no tiene configuración `i18n`, así que Payload usa inglés por defecto.
- De todas las colecciones, solo `src/payload/collections/Posts.ts` declara `labels` (Noticia/Noticias). Ningún global declara `label`.
- La mayoría de los campos no tienen `label`, y Payload los muestra con el `name` convertido a título. Hay unos pocos labels en inglés, como `Users.role` (Admin/Writer) y `Redirects.type` (301 (Permanent)/302 (Temporary)). Otros ya están en español, como las opciones de `ArticleSidebar` y algunos bloques de Home.
- El plugin `@payloadcms/plugin-search` (`src/payload/plugins/search.ts`) crea la colección `search`, con campos por defecto (`title`, `priority`, `doc`) y seis campos extra definidos en `searchOverrides.fields`.
- Los bloques de Lexical del contenido de artículos se registran en `src/payload/fields/article-editor.ts` y se definen en `src/payload/blocks/article/*`.
- `@payloadcms/translations@3.87.1` está instalado solo como dependencia transitiva. Su `acceptedLanguages` es una lista cerrada que incluye `es` pero no `es-MX`, y `extractHeaderLanguage()` convierte `es-MX` en `es`.

## Goals / Non-Goals

**Goals:**
- Que el admin completo se vea en español con cambios de configuración declarativa, sin componentes personalizados.
- Que no haya ningún cambio de esquema, de API ni de tipos.

**Non-Goals:**
- Un mecanismo centralizado de traducciones para labels propios. Los labels se escriben directamente en cada config, igual que en `Posts`.
- Sobrescribir cadenas del paquete `es` de Payload.

## Decisions

1. **`i18n: { supportedLanguages: { es }, fallbackLanguage: 'es' }`.**
   - Con un único idioma soportado, Payload oculta el selector de idioma y siempre resuelve a `es`, sin importar `Accept-Language` ni la preferencia guardada.
   - *Alternativa descartada:* la llave `'es-MX'`. No es un `AcceptedLanguages` válido: falla el typecheck y en runtime nunca coincide.
   - *Alternativa descartada:* `{ en, es }` con `fallbackLanguage: 'es'`. Dejaría el selector de idioma visible y permitiría ver el admin en inglés.

2. **Dependencia directa `@payloadcms/translations` fijada en `3.87.1`.**
   - Hay que importar `@payloadcms/translations/languages/es`. Con pnpm, importar una dependencia transitiva es frágil. La versión fija evita que se desalinee con `payload`.
   - No es una dependencia nueva en el runtime, porque ya se instala hoy.

3. **Labels como strings en español dentro de cada config, sin objetos `{ es: … }` por idioma.**
   - Con un solo idioma, un objeto por idioma solo agrega ruido. Mantiene el mismo patrón que `Posts.ts`.

4. **Colección `search`: `searchOverrides.labels` y labels por campo.**
   - Los campos extra reciben `label` directamente.
   - Para los `defaultFields` del plugin (`title`, `priority`, `doc`), la función `fields: ({ defaultFields }) => …` los recorre y sobrescribe su `label` según el `name`, sin cambiar ninguna otra propiedad.

5. **Helpers de campos compartidos.**
   - `seoFields`, `slugField`, `linkFields` y `socialLinksField` reciben labels en español en su definición.
   - Si un helper ya acepta overrides, se conserva la firma y solo cambia el valor por defecto.

6. **Solo `label`/`labels`; nunca `name`, `slug`, `value` ni `interfaceName`.**
   - Así se garantiza que no haya migración ni cambios en `payload-types.ts`.
   - Se verifica con `pnpm generate:types`: el diff debe ser vacío o de solo comentarios. También con una migración de prueba que no detecte cambios.

## Risks / Trade-offs

- [Algún campo queda sin label y sigue en inglés] → Hacer una revisión manual de cada colección, global y bloque en `pnpm dev`, y un `grep` de campos sin `label` al terminar.
- [Algunas cadenas del paquete `es` de Payload usan español peninsular o neutro] → Se acepta. Se pueden ajustar después con `i18n.translations.es` sin cambiar este diseño.
- [Pruebas e2e u otras automatizaciones dependen de textos en inglés del admin] → Actualizar `tests/e2e/admin-smoke.spec.ts`. Es la única prueba que interactúa con el admin.
- [Cambiar labels de bloques cambia el texto en el selector de bloques pero no los datos] → Sin riesgo: `blockType` sigue siendo el `slug`.

## Migration Plan

- No hay migración de datos. El despliegue es normal y el rollback es un revert del commit.
