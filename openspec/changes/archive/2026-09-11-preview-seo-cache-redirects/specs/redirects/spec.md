## Purpose

Resuelve URLs históricas en tiempo de ejecución mediante la Collection `Redirects` y genera automáticamente redirects cuando cambia la URL canónica pública de un Post, una Category o una Page.

## ADDED Requirements

### Requirement: Resolución de redirect solo tras un miss de ruta válida
El sistema SHALL consultar `Redirects` únicamente después de que la resolución normal de Category, Page o Article no produzca una ruta válida. Una ruta actualmente válida SHALL NOT ser eclipsada por un Redirect histórico bajo ninguna circunstancia.

#### Scenario: La URL solicitada corresponde a una Category vigente
- **WHEN** se solicita una URL que resuelve a una Category actualmente vigente
- **THEN** se sirve la Category, sin siquiera consultar `Redirects`

#### Scenario: La URL solicitada no resuelve a ninguna ruta vigente
- **WHEN** ninguna Category, Page o Post vigente resuelve la URL solicitada
- **THEN** el sistema consulta `Redirects` antes de responder 404

Referencia: §32.2, §32.3 del Master Spec

### Requirement: Lookup interno acotado, fuera del boundary público del DAL
El sistema SHALL exponer una función server-only dedicada a esta consulta, distinta de las funciones públicas del DAL (`overrideAccess: false`). Esta función SHALL limitarse a una búsqueda exacta por `from` normalizado entre redirects activos, SHALL proyectar únicamente los campos necesarios (`to`, `statusCode`) y SHALL NOT exponer el documento completo de `Redirects` a ningún componente. Esta excepción SHALL NOT generalizarse a otras consultas públicas.

#### Scenario: Se resuelve una URL antigua
- **WHEN** se busca un redirect activo para una URL antigua
- **THEN** el resultado expone únicamente destino y código de estado, no el documento completo

### Requirement: Generación automática por cambio de Post
Cambiar el `slug` y/o `primaryCategory` de un Post publicado SHALL crear un redirect de la URL anterior a la nueva URL. Un cambio simultáneo de `slug` y `primaryCategory` SHALL producir un único redirect directo de la URL original a la URL final, sin salto intermedio.

#### Scenario: Cambio de slug de un Post publicado
- **WHEN** se cambia el `slug` de un Post publicado
- **THEN** se crea un redirect de la URL anterior a la nueva URL

#### Scenario: Cambio simultáneo de slug y categoría
- **WHEN** se cambian `slug` y `primaryCategory` de un Post publicado en la misma operación
- **THEN** se crea un único redirect directo de la URL original a la URL final, no dos redirects encadenados

Referencia: §17.1 del Master Spec, AC-REDIR-001, AC-REDIR-003

### Requirement: Generación automática por cambio de Category
Cambiar el `slug` de una Category publicada SHALL crear un redirect para la URL de la propia Category y SHALL cascadear un redirect adicional por cada Post publicado cuya `primaryCategory` sea esa Category, preservando su URL anterior.

#### Scenario: Cambio de slug de una Category con Posts publicados
- **WHEN** se cambia el `slug` de una Category que tiene Posts publicados con esa `primaryCategory`
- **THEN** se crea un redirect para la URL de la Category y un redirect adicional por cada uno de esos Posts

Referencia: §30.10 del Master Spec, AC-REDIR-002

### Requirement: Generación automática por cambio de Page
Cambiar el `slug` de una Page publicada SHALL crear un redirect de la URL anterior de la Page a su nueva URL.

#### Scenario: Cambio de slug de una Page publicada
- **WHEN** se cambia el `slug` de una Page publicada
- **THEN** se crea un redirect de la URL anterior a la nueva URL de esa Page

Referencia: §17.1 y §30.10 del Master Spec (alcance de Page aprobado explícitamente para esta change)

### Requirement: Sin redirect automático en eliminación
Eliminar un Post, una Category o una Page SHALL NOT crear ningún redirect automático.

#### Scenario: Se elimina un Post publicado
- **WHEN** se elimina un Post publicado
- **THEN** no se crea ningún redirect para su URL anterior

Referencia: §17.1, §30.8 del Master Spec, AC-REDIR-005

### Requirement: Aplanado de cadenas de redirect
Al crear un redirect cuyo destino (`to`) coincide con el `from` de un redirect activo ya existente, el sistema SHALL almacenar como destino el destino final de esa cadena, en vez de encadenar saltos intermedios.

#### Scenario: Se crea un redirect hacia un origen ya redirigido
- **WHEN** se crea un redirect `A → B` y ya existe un redirect activo `B → C`
- **THEN** el sistema almacena `A → C`, y el redirect `B → C` permanece sin cambios

Referencia: §17.1 del Master Spec, AC-REDIR-004

### Requirement: Prevención de auto-redirect y ciclos
El sistema SHALL rechazar la creación o actualización de un redirect cuyo `to` sea igual a su propio `from`, y SHALL prevenir la introducción de un ciclo de redirects.

#### Scenario: Se intenta crear un redirect hacia sí mismo
- **WHEN** se intenta guardar un redirect cuyo `to` es igual a su `from`
- **THEN** la operación se rechaza

#### Scenario: Una URL cambia y luego vuelve a su valor original
- **WHEN** la URL canónica de un Post/Category/Page cambia (creando un redirect `A → B`) y luego vuelve a cambiar de regreso a la original (`B → A`)
- **THEN** el sistema desactiva el redirect `A → B` existente (nunca lo elimina) — `A` vuelve a ser una ruta vigente y ningún redirect activo SHALL apuntar desde ella — y crea un nuevo redirect activo `B → A` para que una URL antigua de `B` siga resolviendo al contenido vigente
