## Purpose

Define cómo se orquesta un despliegue de producción de extremo a extremo — orden de migración, arranque de la aplicación, y la composición de referencia self-hosted — sin acoplar la arquitectura a un proveedor de hosting concreto.

## Requirements

### Requirement: Las migraciones se aplican antes de que la nueva release sirva tráfico
Un despliegue de producción SHALL ejecutar el job de migración hasta completarse exitosamente antes de que el container de aplicación de la nueva release comience a recibir tráfico.

#### Scenario: desplegar una nueva release con cambios de schema
- **WHEN** se despliega una nueva versión de la aplicación que incluye migraciones pendientes
- **THEN** el job de migración se ejecuta y termina exitosamente antes de que el nuevo container de aplicación quede sirviendo tráfico

### Requirement: Un job de migración fallido detiene el despliegue sin dejar la app en un estado inconsistente
Si el job de migración termina con error, el despliegue SHALL detenerse antes de reemplazar el container de aplicación en ejecución, y la release anterior SHALL continuar sirviendo tráfico.

#### Scenario: el job de migración falla
- **WHEN** el job de migración termina con un código de salida distinto de éxito
- **THEN** el container de aplicación de la release anterior sigue sirviendo tráfico y no se reemplaza por la nueva release

#### Scenario: la falla es visible para el operador
- **WHEN** el job de migración falla
- **THEN** el error queda registrado en los logs del job, permitiendo que el operador lo reintente de forma segura

Referencia: AC-DB-004

### Requirement: El job de migración es singular por despliegue
Un despliegue de producción SHALL NOT ejecutar el job de migración de forma concurrente desde más de una instancia a la vez para la misma release.

#### Scenario: despliegue con múltiples instancias de aplicación
- **WHEN** un despliegue produce más de una instancia del container de aplicación
- **THEN** el job de migración se ejecuta una única vez para esa release, no una vez por instancia

### Requirement: `DATABASE_URI` es agnóstico del proveedor de PostgreSQL
La aplicación y el job de migración SHALL conectarse a PostgreSQL exclusivamente a través de `DATABASE_URI`, sin requerir que un servicio de PostgreSQL definido en Docker Compose esté presente.

#### Scenario: `DATABASE_URI` apunta a un PostgreSQL administrado externo
- **WHEN** `DATABASE_URI` apunta a una instancia de PostgreSQL administrada fuera de Docker Compose
- **THEN** la aplicación y el job de migración funcionan sin requerir cambios de código ni un servicio `db` local

Referencia: §69.1 del Master Spec

### Requirement: Composición de referencia self-hosted separada de desarrollo
El repositorio SHALL proveer una composición Docker orientada a producción/self-hosted (por ejemplo `compose.prod.yaml`), distinta de `compose.yaml`, sin modificar el comportamiento de desarrollo existente en `compose.yaml`.

#### Scenario: levantar el target production-like localmente
- **WHEN** se usa la composición de producción/self-hosted para levantar el stack
- **THEN** se obtiene un container de aplicación basado en el stage `runner`, un job de migración basado en el stage `migrator`, y opcionalmente un servicio de PostgreSQL solo para el caso self-hosted

#### Scenario: el flujo de desarrollo no cambia
- **WHEN** se usa `docker compose up` con `compose.yaml`
- **THEN** el comportamiento de desarrollo (target `development`, Fast Refresh, PostgreSQL con push) permanece igual que antes de este change

### Requirement: Topología de instancia única documentada
La arquitectura de producción de esta fase SHALL soportar una única instancia del App Container; cualquier requisito adicional para múltiples réplicas (coordinación de invalidación de cache, límites de conexión de base de datos) SHALL quedar documentado como limitación conocida, no implementado en esta fase.

#### Scenario: consultar las limitaciones documentadas
- **WHEN** un operador revisa la documentación de despliegue de producción
- **THEN** encuentra explícitamente listada la limitación de instancia única y lo que se requeriría antes de escalar a múltiples réplicas
