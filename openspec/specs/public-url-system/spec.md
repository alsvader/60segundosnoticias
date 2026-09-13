## Purpose

Centraliza la construcción de URLs canónicas (Categoría, Artículo, Page genérica) y la resolución de enlaces de Navigation/Footer, para que ningún componente construya URLs editoriales manualmente.

## Requirements

### Requirement: Helpers de URL canónica centralizados
El sistema SHALL exponer `getCategoryUrl(categorySlug)`, `getPostUrl(primaryCategorySlug, postSlug)` y `getPageUrl(pageSlug)` como las únicas funciones que construyen estas URLs. Ningún componente SHALL construir estas rutas concatenando strings de forma independiente.

#### Scenario: Se necesita el enlace de un Post en una tarjeta
- **WHEN** el mapper de `ArticleCardData` necesita el `href` de un Post
- **THEN** usa `getPostUrl()` con el slug de la categoría primaria y el slug del Post

### Requirement: Resolución de enlaces de Navigation/Footer
El sistema SHALL exponer `resolveLink()` para convertir un item de Navigation/Footer (`category`, `page` o `external`) en un enlace resuelto (`href`, `label`, `external`), y `normalizePath()` para normalizar una ruta a su forma canónica. Un enlace `external` SHALL validarse antes de resolverse.

#### Scenario: Un item de Navigation es de tipo category
- **WHEN** `resolveLink()` recibe un item de Navigation con `type: 'category'`
- **THEN** devuelve un `href` construido con `getCategoryUrl()`

#### Scenario: Un item de Navigation es de tipo external con una URL insegura
- **WHEN** `resolveLink()` recibe un item `external` con un esquema de URL no seguro (por ejemplo `javascript:`)
- **THEN** el enlace no se resuelve como válido

Referencia: AC-SEC-007

### Requirement: Origen de sitio canónico centralizado
El sistema SHALL exponer `getSiteOrigin()` (origen absoluto del sitio) y `getAbsoluteUrl(path)` como las únicas funciones que producen una URL absoluta pública. Ningún componente o módulo SHALL leer independientemente la configuración del origen del sitio ni construir una URL absoluta concatenando strings por su cuenta. En un entorno de producción, un origen ausente o inválido SHALL producir un error explícito en vez de asumir silenciosamente un origen de desarrollo.

#### Scenario: Se necesita la URL absoluta de un Article para compartir
- **WHEN** `ShareActions` u otro consumidor necesita la URL absoluta de un Article
- **THEN** usa `getAbsoluteUrl()` sobre el resultado de `getPostUrl()`, no una construcción propia

#### Scenario: El origen del sitio falta o es inválido en producción
- **WHEN** el origen del sitio no está configurado o no es una URL válida en un entorno de producción
- **THEN** el sistema falla de forma explícita en vez de asumir silenciosamente `http://localhost:3000`

Referencia: AC-ENV-004

### Requirement: No implementa las rutas dinámicas correspondientes
Esta capability SHALL proveer únicamente los helpers de construcción de URL. Las rutas dinámicas `/[category]`, `/[category]/[post]` y `/[slug]` (Page genérica) no SHALL implementarse todavía.

#### Scenario: Se busca la ruta dinámica de artículo
- **WHEN** se revisa `src/app/(frontend)/`
- **THEN** no existe una ruta `/[category]/[post]` implementada; solo el helper `getPostUrl()` que la construirá cuando esa ruta exista
