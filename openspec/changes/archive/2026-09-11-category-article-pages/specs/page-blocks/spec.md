## MODIFIED Requirements

### Requirement: CTA
El sistema SHALL definir un block `CTA` con `title`, `description` y un enlace `link` sobre el modelo reutilizable de enlace (`linkFields`, el mismo usado por `Banner`, `HeroNews` y `EditorialIntro`), permitiendo elegir Category, Page o External en vez de una URL de texto libre.

#### Scenario: CTA con enlace
- **WHEN** se configura un block `CTA`
- **THEN** su enlace se define eligiendo Category, Page o External, igual que en `Banner`

#### Scenario: Migración de datos existentes
- **WHEN** una Page ya tenía un `CTA` con los campos previos `linkLabel`/`linkURL`
- **THEN** su valor se preserva, transformado al nuevo campo `link` con `type: external` y la misma URL, sin perder el contenido existente

Referencia: §16 del Master Spec
