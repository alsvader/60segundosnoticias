## Purpose

Expone un endpoint que permite verificar de forma segura que la aplicación está operativa, utilizado tanto por el healthcheck de Docker como por verificación operativa básica.

## Requirements

### Requirement: Endpoint `/api/health` disponible
El sistema SHALL exponer una ruta `/api/health` que reporte si la aplicación está operativa.

#### Scenario: verificación de estado operativo
- **WHEN** se realiza una petición a `/api/health`
- **THEN** la respuesta indica que la aplicación está operativa

Referencia: §66 del Master Spec

### Requirement: Sin exposición de información sensible
La respuesta de `/api/health` SHALL NOT incluir cadenas de conexión de base de datos, contraseñas, el Payload secret, ni detalles internos de stack.

#### Scenario: respuesta sin datos sensibles
- **WHEN** se inspecciona la respuesta de `/api/health`
- **THEN** no contiene la cadena de conexión a la base de datos, contraseñas, el Payload secret, ni información interna de stack

Referencia: §66, §70 del Master Spec

### Requirement: Utilizable como healthcheck de Docker Compose
El endpoint `/api/health` SHALL ser apto para usarse como healthcheck del servicio `app` en Docker Compose.

#### Scenario: healthcheck de Docker Compose consulta el endpoint
- **WHEN** Docker Compose ejecuta el healthcheck configurado para el servicio `app`
- **THEN** el healthcheck consulta `/api/health` y refleja el estado de arranque de la aplicación

Referencia: §64.3 del Master Spec
