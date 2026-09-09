## Purpose

Define la Collection `Tags`, una taxonomía editorial simple y de bajo costo para clasificar Posts.

## ADDED Requirements

### Requirement: Campos de Tags
La Collection `Tags` SHALL incluir `name` y `slug`, ambos únicos cuando corresponda.

#### Scenario: crear un Tag
- **WHEN** se crea un Tag con `name`
- **THEN** el `slug` correspondiente queda definido y es único

Referencia: §12 del Master Spec

### Requirement: Acceso a Tags
La lectura de `Tags` SHALL ser pública; Writer SHALL poder leer y crear `Tags` pero no eliminarlos; Admin SHALL tener CRUD completo.

#### Scenario: Writer crea un Tag nuevo
- **WHEN** un usuario con rol `writer` autenticado crea un Tag
- **THEN** la operación es permitida

#### Scenario: Writer intenta eliminar un Tag
- **WHEN** un usuario con rol `writer` intenta eliminar un Tag
- **THEN** la operación es rechazada por control de acceso server-side

Referencia: AC-TAG-002, AC-TAG-003
