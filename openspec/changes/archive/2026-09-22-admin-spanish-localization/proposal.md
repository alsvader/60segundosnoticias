## Why

El dashboard de Payload (`/admin`) lo usarán solo editores y administradores de Villahermosa, y el Master Spec define el idioma del producto como Español (México), `es-MX`. Aun así, casi todo el admin sale en inglés: la interfaz base de Payload (botones, mensajes, login), los nombres de colecciones y globals, y los campos que no tienen `label`, porque Payload los muestra con su `name` convertido a título ("Published At", "Featured Image"). Hoy solo `Posts` declara `labels` en español (Noticia/Noticias).

## What Changes

- Configurar la i18n del admin de Payload con español como **único** idioma soportado y como idioma de respaldo. La interfaz base (login, navegación, acciones, estados de borrador y publicación, validaciones, toasts) queda en español sin importar el idioma del navegador.
- Declarar labels en español (singular y plural) en todas las colecciones (Users, Media, Categories, Tags, Pages, Redirects) y en la colección de índice de búsqueda que crea el plugin de Search, siguiendo el patrón que ya usa `Posts`.
- Declarar `label` en español en todos los globals (Navigation, Footer, SiteSettings, Home, ArticleSidebar).
- Declarar `label` en español en cada campo visible en el admin: colecciones, globals, campos compartidos (SEO, slug, links, redes sociales), grupos, arrays (con `labels` singular y plural para los botones "Agregar …"), tabs, rows y collapsibles.
- Declarar labels en español en todos los bloques (Article/Lexical, Home, Page, Shared).
- Traducir al español los labels de las opciones de `select`. Los `value` no cambian.
- Actualizar la prueba e2e `admin-smoke`, que hoy busca los textos del login en inglés (`Email`, `Password`, `Login`).

**Decisión sobre la llave de idioma:** el usuario pidió `es-MX`, pero Payload 3.87.1 no la acepta. Su lista cerrada `acceptedLanguages` solo incluye `es`, y cuando el navegador envía `es-MX`, el código lo convierte en `es`. Por eso se usa la llave `es`. La intención de localizar el admin para México se cumple con el paquete de traducciones `es` de Payload y con los labels propios del proyecto, escritos en español de México.

**Sin cambios incompatibles:** no cambia ningún `slug` de colección, global o bloque, ningún `name` de campo ni ningún `value` de select. Por eso no hay migración de base de datos ni cambios en la REST/GraphQL/Local API, en `payload-types.ts` (salvo quizá comentarios) ni en el frontend público.

### Fuera de alcance

- Localización del **contenido** (`localization` de Payload, contenido multi-idioma). El sitio sigue siendo mono-idioma.
- Soporte de un segundo idioma en el admin (inglés u otro) o un selector de idioma.
- Traducir textos del frontend público. Ya está en español y no es parte de este cambio.
- Renombrar slugs, `name` de campos o `value` de opciones.
- Componentes personalizados del admin.
- Cambios al Master Spec.

## Capabilities

### New Capabilities
- `cms-admin-localization`: idioma de la interfaz del admin de Payload y obligación de que colecciones, globals, bloques, campos y opciones visibles en el admin tengan labels en español, sin alterar identificadores persistidos.

### Modified Capabilities
<!-- Ninguna: los requisitos existentes de posts-collection, pages-collection, home-global, etc. describen modelo de datos y comportamiento, que no cambian. -->

## Impact

- **Configuración:** `payload.config.ts` recibe la configuración `i18n`.
- **Dependencias:** se agrega `@payloadcms/translations` como dependencia directa, fijada en `3.87.1` igual que los demás paquetes `@payloadcms/*`. Ya está instalada como dependencia transitiva de `payload`, pero con pnpm estricto hay que declararla para poder importar `@payloadcms/translations/languages/es`.
- **Código Payload:** `src/payload/collections/*`, `src/payload/globals/*`, `src/payload/fields/*`, `src/payload/blocks/**/*` y `src/payload/plugins/search.ts`. Solo cambian propiedades `label`/`labels`, que usa únicamente el admin.
- **Tests:** `tests/e2e/admin-smoke.spec.ts`.
- **Sin impacto:** esquema PostgreSQL y migraciones, rutas públicas, cache/revalidación, Docker y variables de entorno.
