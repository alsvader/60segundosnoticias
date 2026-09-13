## Purpose

Define el modelo de datos de `Redirects`, la base estructural para las redirecciones del sitio. La generación automática de registros y su resolución en runtime viven en la capability `redirects`.

## Requirements

### Requirement: Campos de Redirects
La Collection `Redirects` SHALL incluir `from` (texto, indexado), `to` (texto), `statusCode` (selección de códigos de redirección soportados) y `active` (checkbox).

#### Scenario: crear un redirect manual
- **WHEN** un Admin crea un Redirect con `from`, `to` y `statusCode`
- **THEN** el registro se guarda correctamente

Referencia: §17 del Master Spec

### Requirement: `from` único e indexado
El campo `from` de `Redirects` SHALL ser único e indexado.

#### Scenario: no se permiten dos redirects con el mismo origen
- **WHEN** se intenta crear un segundo Redirect con el mismo valor de `from` que uno existente
- **THEN** la operación es rechazada

Referencia: §17 del Master Spec

### Requirement: Acceso a Redirects
Solo Admin SHALL poder crear, editar y eliminar `Redirects`.

#### Scenario: Writer intenta crear un Redirect
- **WHEN** un usuario con rol `writer` intenta crear un Redirect
- **THEN** la operación es rechazada por control de acceso server-side

Referencia: §7.2 del Master Spec
