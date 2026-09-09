## Purpose

Define las reglas de acceso server-side base que protegen el contenido en Draft y los datos sensibles de `Users`, aplicadas siempre en el servidor y nunca dependientes de ocultar elementos de la interfaz de administración.

## Requirements

### Requirement: Lectura pública restringida a contenido publicado en Posts
La lectura pública (no autenticada) de `Posts` SHALL estar restringida a documentos con `_status: published`; los usuarios autenticados SHALL poder leer según su rol.

#### Scenario: Draft de Post no accesible públicamente
- **WHEN** una petición no autenticada intenta leer un Post en estado Draft
- **THEN** el Post no se devuelve

#### Scenario: usuario autenticado lee según su rol
- **WHEN** un usuario autenticado con permisos suficientes solicita un Post
- **THEN** el acceso se evalúa según su rol, sin la restricción de solo-publicado aplicada a peticiones anónimas

Referencia: AC-DRAFT-002, AC-DRAFT-003

### Requirement: Escritura de Posts requiere autenticación
Las peticiones no autenticadas SHALL NOT poder crear, actualizar ni eliminar `Posts`. Admin y Writer autenticados SHALL poder crear y actualizar `Posts`; solo Admin SHALL poder eliminarlos.

#### Scenario: creación no autenticada de un Post
- **WHEN** una petición no autenticada intenta crear un Post
- **THEN** la operación es rechazada

#### Scenario: eliminación no autenticada de un Post
- **WHEN** una petición no autenticada intenta eliminar un Post
- **THEN** la operación es rechazada

#### Scenario: Admin o Writer autenticado crea un Post
- **WHEN** un usuario autenticado con rol `admin` o `writer` crea un Post
- **THEN** la operación es permitida

#### Scenario: Writer intenta eliminar un Post
- **WHEN** un usuario autenticado con rol `writer` intenta eliminar un Post
- **THEN** la operación es rechazada

Referencia: AC-POST-001, AC-SEC-002

### Requirement: Lectura pública restringida a contenido publicado en Pages
La lectura pública (no autenticada) de `Pages` SHALL estar restringida a documentos con `_status: published`.

#### Scenario: Draft de Page no accesible públicamente
- **WHEN** una petición no autenticada intenta leer una Page en estado Draft
- **THEN** la Page no se devuelve

Referencia: §15 del Master Spec

### Requirement: Protección de datos sensibles de Users
Las peticiones no autenticadas a `Users` SHALL únicamente poder leer el conjunto público de campos (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`); los campos `email`, `role` y `active` SHALL NOT ser legibles sin autenticación.

#### Scenario: petición no autenticada a Users
- **WHEN** una petición no autenticada consulta un documento de `Users`
- **THEN** la respuesta no incluye `email`, `role` ni `active`

Referencia: AC-USER-008, §14.1 del Master Spec

### Requirement: Bloqueo de login para cuentas inactivas
El sistema SHALL impedir que un `User` con `active: false` obtenga un token de sesión válido al intentar autenticarse.

#### Scenario: intento de login con cuenta desactivada
- **WHEN** un `User` con `active: false` intenta autenticarse con credenciales válidas
- **THEN** la autenticación es rechazada y no se emite token de sesión

Referencia: AC-USER-005

### Requirement: Aplicación server-side, no solo ocultamiento de UI
Toda regla de acceso definida en esta capability SHALL aplicarse mediante control de acceso server-side de Payload; ocultar un elemento en el Admin UI SHALL NOT considerarse una forma válida de cumplir estas reglas.

#### Scenario: acceso directo a la API evita una restricción de UI
- **WHEN** se realiza una petición directa a la API (REST/GraphQL/Local API) que un elemento de UI oculto intentaría prevenir
- **THEN** la regla de acceso correspondiente igual se aplica y produce el mismo resultado que a través del Admin UI

Referencia: §7.4 del Master Spec
