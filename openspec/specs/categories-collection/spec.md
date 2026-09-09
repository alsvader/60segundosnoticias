## Purpose

Define la Collection `Categories`, la taxonomía editorial principal del sitio, con identidad visual controlada (colorTheme/icon) en vez de estilos arbitrarios.

## Requirements

### Requirement: Campos de Categories
La Collection `Categories` SHALL incluir `name` (requerido, único), `slug` (requerido, único, indexado), `description`, `colorTheme`, `icon`, `image`, `showInNavigation`, `showOnHome`, `order` y un grupo `seo`.

#### Scenario: crear una categoría completa
- **WHEN** un Admin crea una Category con `name` y `slug`
- **THEN** el resto de los campos definidos pueden completarse

Referencia: §11 del Master Spec

### Requirement: colorTheme e icon controlados
Los campos `colorTheme` e `icon` de `Categories` SHALL restringirse a un conjunto cerrado de keys semánticas definidas por el sistema, sin aceptar valores de color arbitrarios ni SVG arbitrario.

#### Scenario: valor de theme fuera del conjunto permitido es rechazado
- **WHEN** se intenta guardar una Category con un `colorTheme` que no está en el conjunto controlado
- **THEN** la operación es rechazada

Referencia: AC-CAT-003, AC-CAT-004

### Requirement: Acceso a Categories
Admin SHALL poder crear, editar y eliminar `Categories`; Writer SHALL NOT poder administrar `Categories`.

#### Scenario: Writer intenta crear una Category
- **WHEN** un usuario con rol `writer` intenta crear una Category
- **THEN** la operación es rechazada por control de acceso server-side

Referencia: AC-CAT-001, AC-CAT-005
