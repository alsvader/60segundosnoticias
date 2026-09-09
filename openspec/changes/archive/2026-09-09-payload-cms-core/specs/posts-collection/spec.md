## Purpose

Define el modelo de datos de `Posts`, el contenido editorial principal del sitio, incluyendo sus relaciones, contenido enriquecido con blocks controlados y campos SEO — sin automatización de ciclo de vida editorial, que corresponde a una fase posterior.

## ADDED Requirements

### Requirement: Campos generales de Posts
La Collection `Posts` SHALL incluir `title`, `slug` (único, indexado), `excerpt`, `featuredImage` (relación a `Media`), `source` y `photoCredits`.

#### Scenario: crear un Post con campos generales
- **WHEN** se crea un Post
- **THEN** puede completar `title`, `slug`, `excerpt`, `featuredImage`, `source` y `photoCredits`

Referencia: §9.2 del Master Spec

### Requirement: Relaciones editoriales de Posts
La Collection `Posts` SHALL incluir `primaryCategory` (relación única a `Categories`, indexada), `additionalCategories` (relación múltiple a `Categories`), `tags` (relación múltiple a `Tags`) y `author` (relación a `Users`, indexada).

#### Scenario: asignar categoría primaria y adicionales
- **WHEN** se crea un Post con `primaryCategory` y `additionalCategories`
- **THEN** ambas relaciones se guardan correctamente y son independientes entre sí

Referencia: §9.2, AC-CAT-007, AC-CAT-008

### Requirement: Contenido enriquecido con blocks controlados
El campo `content` de `Posts` SHALL usar Lexical Rich Text configurado para permitir únicamente los Article Content Blocks definidos por el sistema, y SHALL NOT aceptar HTML ni scripts arbitrarios.

#### Scenario: insertar un block soportado
- **WHEN** se edita `content` de un Post
- **THEN** solo los Article Content Blocks definidos por el sistema están disponibles para insertar

Referencia: AC-CONTENT-001, AC-CONTENT-004, AC-CONTENT-005

### Requirement: Campos editoriales estructurales
La Collection `Posts` SHALL incluir `publishedAt` (fecha, indexada), `featured` (checkbox, default `false`) y `readingTimeMinutes` (numérico, no editable manualmente en el formulario).

#### Scenario: readingTimeMinutes no es editable manualmente
- **WHEN** un usuario abre el formulario de edición de un Post
- **THEN** el campo `readingTimeMinutes` se muestra como solo lectura

Referencia: AC-READ-002 (el cálculo automático del valor es Phase 3)

### Requirement: SEO de Posts
La Collection `Posts` SHALL incluir un grupo `seo` reutilizable con `metaTitle`, `metaDescription`, `metaImage`, `canonicalURL` y `noIndex`.

#### Scenario: grupo SEO disponible
- **WHEN** se edita un Post
- **THEN** el grupo `seo` con sus campos está disponible

Referencia: §9.4 del Master Spec

### Requirement: Drafts y versiones
La Collection `Posts` SHALL tener `drafts: true` y `versions: true` habilitados, usando el `_status` nativo de Payload sin un campo `status` manual redundante.

#### Scenario: guardar un Draft incompleto
- **WHEN** se guarda un Post sin todos los campos requeridos para publicación
- **THEN** el Draft se guarda correctamente

Referencia: AC-VER-001, AC-DRAFT-001
