## Purpose

Define el modelo de datos de las personas autoras del sitio (Collection `Users`), separando los datos públicos/editoriales de los datos administrativos, como base para el resto de las Collections editoriales.

## Requirements

### Requirement: Roles de usuario
La Collection `Users` SHALL definir un campo `role` con exactamente los valores `admin` y `writer`.

#### Scenario: roles disponibles
- **WHEN** se crea o edita un `User`
- **THEN** el campo `role` solo permite los valores `admin` o `writer`

Referencia: AC-USER-001

### Requirement: Campos públicos/editoriales
La Collection `Users` SHALL incluir los campos `name`, `displayName`, `slug`, `avatar`, `bio` y `socialLinks` como datos editoriales de la persona autora.

#### Scenario: perfil editorial completo
- **WHEN** se crea un `User`
- **THEN** puede completar `name`, `displayName`, `slug`, `avatar`, `bio` y `socialLinks`

Referencia: §14 del Master Spec

### Requirement: Campos administrativos
La Collection `Users` SHALL incluir los campos administrativos `email` (usado por autenticación), `role` y `active` (checkbox, default `true`), sin exponerlos como parte del perfil editorial público.

#### Scenario: campos administrativos existen en el schema
- **WHEN** se inspecciona el schema de `Users`
- **THEN** existen los campos `email`, `role` y `active`, distintos de los campos editoriales públicos

Referencia: §14 del Master Spec

### Requirement: Autenticación nativa de Payload
La Collection `Users` SHALL ser una Payload Auth Collection (`auth: true`), reemplazando la Collection `users` mínima que Payload genera automáticamente cuando no existe ninguna Collection con autenticación.

#### Scenario: login funcional tras registrar Users
- **WHEN** existe al menos un documento en `Users` con credenciales válidas
- **THEN** esa persona puede autenticarse en el panel de administración de Payload usando la Collection `Users`

Referencia: AC-SEC-001

### Requirement: Eliminación de Users bloqueada mientras existan Posts que los referencian
El sistema SHALL rechazar la eliminación de un `User` mientras existan Posts cuyo `author` sea ese `User`; un Admin SHALL reasignar esos Posts a otro autor antes de poder eliminarlo.

#### Scenario: intentar eliminar un User con Posts propios
- **WHEN** un Admin intenta eliminar un `User` que es `author` de al menos un Post
- **THEN** la eliminación es rechazada

#### Scenario: eliminar un User sin Posts propios
- **WHEN** un Admin elimina un `User` que no es `author` de ningún Post
- **THEN** la eliminación se completa

Referencia: §14.2 del Master Spec
