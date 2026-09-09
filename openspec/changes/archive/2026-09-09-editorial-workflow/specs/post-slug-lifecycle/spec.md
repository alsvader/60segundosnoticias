## Purpose

Garantiza que el slug de un Post se genere automáticamente desde el título al crearse y permanezca estable frente a ediciones posteriores del título, evitando URLs editoriales que cambian solas.

## ADDED Requirements

### Requirement: Generación inicial de slug desde el título
Al crear un Post sin `slug`, el sistema SHALL generar un `slug` normalizado (sin acentos, espacios ni caracteres inválidos) a partir de `title`.

#### Scenario: crear un Post sin slug explícito
- **WHEN** un Writer o Admin crea un Post con `title` pero sin `slug`
- **THEN** el sistema asigna un `slug` derivado y normalizado de `title`

Referencia: AC-SLUG-001, AC-SLUG-005

### Requirement: El slug no se regenera al editar el título
Una vez que un Post tiene un `slug` no vacío, editar `title` SHALL NOT modificar el `slug` existente.

#### Scenario: editar el título de un Post ya publicado o en draft
- **WHEN** se edita el `title` de un Post que ya tiene `slug`
- **THEN** el `slug` permanece sin cambios

Referencia: AC-SLUG-003

### Requirement: El slug permanece editable explícitamente
Un usuario autorizado a editar el Post SHALL poder modificar manualmente el `slug` en cualquier momento.

#### Scenario: edición manual del slug
- **WHEN** un usuario autorizado modifica explícitamente el campo `slug` de un Post
- **THEN** el nuevo valor se guarda

Referencia: AC-SLUG-004
