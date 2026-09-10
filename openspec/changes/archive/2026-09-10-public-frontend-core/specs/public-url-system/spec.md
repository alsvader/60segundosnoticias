## Purpose

Centraliza la construcción de URLs canónicas (Categoría, Artículo, Page genérica) y la resolución de enlaces de Navigation/Footer, para que ningún componente construya URLs editoriales manualmente.

## ADDED Requirements

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

### Requirement: No implementa las rutas dinámicas correspondientes
Esta capability SHALL proveer únicamente los helpers de construcción de URL. Las rutas dinámicas `/[category]`, `/[category]/[post]` y `/[slug]` (Page genérica) no SHALL implementarse en este change.

#### Scenario: Se busca la ruta dinámica de artículo
- **WHEN** se revisa `src/app/(frontend)/` tras este change
- **THEN** no existe una ruta `/[category]/[post]` implementada; solo el helper `getPostUrl()` que la construirá cuando esa ruta exista
