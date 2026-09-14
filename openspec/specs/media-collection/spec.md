## Purpose

Define la Collection de upload `Media`, con metadatos editoriales, tamaños de imagen controlados y restricciones de tipo de archivo, usando almacenamiento local en desarrollo.

## Requirements

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
En desarrollo, `Media` SHALL usar almacenamiento local (filesystem/volumen de desarrollo) sin depender de un adaptador de almacenamiento de objetos externo. En producción, `Media` SHALL usar un adaptador de almacenamiento de objetos compatible con S3, configurado mediante variables de entorno, sin acoplar la aplicación a un proveedor concreto.

#### Scenario: archivo servible sin configuración de object storage
- **WHEN** se sube un archivo a `Media` en el entorno de desarrollo
- **THEN** el archivo queda accesible sin requerir credenciales de S3/R2

#### Scenario: archivo persistido en Object Storage (producción)
- **WHEN** se sube un archivo a `Media` en producción
- **THEN** el archivo se almacena en el Object Storage S3-compatible configurado, no en el filesystem del App Container

#### Scenario: recrear el App Container no elimina Media
- **WHEN** el App Container de producción se recrea o reemplaza
- **THEN** los archivos previamente subidos a `Media` siguen siendo accesibles, porque residen en el Object Storage externo, no en el filesystem del container

Referencia: AC-STOR-001, AC-STOR-002, AC-STOR-003, §4.3 y §13.4 del Master Spec

### Requirement: Acceso a Media
Admin y Writer autorizados SHALL poder subir y leer `Media`; la lectura pública de `Media` SHALL estar permitida para servir imágenes editoriales.

#### Scenario: Writer sube un archivo
- **WHEN** un usuario con rol `writer` autenticado sube un archivo
- **THEN** la operación es permitida

Referencia: AC-MEDIA-001

### Requirement: Ownership de Media
La Collection `Media` SHALL registrar qué `User` subió cada archivo; un Writer SHALL solo poder editar la metadata (`alt`, `caption`, `credits`, `description`) de los archivos que él mismo subió; un Admin SHALL poder editar la metadata de cualquier archivo.

#### Scenario: Writer edita metadata de su propio upload
- **WHEN** un Writer actualiza la metadata de un archivo de Media que él mismo subió
- **THEN** la operación es permitida

#### Scenario: Writer intenta editar metadata de Media subida por otro Writer
- **WHEN** un Writer intenta actualizar la metadata de un archivo de Media subido por otro Writer
- **THEN** la operación es rechazada

Referencia: §13.3 del Master Spec
