## MODIFIED Requirements

### Requirement: Generación inicial de slug desde el título
Al crear un documento sin `slug` en una Collection con slug (`Posts`, `Pages`, `Categories`, `Tags`, `Users`), el sistema SHALL generar un `slug` normalizado a partir de su campo fuente: `title` en `Posts` y `Pages`, `name` en `Categories` y `Tags`, y `displayName` en `Users`. La normalización quita acentos y diacríticos, pasa a minúsculas, cambia espacios y caracteres inválidos por un solo guion y quita los guiones de los extremos. El admin SHALL permitir guardar el documento sin escribir el `slug` a mano.

#### Scenario: crear un Post sin slug explícito
- **WHEN** un Writer o Admin crea un Post con `title: "Política Económica ¡Hoy!"` sin `slug`
- **THEN** el sistema asigna `slug: "politica-economica-hoy"`

#### Scenario: crear una Category, Tag, Page o User sin slug explícito
- **WHEN** se crea una Category o un Tag con `name`, una Page con `title` o un User con `displayName`, sin `slug`
- **THEN** el sistema asigna un `slug` derivado y normalizado de ese campo fuente

#### Scenario: guardar desde el admin sin escribir el slug
- **WHEN** un editor llena solo el campo fuente en el admin de Payload y guarda
- **THEN** el documento se guarda sin error de validación en `slug` y el `slug` generado aparece en el documento

Referencia: AC-SLUG-001, AC-SLUG-005, §9.5 del Master Spec

### Requirement: El slug no se regenera al editar el título
Una vez que un documento de una Collection con slug fue creado con un `slug` no vacío, editar su campo fuente SHALL NOT modificar el `slug` existente.

#### Scenario: editar el título de un Post ya publicado o en draft
- **WHEN** se edita el `title` de un Post que ya tiene `slug`
- **THEN** el `slug` permanece sin cambios

#### Scenario: editar el nombre de una Category existente
- **WHEN** se edita el `name` de una Category que ya tiene `slug`
- **THEN** el `slug` permanece sin cambios

#### Scenario: documentos existentes antes de este cambio
- **WHEN** se edita el campo fuente de un documento creado antes de que existiera la generación automática
- **THEN** su `slug` permanece sin cambios

Referencia: AC-SLUG-003

### Requirement: El slug permanece editable explícitamente
Un usuario autorizado a editar el documento SHALL poder modificar manualmente el `slug` en cualquier momento. Un `slug` indicado explícitamente al crear SHALL respetarse en lugar del generado.

#### Scenario: edición manual del slug
- **WHEN** un usuario autorizado modifica explícitamente el campo `slug` de un documento
- **THEN** el nuevo valor se guarda

#### Scenario: slug explícito al crear
- **WHEN** se crea un documento con `title` y un `slug` explícito válido
- **THEN** se guarda el `slug` explícito y no el derivado del título

Referencia: AC-SLUG-004

## ADDED Requirements

### Requirement: El slug generado no se repite
Cuando el sistema genera un `slug` desde el campo fuente y el valor ya existe en la misma Collection, el sistema SHALL agregar el primer sufijo numérico libre (`-2`, `-3`, …) en lugar de rechazar la operación. Un `slug` indicado explícitamente SHALL NOT recibir sufijo automático; si choca, la operación se rechaza por unicidad.

#### Scenario: dos Posts con el mismo título
- **WHEN** ya existe un Post con `slug: "sismo-en-cdmx"` y se crea otro Post con `title: "Sismo en CDMX"` sin `slug`
- **THEN** el nuevo Post recibe `slug: "sismo-en-cdmx-2"`

#### Scenario: slug explícito duplicado
- **WHEN** se crea un Tag con un `slug` explícito que ya usa otro Tag
- **THEN** la operación es rechazada

### Requirement: Formato válido del slug
Un `slug` guardado SHALL contener solo letras minúsculas `a-z`, dígitos y guiones simples entre segmentos, sin guiones al inicio ni al final. Un `slug` explícito al crear SHALL normalizarse con las mismas reglas que el generado. Al editar, un `slug` con formato inválido SHALL rechazarse.

#### Scenario: slug explícito al crear se normaliza
- **WHEN** se crea un documento con `slug: "Mi Slug!"`
- **THEN** se guarda `slug: "mi-slug"`

#### Scenario: editar el slug con formato inválido
- **WHEN** un usuario edita el `slug` de un documento existente a `"Mi Slug!"`
- **THEN** la operación es rechazada con un mensaje de validación sobre el formato del slug
