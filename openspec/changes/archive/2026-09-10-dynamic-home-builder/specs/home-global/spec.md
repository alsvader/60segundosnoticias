## Purpose

Define el Payload Global `Home`: el punto de configuración administrable que determina qué secciones aparecen en la portada pública y en qué orden, sin requerir un deploy de código.

## ADDED Requirements

### Requirement: Home administrable exclusivamente por Admin
El sistema SHALL definir un Global `Home` cuyo campo `layout` acepte agregar, eliminar, reordenar y configurar bloques desde Payload Admin. Solo un usuario con rol `admin` SHALL poder escribir el Global `Home`; un `writer` SHALL NOT poder modificarlo.

#### Scenario: Admin reordena los bloques de Home
- **WHEN** un Admin cambia el orden de los bloques en `layout` y guarda
- **THEN** la operación se completa y el nuevo orden queda persistido

#### Scenario: Writer intenta modificar Home
- **WHEN** un usuario con rol `writer` intenta actualizar el Global `Home`
- **THEN** la operación es rechazada por control de acceso server-side

Referencia: AC-HOME-001, AC-HOME-002, AC-HOME-003, AC-HOME-004, AC-HOME-006, §7.2, §7.3 del Master Spec

### Requirement: Home restringe layout a bloques predefinidos, sin CSS/HTML arbitrario
El campo `layout` de `Home` SHALL aceptar únicamente los tipos de bloque definidos por el sistema (`EditorialIntro`, `HeroNews`, `CategoryExplorer`, `LatestPosts`, `PostsByCategory`, `FeaturedPosts`, `VideoFeature`, `Banner`). El Global `Home` SHALL NOT exponer un campo de CSS, clases Tailwind o HTML arbitrario editable desde el CMS.

#### Scenario: Se revisa el schema de Home en Payload Admin
- **WHEN** un Admin abre el editor de bloques de `Home`
- **THEN** solo puede insertar uno de los 7 tipos de bloque definidos, sin ningún campo de estilo o markup libre

Referencia: AC-HOME-007, §19 del Master Spec

### Requirement: Home publicado refleja exactamente el orden guardado
Al guardar/publicar un cambio en `layout`, el estado publicado de `Home` SHALL reflejar exactamente el nuevo orden y conjunto de bloques, sin requerir un cambio de código ni un rebuild.

#### Scenario: Publish después de reordenar
- **WHEN** un Admin reordena bloques y publica el cambio
- **THEN** una lectura pública inmediata de `Home` devuelve los bloques en el nuevo orden

Referencia: AC-HOME-005, AC-HOME-006

### Requirement: Home soporta versionado sin exponer estado no publicado públicamente
El Global `Home` SHALL configurarse con `versions: { drafts: true }`. La lectura pública de `Home` SHALL devolver únicamente el estado publicado; un Draft guardado SHALL NOT afectar la respuesta pública hasta que se publique.

#### Scenario: Admin guarda un Draft de Home sin publicar
- **WHEN** un Admin modifica y guarda `Home` como Draft, sin publicar
- **THEN** una lectura pública de `Home` sigue devolviendo el estado publicado anterior

Referencia: AC-HOME-017 (capacidad de schema; la funcionalidad de Preview/Draft Mode es Fase 8, fuera de alcance de esta capability)

### Requirement: SEO override opcional en Home
El Global `Home` SHALL incluir un grupo `seo` opcional. Si no se configura, el sistema SHALL poder usar los valores por defecto de `SiteSettings` en fases posteriores; esta capability solo garantiza que el campo existe y es opcional.

#### Scenario: Home sin override de SEO
- **WHEN** un Admin guarda `Home` sin completar el grupo `seo`
- **THEN** la operación se completa sin error, y el Global queda sin override de SEO

Referencia: §19, §41.4 del Master Spec

### Requirement: Lectura pública de Home
Cualquier petición no autenticada SHALL poder leer el estado publicado del Global `Home`.

#### Scenario: Petición no autenticada lee Home
- **WHEN** una petición no autenticada solicita el Global `Home`
- **THEN** el estado publicado se devuelve sin requerir autenticación

Referencia: AC-HOME-001, patrón ya usado por `Navigation`/`Footer`/`SiteSettings`
