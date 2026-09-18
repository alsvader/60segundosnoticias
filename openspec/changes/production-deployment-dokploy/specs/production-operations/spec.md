## Purpose

Define las garantías operativas que hacen sostenible correr PostgreSQL self-hosted en el VPS de producción — la condición que el Master Spec (§69.1) exige para que esa opción sea válida — más los procedimientos reproducibles de primer arranque y de decisión de rollback que un operador humano ejecuta fuera de la pipeline automatizada.

## ADDED Requirements

### Requirement: La base de datos de producción se respalda automáticamente con retención definida
La base de datos PostgreSQL de producción SHALL respaldarse de forma automática y periódica, y los respaldos SHALL conservarse durante un período de retención definido antes de eliminarse.

#### Scenario: Transcurre el intervalo de respaldo programado
- **WHEN** transcurre el intervalo de respaldo programado
- **THEN** se produce un nuevo respaldo de la base de datos de producción sin intervención manual

#### Scenario: Un respaldo supera el período de retención
- **WHEN** un respaldo existente supera el período de retención definido
- **THEN** ese respaldo SHALL quedar elegible para eliminación conforme a la retención configurada

### Requirement: Los respaldos se almacenan cifrados y fuera del VPS
Cada respaldo de la base de datos de producción SHALL cifrarse y SHALL almacenarse en un destino externo al VPS, separado del almacenamiento de objetos usado para Media.

#### Scenario: Se genera un respaldo
- **WHEN** se genera un nuevo respaldo de la base de datos de producción
- **THEN** el respaldo SHALL quedar cifrado y almacenado en un destino externo al VPS distinto del bucket de Media

### Requirement: La capacidad de restauración se verifica periódicamente
La capacidad de restaurar un respaldo de producción a un entorno desechable SHALL verificarse de forma periódica, y cada verificación SHALL confirmar que el contenido restaurado es utilizable — no solo que el archivo de respaldo existe.

#### Scenario: Se ejecuta un drill de restauración
- **WHEN** se restaura un respaldo de producción en un entorno desechable y se arranca la aplicación contra esa base restaurada
- **THEN** la aplicación SHALL responder saludable y una búsqueda por un término conocido SHALL devolver resultados

#### Scenario: El drill de restauración no se ha ejecutado en el período esperado
- **WHEN** transcurre el período esperado entre drills de restauración sin que se haya ejecutado uno
- **THEN** la ausencia de un drill reciente SHALL quedar visible como una brecha operativa pendiente

### Requirement: Existe una regla documentada para decidir si un rollback de aplicación es seguro
Antes de ejecutar un rollback de aplicación a un SHA anterior, SHALL poder determinarse, mediante un procedimiento documentado, si ese rollback es seguro dado el conjunto de cambios de esquema entre ambas releases; un rollback marcado como no seguro SHALL resolverse corrigiendo hacia adelante, no revirtiendo el esquema de la base de datos.

#### Scenario: El rollback candidato no introduce cambios de esquema incompatibles
- **WHEN** el conjunto de cambios de esquema entre la release actual y la release candidata de rollback es vacío o solo aditivo
- **THEN** el procedimiento documentado SHALL clasificar ese rollback como seguro de aplicar

#### Scenario: El rollback candidato depende de un cambio de esquema no retrocompatible
- **WHEN** el conjunto de cambios de esquema entre ambas releases incluye una modificación que el código de la release anterior no puede leer correctamente
- **THEN** el procedimiento documentado SHALL clasificar ese rollback como no seguro y SHALL indicar corregir hacia adelante en vez de revertir el esquema

### Requirement: El primer arranque de producción crea el primer usuario Admin sin comprometer credenciales
El procedimiento de primer arranque SHALL permitir crear el primer usuario administrador de producción sin requerir un endpoint público de creación de usuarios sin autenticar, y sin que las credenciales reales queden versionadas en el repositorio.

#### Scenario: Primer arranque contra una base de datos sin usuarios
- **WHEN** se ejecuta el procedimiento de primer arranque contra una instancia de producción que todavía no tiene ningún usuario
- **THEN** SHALL crearse el primer usuario administrador usando credenciales provistas en tiempo de ejecución, no versionadas en el repositorio

#### Scenario: El procedimiento se ejecuta de nuevo tras ya existir un usuario
- **WHEN** el procedimiento de primer arranque se ejecuta contra una instancia que ya tiene al menos un usuario
- **THEN** SHALL NOT crear un usuario adicional ni modificar los existentes

### Requirement: El contenido inicial y el índice de búsqueda quedan operativos tras el primer arranque
Tras completarse el primer arranque de producción, el catálogo de contenido inicial SHALL estar publicado y la búsqueda pública SHALL devolver resultados coherentes con ese contenido.

#### Scenario: Verificación posterior al primer arranque
- **WHEN** el primer arranque de producción termina, incluyendo la siembra inicial y el reindexado de búsqueda
- **THEN** la búsqueda pública SHALL devolver resultados para un término presente en el contenido publicado
