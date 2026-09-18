## Purpose

Provee la base compartida de pruebas del proyecto: el guard de seguridad de
la base de datos de pruebas, fixtures deterministas, comandos de test
ergonómicos y el primer gate de CI, de los que dependen el resto de las
capacidades de la Fase 11.

## ADDED Requirements

### Requirement: Guard de seguridad de la base de datos de pruebas
El sistema SHALL rechazar cualquier operación destructiva de reset/drop
destinada a pruebas a menos que la conexión objetivo esté inequívocamente
identificada como una base de datos exclusiva para pruebas.

#### Scenario: Reset intentado contra una base no reconocida como de pruebas
- **WHEN** un script de preparación de pruebas intenta resetear/eliminar una
  base de datos cuya cadena de conexión no coincide con el marcador
  reconocido de base de datos de pruebas
- **THEN** la operación SHALL abortar sin modificar ningún dato y SHALL
  reportar un error identificando el destino inseguro

#### Scenario: Reset permitido contra una base reconocida como de pruebas
- **WHEN** un script de preparación de pruebas apunta a una cadena de
  conexión que coincide con el marcador reconocido de base de datos
  exclusiva para pruebas
- **THEN** la operación de reset/drop SHALL proceder

### Requirement: Base de datos de pruebas inicializada vía migraciones versionadas
Las suites de integración y E2E SHALL inicializar su base de datos
exclusivamente mediante la cadena de migraciones versionada del proyecto
(`payload migrate`), nunca mediante `push` de esquema.

#### Scenario: Preparación de la suite de pruebas
- **WHEN** la suite de pruebas provisiona su base de datos
- **THEN** SHALL ejecutar la cadena completa de migraciones committeadas
  contra una base de datos vacía antes de que se ejecute cualquier prueba

### Requirement: Fixtures de prueba deterministas
El sistema SHALL proveer builders de fixtures reutilizables para los roles
y tipos de contenido que otras capacidades de la Fase 11 requieren (usuario
Admin, al menos dos usuarios Writer, categorías, un Post publicado, un Post
en borrador, una Page, y configuración de Home/Navigation/Footer/
SiteSettings), usando credenciales fijas que nunca son de producción.

#### Scenario: Las credenciales de fixtures nunca parecen credenciales de producción
- **WHEN** un fixture crea un usuario con contraseña
- **THEN** la contraseña SHALL ser un valor placeholder claramente no-
  productivo, distinto de cualquier credencial real

#### Scenario: Fixtures suficientes para las pruebas de integración
- **WHEN** una prueba de integración solicita el conjunto base de fixtures
- **THEN** el sistema SHALL proveer, sin configuración adicional, un Admin,
  al menos dos Writers, categorías, un Post publicado, un Post en borrador
  y una Page listos para usarse

### Requirement: Superficie de comandos de prueba
El proyecto SHALL exponer scripts ergonómicos para ejecutar de forma
independiente las capas de prueba unitaria, de integración y E2E, además
de un comando por defecto que ejecuta solo el nivel rápido.

#### Scenario: Ejecución rápida local
- **WHEN** un desarrollador ejecuta el comando de prueba por defecto
- **THEN** SHALL ejecutarse únicamente typecheck, lint, pruebas unitarias y
  pruebas de componente seleccionadas, sin requerir una base de datos ni un
  navegador

#### Scenario: Ejecución de la suite de integración
- **WHEN** un desarrollador ejecuta el comando de integración
- **THEN** SHALL provisionarse la base de datos desechable vía migraciones
  y ejecutarse las pruebas de integración contra el Local API real de
  Payload

### Requirement: Gate de integración continua
CI SHALL bloquear el merge de un pull request cuando falle la instalación
de dependencias, el typecheck, el lint, las pruebas unitarias o el build de
producción.

#### Scenario: Falla de typecheck bloquea el merge
- **WHEN** un pull request introduce un error de tipos de TypeScript
- **THEN** el pipeline de CI SHALL fallar y el merge SHALL quedar bloqueado

#### Scenario: Falla del build de producción bloquea el merge
- **WHEN** `next build` falla para un pull request
- **THEN** CI SHALL reportar la falla y bloquear el merge

#### Scenario: CI verifica el build de Docker
- **WHEN** un pull request modifica el `Dockerfile`, `compose.prod.yaml` o
  código que afecta el build de producción
- **THEN** CI SHALL construir la imagen de producción y fallar si el build
  no completa exitosamente
