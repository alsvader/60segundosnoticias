## Purpose

Define el runtime de producción de la aplicación Next.js/Payload en Docker: una imagen ejecutable no-root basada en la salida standalone de Next.js, y un job de migración separado del arranque normal del App Container.

## ADDED Requirements

### Requirement: Imagen de aplicación de producción ejecutable
El Dockerfile SHALL definir un stage de runtime de producción (`runner`) capaz de ejecutar la aplicación completa (Next.js + Payload) sin herramientas de desarrollo ni código fuente montado.

#### Scenario: construir y arrancar la imagen de producción
- **WHEN** se construye la imagen del stage `runner` y se ejecuta como container
- **THEN** la aplicación queda sirviendo tráfico HTTP sin requerir el código fuente montado ni dependencias de desarrollo

### Requirement: Ejecución no-root
El stage `runner` SHALL ejecutar el proceso de la aplicación con un usuario sin privilegios de root.

#### Scenario: inspeccionar el usuario del proceso en ejecución
- **WHEN** se inspecciona el proceso de la aplicación dentro del container `runner` en ejecución
- **THEN** el proceso corre como un usuario distinto de root

### Requirement: Arranque en forma exec
El `CMD`/`ENTRYPOINT` del stage `runner` SHALL usar la forma exec (arreglo JSON), no un wrapper de shell, de forma que el proceso de la aplicación reciba señales del sistema (incluida `SIGTERM`) directamente.

#### Scenario: el container recibe SIGTERM
- **WHEN** Docker envía `SIGTERM` al container `runner`
- **THEN** el proceso de la aplicación lo recibe directamente y puede terminar de forma ordenada, sin quedar huérfano detrás de un shell intermedio

### Requirement: Healthcheck de la imagen de producción
El stage `runner` SHALL definir una instrucción `HEALTHCHECK` que consulte el endpoint `/api/health` de la propia aplicación sin depender de utilidades adicionales instaladas solo para ese fin (por ejemplo `curl`/`wget`).

#### Scenario: Docker evalúa el estado de salud del container de producción
- **WHEN** Docker ejecuta el `HEALTHCHECK` configurado del container `runner`
- **THEN** el resultado refleja el estado reportado por `/api/health`

### Requirement: El arranque normal de la aplicación no ejecuta migraciones
El `CMD`/`ENTRYPOINT` del stage `runner` SHALL NOT invocar `payload migrate` ni ningún comando de migración, en ningún arranque o reinicio del container de aplicación.

#### Scenario: reiniciar el container de aplicación
- **WHEN** el container `runner` se reinicia o se reemplaza por una nueva instancia de la misma imagen
- **THEN** no se ejecuta ningún comando de migración como parte de ese arranque

Referencia: AC-DB-004

### Requirement: Job de migración como stage independiente
El Dockerfile SHALL definir un stage de operación (`migrator`) distinto del stage `runner`, capaz de ejecutar `pnpm payload migrate` con acceso completo al código de la aplicación, la configuración de Payload y el directorio de migraciones de la misma release, y SHALL NOT exponer un servidor HTTP ni ejecutarse como el App Container normal.

#### Scenario: ejecutar el job de migración
- **WHEN** se construye y ejecuta el stage `migrator` como un job de un solo uso contra una base de datos objetivo
- **THEN** el job aplica la cadena de migraciones pendiente y termina con un código de salida que indica éxito o fallo, sin dejar un proceso de servidor en ejecución

Referencia: AC-DOCKER-010, AC-DOCKER-011

### Requirement: El job de migración corre en modo producción, nunca en modo desarrollo
El stage `migrator` SHALL ejecutarse con `NODE_ENV=production`, de forma que, al aplicarse contra una base con drift respecto al modo push de desarrollo, el job falle o se resuelva de forma no interactiva, en vez de quedar esperando indefinidamente una respuesta por stdin.

#### Scenario: ejecutar el job de migración de forma no interactiva
- **WHEN** el job `migrator` se ejecuta sin TTY (el caso normal de un despliegue automatizado) contra una base de datos objetivo
- **THEN** el job aplica las migraciones pendientes y termina, sin quedar bloqueado esperando entrada interactiva

Referencia: AC-DB-004
