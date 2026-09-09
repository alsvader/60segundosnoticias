## Purpose

Define los ocho blocks de layout disponibles para `Pages.layout`, permitiendo componer páginas institucionales sin un builder visual de CSS libre.

## ADDED Requirements

### Requirement: Hero
El sistema SHALL definir un block `Hero` con `eyebrow`, `title`, `description`, `image` y `alignment` restringido a `left` o `center`.

#### Scenario: alignment soportado
- **WHEN** se configura un `Hero`
- **THEN** `alignment` solo permite `left` o `center`

Referencia: §16.1 del Master Spec

### Requirement: RichText
El sistema SHALL definir un block `RichText` que reutiliza el mismo control de contenido enriquecido usado en Posts, sin aceptar HTML arbitrario.

#### Scenario: contenido enriquecido controlado
- **WHEN** se edita un block `RichText` dentro de una Page
- **THEN** no se acepta HTML crudo ni scripts

Referencia: §16 del Master Spec

### Requirement: ImageText
El sistema SHALL definir un block `ImageText` con `image`, `eyebrow`, `title`, `content` e `imagePosition` restringido a `left` o `right`.

#### Scenario: imagePosition soportada
- **WHEN** se configura un `ImageText`
- **THEN** `imagePosition` solo permite `left` o `right`

Referencia: §16.2 del Master Spec

### Requirement: Gallery
El sistema SHALL definir un block `Gallery` para Pages con la misma estructura controlada que el `GalleryBlock` de artículos.

#### Scenario: galería en una Page
- **WHEN** se agrega un block `Gallery` a una Page
- **THEN** solo acepta imágenes con `caption`, sin campos de estilo libre

Referencia: §16 del Master Spec

### Requirement: Video
El sistema SHALL definir un block `Video` para Pages con la misma estructura controlada de providers que el `VideoBlock` de artículos.

#### Scenario: provider controlado en Page
- **WHEN** se configura un block `Video` en una Page
- **THEN** el `provider` está restringido al mismo conjunto que el `VideoBlock` de artículos

Referencia: §16 del Master Spec

### Requirement: CTA
El sistema SHALL definir un block `CTA` con título, descripción y un enlace de llamada a la acción.

#### Scenario: CTA con enlace
- **WHEN** se configura un block `CTA`
- **THEN** puede definirse su texto y enlace de destino

Referencia: §16 del Master Spec

### Requirement: FAQ
El sistema SHALL definir un block `FAQ` con un arreglo de ítems, cada uno con `question` y `answer`.

#### Scenario: agregar preguntas frecuentes
- **WHEN** se configura un block `FAQ`
- **THEN** se pueden agregar múltiples ítems de `question`/`answer`

Referencia: §16.3 del Master Spec

### Requirement: Banner
El sistema SHALL definir un block `Banner` con `title`, `description`, `image`, `linkLabel`, enlace de destino y `variant` restringido a `editorial`, `promotional` o `dark`.

#### Scenario: variant soportada
- **WHEN** se configura un `Banner`
- **THEN** `variant` solo permite `editorial`, `promotional` o `dark`

Referencia: §26 del Master Spec (mismo conjunto de variantes que el Banner de Home, reutilizado aquí para Pages)
