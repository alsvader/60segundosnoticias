## Purpose

Mantiene un índice de búsqueda dedicado y sincronizado (Payload Search Plugin sobre PostgreSQL) para Posts y Pages publicados, sin exponer nunca contenido en Draft ni depender de un servicio de búsqueda externo.

## Requirements

### Requirement: Solo Posts y Pages publicados se indexan
El sistema SHALL sincronizar al índice de búsqueda únicamente Posts y Pages con estado publicado. Categories SHALL NOT tener documentos de Search independientes.

#### Scenario: Post publicado se indexa
- **WHEN** un Post pasa a estado publicado
- **THEN** aparece un registro correspondiente en el índice de búsqueda

#### Scenario: Page publicada se indexa
- **WHEN** una Page pasa a estado publicado
- **THEN** aparece un registro correspondiente en el índice de búsqueda

#### Scenario: Draft nunca publicado no se indexa
- **WHEN** se crea o edita un Post/Page que nunca ha sido publicado
- **THEN** no se sincroniza ningún registro al índice de búsqueda

#### Scenario: Category no aparece como documento de Search
- **WHEN** se crea, actualiza o publica una Category
- **THEN** no se genera ningún registro de Search correspondiente a esa Category

Referencia: AC-SEARCH-004, AC-SEARCH-008, AC-SEARCH-015, AC-SEARCH-016.

### Requirement: Ediciones en Draft de contenido ya publicado no contaminan el índice
El sistema SHALL preservar el último registro de búsqueda publicado de un Post/Page cuando se guarda una nueva revisión en Draft sobre él, y SHALL NOT sincronizar el contenido de esa revisión en Draft al índice público.

#### Scenario: Draft edit sobre un Post ya publicado
- **WHEN** un Post publicado recibe una edición guardada como Draft (sin publicar)
- **THEN** el registro de búsqueda sigue reflejando la última versión publicada, no el contenido del Draft

#### Scenario: Publicar una actualización
- **WHEN** un Post o Page publicado se actualiza y se publica de nuevo
- **THEN** el registro de búsqueda se actualiza para reflejar el nuevo contenido publicado

#### Scenario: Despublicar contenido
- **WHEN** un Post o Page publicado se despublica
- **THEN** su registro de búsqueda se remueve del índice

#### Scenario: Eliminar contenido
- **WHEN** un Post o Page indexado se elimina
- **THEN** su registro de búsqueda se remueve del índice

Referencia: AC-SEARCH-010, AC-SEARCH-011, AC-SEARCH-013, AC-DRAFT-003.

### Requirement: Solo se sincroniza texto acotado, nunca el documento completo
El sistema SHALL derivar y almacenar en el índice únicamente texto plano acotado necesario para buscar y mostrar un resultado (título, extracto, texto derivado del contenido, metadatos de categoría/URL). El sistema SHALL NOT almacenar el documento Lexical serializado completo ni HTML sin sanear.

#### Scenario: Contenido enriquecido de un Post se reduce a texto plano
- **WHEN** un Post con contenido Lexical (incluyendo bloques de Artículo con texto) se sincroniza al índice
- **THEN** el registro de búsqueda contiene texto plano derivado, sin la estructura Lexical serializada completa

#### Scenario: Contenido de una Page se reduce a texto plano
- **WHEN** una Page con Page Blocks de texto público (Hero, RichText, ImageText, CTA, FAQ, Banner) se sincroniza al índice
- **THEN** el registro de búsqueda contiene texto plano derivado de esos bloques, sin el JSON crudo de los blocks

Referencia: AC-SEC-006.

### Requirement: El contenido existente puede reindexarse bajo demanda
El sistema SHALL permitir reindexar Posts y Pages publicados ya existentes después de introducir el índice de búsqueda, y SHALL producir el mismo resultado lógico si se ejecuta más de una vez.

#### Scenario: Reindexar contenido existente
- **WHEN** se ejecuta una reindexación sobre Posts/Pages publicados ya existentes
- **THEN** cada uno queda representado por exactamente un registro en el índice de búsqueda

#### Scenario: Reindexar dos veces no duplica resultados
- **WHEN** se ejecuta una reindexación adicional sobre el mismo contenido
- **THEN** el número de registros de búsqueda por documento fuente no aumenta

Referencia: AC-SEARCH-009.

### Requirement: El índice de búsqueda no se expone como API de datos sin restricciones
El sistema SHALL restringir la creación, edición y eliminación directa de registros del índice de búsqueda a roles Admin. El sistema SHALL NOT permitir que un rol Writer u otro rol no-Admin mute manualmente un registro de búsqueda.

#### Scenario: Un rol no-Admin intenta editar un registro de búsqueda directamente
- **WHEN** un usuario autenticado sin rol Admin intenta crear, actualizar o eliminar un registro del índice de búsqueda
- **THEN** la operación se rechaza por control de acceso

Referencia: AC-SEC-002.

### Requirement: Ningún servicio de búsqueda externo es necesario en V1
El sistema SHALL operar el índice de búsqueda completamente sobre la infraestructura PostgreSQL ya existente, sin depender de ningún servicio de búsqueda externo.

#### Scenario: Disponibilidad del índice de búsqueda
- **WHEN** el sitio opera con su infraestructura estándar (Next.js + Payload + PostgreSQL)
- **THEN** el índice de búsqueda funciona sin ninguna dependencia de red hacia un servicio de búsqueda externo

Referencia: AC-SEARCH-014.
