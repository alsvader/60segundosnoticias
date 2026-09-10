## Purpose

Define cómo el sistema obtiene y resuelve el contenido configurado en el Global `Home` hacia un contrato frontend-safe, preservando el límite de seguridad de datos públicos ya establecido por la Data Access Layer.

## Requirements

### Requirement: getHome() usa el límite de acceso público existente
El DAL SHALL exponer `getHome()`, que lee el Global `Home` con `overrideAccess: false`, usando el mismo helper de acceso público compartido que el resto de los Globals.

#### Scenario: La página de inicio obtiene el layout de Home
- **WHEN** la página pública `/` necesita el layout configurado de Home
- **THEN** invoca `getHome()`, que lee el Global `Home` con `overrideAccess: false`

Referencia: §32.1 del Master Spec

### Requirement: Selección automática de Posts excluye siempre contenido no publicado
Toda consulta automática usada por un bloque de Home (`LatestPosts`, `PostsByCategory`, `HeroNews` en modo automático) SHALL restringirse a Posts con `_status: published`, sin excepción.

#### Scenario: Post recién despublicado desaparece de un bloque automático
- **WHEN** un Post que aparecía en una consulta automática de Home es despublicado
- **THEN** una resolución posterior de ese bloque ya no lo incluye

Referencia: AC-DRAFT-003, AC-HOME-015

### Requirement: Selección manual de Posts se revalida en el momento de resolución
Toda relación manual de Home hacia un Post (`HeroNews.mainPost`/`secondaryPosts` en modo manual, `FeaturedPosts.posts`, `VideoFeature.post` cuando `source: post`) SHALL revalidarse contra el estado publicado del Post en el momento de resolver Home, sin depender únicamente de que el Admin haya seleccionado un Post válido en su momento.

#### Scenario: Post seleccionado manualmente es despublicado después de configurarse
- **WHEN** un Post referenciado manualmente en un bloque de Home pasa a estado Draft
- **THEN** el resolver de ese bloque lo excluye del resultado, sin exponerlo públicamente

#### Scenario: Todos los Posts de una selección manual quedan no publicados
- **WHEN** cada Post seleccionado manualmente en un bloque queda no publicado
- **THEN** el bloque resuelve a una lista vacía, sin causar un error de resolución

Referencia: AC-DRAFT-003, AC-HOME-016

### Requirement: PostsByCategory usa membership inclusivo de categoría
Al resolver `PostsByCategory`, un Post publicado SHALL considerarse miembro de la categoría configurada cuando `primaryCategory` es igual a esa categoría, o cuando esa categoría está incluida en `additionalCategories`.

#### Scenario: Post asociado por additionalCategories aparece en PostsByCategory
- **WHEN** un Post publicado tiene la categoría configurada únicamente en `additionalCategories` (no como `primaryCategory`)
- **THEN** el bloque `PostsByCategory` de esa categoría lo incluye en su resultado

Referencia: AC-FE-CAT-003 (semántica de membership compartida con la futura Category Page de Fase 7)

### Requirement: Consultas de Home evitan sobre-consulta
Toda consulta de listado/tarjeta usada por un bloque de Home SHALL excluir el campo `content` (Lexical) completo de Posts y SHALL usar la profundidad de relación mínima necesaria para poblar `featuredImage`, `primaryCategory` y `author`.

#### Scenario: Se resuelve un bloque LatestPosts
- **WHEN** el resolver de `LatestPosts` consulta Posts publicados
- **THEN** la consulta no incluye el campo `content` completo

Referencia: AC-MEDIA-004, AC-PERF-005

### Requirement: VideoFeature con fuente externa restringe el proveedor de video
Cuando `VideoFeature.source` es `external`, el sistema SHALL validar server-side que la URL configurada pertenezca a un proveedor permitido (YouTube o Vimeo, por dominio), y SHALL normalizar la URL aceptada hacia un contrato de video frontend-safe. Una URL de un dominio no permitido SHALL NOT resolverse a un embed renderizable.

#### Scenario: URL externa de un proveedor no permitido
- **WHEN** `VideoFeature.source` es `external` y la URL configurada no pertenece a YouTube ni a Vimeo
- **THEN** el bloque se resuelve sin un embed renderizable, sin aceptar la URL como iframe arbitrario

#### Scenario: URL externa de YouTube válida
- **WHEN** `VideoFeature.source` es `external` y la URL configurada es una URL de YouTube válida
- **THEN** el resolver la normaliza a un contrato de video frontend-safe consumible por `VideoFeatureSection`

Referencia: AC-EMBED-001, AC-HOME-013
