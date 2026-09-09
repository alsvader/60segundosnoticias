## Purpose

Garantiza que la autoría de un Post se determine y proteja del lado del servidor, para que un Writer solo controle sus propios Posts y no pueda modificar la autoría ni el contenido de otro Writer.

## Requirements

### Requirement: Asignación automática de autor al crear
Cuando un Writer crea un Post, el sistema SHALL asignar automáticamente `author` al usuario autenticado que realiza la petición, ignorando cualquier valor de `author` enviado explícitamente por el cliente.

#### Scenario: Writer crea un Post
- **WHEN** un usuario con rol `writer` crea un Post
- **THEN** el `author` del Post creado es ese usuario, independientemente del valor de `author` enviado en la petición

Referencia: AC-POST-002

### Requirement: Writer no puede reasignar el autor
Un usuario con rol `writer` SHALL NOT poder cambiar el campo `author` de un Post existente, incluido el suyo propio.

#### Scenario: Writer intenta cambiar el autor de su propio Post
- **WHEN** un Writer envía una actualización de su Post con un `author` distinto al actual
- **THEN** el `author` del Post permanece sin cambios

Referencia: AC-POST-003

### Requirement: Admin puede asignar y reasignar el autor
Un usuario con rol `admin` SHALL poder establecer o cambiar libremente el campo `author` de cualquier Post.

#### Scenario: Admin reasigna el autor de un Post
- **WHEN** un Admin actualiza un Post estableciendo un `author` distinto
- **THEN** el nuevo `author` se guarda

Referencia: AC-POST-004

### Requirement: Escritura de Posts restringida a los propios del Writer
Un Writer SHALL solo poder actualizar, publicar, despublicar o eliminar Posts cuyo `author` sea el propio Writer; esta restricción SHALL aplicarse mediante control de acceso server-side de Payload, no solo ocultando opciones en el Admin UI.

#### Scenario: Writer intenta editar el Post de otro Writer
- **WHEN** un Writer A envía una petición de actualización (REST, GraphQL o Local API) sobre un Post cuyo `author` es un Writer B
- **THEN** la operación es rechazada

#### Scenario: Writer edita su propio Post
- **WHEN** un Writer envía una actualización sobre un Post cuyo `author` es él mismo
- **THEN** la operación es permitida (sujeta a las demás reglas de la Collection)

Referencia: AC-PERM-001, AC-PERM-002, AC-PERM-003
