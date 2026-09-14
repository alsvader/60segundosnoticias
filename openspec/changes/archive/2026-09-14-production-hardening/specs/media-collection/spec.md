## MODIFIED Requirements

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
