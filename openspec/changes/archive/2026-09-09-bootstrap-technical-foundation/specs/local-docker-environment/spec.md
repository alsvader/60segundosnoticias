## Purpose

Provee un entorno de desarrollo local reproducible vía Docker Compose para que cualquier desarrollador pueda levantar la aplicación y PostgreSQL sin configuración manual adicional.

## ADDED Requirements

### Requirement: Servicios `app` y `db`
Docker Compose SHALL definir un servicio `app` (Next.js + Payload) y un servicio `db` (PostgreSQL).

#### Scenario: levantar el stack completo
- **WHEN** se ejecuta `docker compose up`
- **THEN** se inician los servicios `app` y `db`, y la aplicación queda accesible localmente

Referencia: §64.1 del Master Spec

### Requirement: Comunicación interna `app` → `db` por nombre de servicio
Dentro de Docker, el servicio `app` SHALL alcanzar PostgreSQL mediante el host `db` en el puerto `5432`, nunca mediante `localhost`.

#### Scenario: conexión interna usa el nombre del servicio
- **WHEN** la aplicación dentro del contenedor `app` se conecta a PostgreSQL
- **THEN** la conexión usa el host `db` y el puerto `5432`, no `localhost`

Referencia: §64.1 del Master Spec

### Requirement: Persistencia de datos de PostgreSQL entre reinicios
Los datos de PostgreSQL SHALL persistir en un volumen nombrado, de forma que `docker compose down` (sin `-v`) conserve la base de datos, mientras que `docker compose down -v` la elimine explícitamente.

#### Scenario: reiniciar el stack conserva los datos
- **WHEN** se ejecuta `docker compose down` seguido de `docker compose up`
- **THEN** los datos previamente almacenados en PostgreSQL siguen presentes

#### Scenario: eliminación explícita de volúmenes
- **WHEN** se ejecuta `docker compose down -v`
- **THEN** el volumen de PostgreSQL se elimina y los datos no persisten

Referencia: §64.2 del Master Spec

### Requirement: Healthchecks para ambos servicios
Los servicios `app` y `db` SHALL definir healthchecks (`pg_isready` o equivalente para `db`, `/api/health` para `app`).

#### Scenario: estado de salud reportado por Docker Compose
- **WHEN** se consulta el estado de los servicios mediante Docker Compose
- **THEN** ambos servicios reportan su estado de salud a través de sus respectivos healthchecks

Referencia: §64.3 del Master Spec

### Requirement: Desarrollo con Fast Refresh mediante montaje de fuente
El entorno de desarrollo SHALL montar el código fuente de la aplicación dentro del contenedor `app` para que Fast Refresh/hot reload funcione sin reconstruir la imagen, sin que `node_modules` del host reemplace las dependencias nativas de Linux del contenedor.

#### Scenario: un cambio de código se refleja sin reconstruir la imagen
- **WHEN** se modifica un archivo fuente durante el desarrollo
- **THEN** el cambio se refleja en la aplicación en ejecución sin necesidad de reconstruir la imagen Docker

Referencia: §64.4 del Master Spec
