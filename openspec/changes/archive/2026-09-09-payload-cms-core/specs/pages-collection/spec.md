## Purpose

Define el modelo de datos de `Pages`, usado para páginas institucionales administrables mediante un layout de blocks controlados, sin un builder visual de CSS libre.

## ADDED Requirements

### Requirement: Campos de Pages
La Collection `Pages` SHALL incluir `title`, `slug` (único, indexado), `layout` (arreglo de Page Blocks) y un grupo `seo`.

#### Scenario: crear una Page institucional
- **WHEN** un Admin crea una Page con `title` y `slug`
- **THEN** puede componer `layout` usando los Page Blocks definidos por el sistema

Referencia: §15 del Master Spec

### Requirement: Layout restringido a Page Blocks controlados
El campo `layout` de `Pages` SHALL aceptar únicamente los Page Blocks definidos por el sistema, sin permitir HTML, CSS o scripts arbitrarios.

#### Scenario: no existe opción de HTML libre
- **WHEN** se edita el `layout` de una Page
- **THEN** las únicas opciones disponibles son los Page Blocks definidos por el sistema

Referencia: AC-PAGE-004, AC-PAGE-005

### Requirement: Drafts y versiones
La Collection `Pages` SHALL tener `drafts: true` y `versions: true` habilitados.

#### Scenario: guardar un Draft de Page
- **WHEN** se guarda una Page incompleta
- **THEN** el Draft se guarda correctamente

Referencia: §15 del Master Spec
