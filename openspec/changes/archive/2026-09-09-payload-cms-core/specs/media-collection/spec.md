## Purpose

Define la Collection de upload `Media`, con metadatos editoriales, tamaños de imagen controlados y restricciones de tipo de archivo, usando almacenamiento local en desarrollo.

## ADDED Requirements

### Requirement: Metadatos editoriales de Media
La Collection `Media` SHALL incluir los campos `alt`, `caption`, `credits` y `description`.

#### Scenario: subir un archivo con metadatos
- **WHEN** se sube un archivo a `Media`
- **THEN** se pueden completar `alt`, `caption`, `credits` y `description`

Referencia: AC-MEDIA-002

### Requirement: Tamaños de imagen editoriales
La Collection `Media` SHALL generar tamaños de imagen editoriales (aproximadamente thumbnail, card, tablet, desktop y hero) para archivos de imagen subidos.

#### Scenario: tamaños generados al subir una imagen
- **WHEN** se sube una imagen válida a `Media`
- **THEN** el sistema genera las variantes de tamaño configuradas

Referencia: AC-MEDIA-003

### Requirement: Restricción de tipos de archivo
La Collection `Media` SHALL restringir los tipos MIME aceptados a formatos de imagen seguros y compatibles.

#### Scenario: tipo de archivo no soportado es rechazado
- **WHEN** se intenta subir un archivo con un tipo MIME no permitido
- **THEN** la subida es rechazada

Referencia: AC-SEC-005

### Requirement: Almacenamiento local en desarrollo
En esta fase, `Media` SHALL usar almacenamiento local (filesystem/volumen de desarrollo) sin depender de un adaptador de almacenamiento de objetos externo.

#### Scenario: archivo servible sin configuración de object storage
- **WHEN** se sube un archivo a `Media` en el entorno de desarrollo
- **THEN** el archivo queda accesible sin requerir credenciales de S3/R2

Referencia: §13.4 del Master Spec (el adaptador de producción es Phase 10, fuera de esta fase)

### Requirement: Acceso a Media
Admin y Writer autorizados SHALL poder subir y leer `Media`; la lectura pública de `Media` SHALL estar permitida para servir imágenes editoriales.

#### Scenario: Writer sube un archivo
- **WHEN** un usuario con rol `writer` autenticado sube un archivo
- **THEN** la operación es permitida

Referencia: AC-MEDIA-001
