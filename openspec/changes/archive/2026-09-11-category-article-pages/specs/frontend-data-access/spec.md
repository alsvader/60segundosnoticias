## ADDED Requirements

### Requirement: Búsqueda pública de contenido por slug
El DAL SHALL exponer `getPostBySlug()`, `getPageBySlug()` y `getCategoryBySlug()`, cada uno usando el helper de acceso público compartido (`overrideAccess: false`). `getPostBySlug()` y `getPageBySlug()` SHALL devolver únicamente documentos publicados.

#### Scenario: Post publicado por slug
- **WHEN** se solicita un Post por slug con `getPostBySlug()` y está publicado
- **THEN** se devuelve el documento, incluido su `content`

#### Scenario: Post en draft por slug
- **WHEN** se solicita un Post en draft por slug con `getPostBySlug()`
- **THEN** no se devuelve

#### Scenario: Page publicada por slug
- **WHEN** se solicita una Page por slug con `getPageBySlug()` y está publicada
- **THEN** se devuelve el documento

#### Scenario: Page en draft por slug
- **WHEN** se solicita una Page en draft por slug con `getPageBySlug()`
- **THEN** no se devuelve

### Requirement: Related Posts vía DAL
El DAL SHALL exponer `getRelatedPosts()`, que devuelve Posts publicados con la misma `primaryCategory` que el Post dado, excluyendo ese mismo Post, ordenados por `publishedAt` descendente, sin cargar `content`.

#### Scenario: Se solicitan Posts relacionados
- **WHEN** se invoca `getRelatedPosts()` para un Article
- **THEN** el resultado nunca incluye el Post actual ni Posts en draft, y no incluye el campo `content`

### Requirement: La consulta de detalle de Article es la única que carga contenido completo
Las consultas de listado (`getPostsByCategory()`, `getRelatedPosts()`) SHALL seguir excluyendo `content`. Únicamente `getPostBySlug()` SHALL cargar `content` completo, con profundidad suficiente para resolver los Article Content Blocks anidados.

#### Scenario: Auditoría de consultas de listado
- **WHEN** se audita `getPostsByCategory()` o `getRelatedPosts()`
- **THEN** ninguna incluye el campo `content`

#### Scenario: Auditoría de la consulta de detalle
- **WHEN** se audita `getPostBySlug()`
- **THEN** incluye `content` con profundidad suficiente para resolver los Article Content Blocks anidados
