## Purpose

Define los seis blocks de contenido embebidos en el editor Lexical de `Posts.content`, controlando la variedad de contenido enriquecido permitida sin abrir la puerta a HTML o estilos arbitrarios.

## ADDED Requirements

### Requirement: ImageBlock
El sistema SHALL definir un `ImageBlock` con `image` (relación a Media, requerido), `caption`, `credits` y `alignment` restringido a `normal`, `wide` o `full`.

#### Scenario: alignment fuera del conjunto permitido es rechazado
- **WHEN** se intenta guardar un `ImageBlock` con un `alignment` distinto de `normal`, `wide` o `full`
- **THEN** la operación es rechazada

Referencia: AC-BLOCK-IMG-001, AC-BLOCK-IMG-002

### Requirement: GalleryBlock
El sistema SHALL definir un `GalleryBlock` con un arreglo de al menos dos imágenes (cada una con `image` y `caption`) y un `layout` restringido a `grid` o `carousel`.

#### Scenario: layout soportado
- **WHEN** se configura un `GalleryBlock`
- **THEN** `layout` solo permite `grid` o `carousel`

Referencia: AC-BLOCK-GAL-001

### Requirement: VideoBlock
El sistema SHALL definir un `VideoBlock` con `provider` restringido a `youtube`, `vimeo` o `uploaded`, con campos condicionales según el provider (`url` o archivo subido), `poster` y `caption`.

#### Scenario: provider no soportado es rechazado
- **WHEN** se intenta guardar un `VideoBlock` con un `provider` distinto de `youtube`, `vimeo` o `uploaded`
- **THEN** la operación es rechazada

Referencia: AC-BLOCK-VID-001

### Requirement: QuoteBlock
El sistema SHALL definir un `QuoteBlock` con `quote` (requerido), `author` y `source`.

#### Scenario: cita sin quote es rechazada
- **WHEN** se intenta guardar un `QuoteBlock` sin `quote`
- **THEN** la operación es rechazada

Referencia: §10.4 del Master Spec

### Requirement: CalloutBlock
El sistema SHALL definir un `CalloutBlock` con `variant` restringido a `info`, `warning` o `important`, `title` y `content`.

#### Scenario: variant soportada
- **WHEN** se configura un `CalloutBlock`
- **THEN** `variant` solo permite `info`, `warning` o `important`

Referencia: §10.5 del Master Spec

### Requirement: EmbedBlock con providers controlados
El sistema SHALL definir un `EmbedBlock` con `provider` restringido a `instagram`, `x`, `tiktok` o `generic`, y `url`, SHALL NOT aceptar `<script>` crudo ni iframes arbitrarios.

#### Scenario: provider no controlado es rechazado
- **WHEN** se intenta guardar un `EmbedBlock` con un `provider` fuera del conjunto permitido
- **THEN** la operación es rechazada

Referencia: AC-EMBED-001
