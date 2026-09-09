## ADDED Requirements

### Requirement: Ownership de Media
La Collection `Media` SHALL registrar qué `User` subió cada archivo; un Writer SHALL solo poder editar la metadata (`alt`, `caption`, `credits`, `description`) de los archivos que él mismo subió; un Admin SHALL poder editar la metadata de cualquier archivo.

#### Scenario: Writer edita metadata de su propio upload
- **WHEN** un Writer actualiza la metadata de un archivo de Media que él mismo subió
- **THEN** la operación es permitida

#### Scenario: Writer intenta editar metadata de Media subida por otro Writer
- **WHEN** un Writer intenta actualizar la metadata de un archivo de Media subido por otro Writer
- **THEN** la operación es rechazada

Referencia: §13.3 del Master Spec
