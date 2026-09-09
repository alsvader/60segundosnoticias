## Purpose

Define los scripts de seed del proyecto para poblar una base de datos nueva con datos base idempotentes y, opcionalmente, contenido de desarrollo, sin comprometer credenciales ni adelantar Globals de fases posteriores.

## ADDED Requirements

### Requirement: seed:initial pobla solo entidades con schema ya implementado
El script `seed:initial` SHALL crear únicamente datos correspondientes a Collections cuyo schema ya existe en el proyecto (en esta fase, las Categories iniciales); SHALL NOT crear ni simular datos de Globals que aún no están implementados (Navigation, Home, SiteSettings).

#### Scenario: ejecutar seed:initial en esta fase
- **WHEN** se ejecuta `seed:initial` en el estado actual del proyecto
- **THEN** se crean las Categories iniciales y no se crea ni se referencia ningún Global

Referencia: §68 del Master Spec

### Requirement: seed:initial es idempotente
Ejecutar `seed:initial` más de una vez sobre la misma base de datos SHALL NOT crear entidades duplicadas.

#### Scenario: ejecutar seed:initial dos veces
- **WHEN** `seed:initial` se ejecuta una segunda vez sobre una base de datos donde ya corrió antes
- **THEN** no se crean Categories duplicadas

Referencia: §68 del Master Spec

### Requirement: seed:dev es contenido de desarrollo, no automático en producción
El script `seed:dev` SHALL crear contenido de ejemplo (Posts, Writers, Media y Pages de prueba) para desarrollo, y SHALL NOT ejecutarse automáticamente como parte del arranque de la aplicación ni de un despliegue de producción.

#### Scenario: arrancar la aplicación no dispara seed:dev
- **WHEN** la aplicación arranca (desarrollo o producción)
- **THEN** `seed:dev` no se ejecuta a menos que se invoque explícitamente

Referencia: §68 del Master Spec

### Requirement: Los seeds no contienen credenciales reales
Ningún script de seed SHALL contener credenciales reales hardcodeadas.

#### Scenario: inspeccionar el código de los seeds
- **WHEN** se revisa el código fuente de `seed:initial` y `seed:dev`
- **THEN** no contiene contraseñas, tokens ni secretos reales

Referencia: §68 del Master Spec
