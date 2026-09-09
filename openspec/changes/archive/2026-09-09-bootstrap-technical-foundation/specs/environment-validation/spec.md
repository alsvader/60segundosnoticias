## Purpose

Garantiza que la aplicación valide su configuración de entorno al arrancar o hacer build, evitando arranques con configuración inválida o la fuga de secretos hacia el navegador.

## ADDED Requirements

### Requirement: Validación de variables críticas al arrancar/build
El sistema SHALL validar las variables de entorno críticas (por ejemplo `DATABASE_URI`, `PAYLOAD_SECRET`) al arrancar o al hacer build, y SHALL fallar de forma explícita cuando una variable requerida falte o sea inválida.

#### Scenario: variable crítica faltante
- **WHEN** falta una variable de entorno crítica requerida por la aplicación
- **THEN** la aplicación falla de forma explícita indicando qué configuración es inválida, en lugar de arrancar con un estado inconsistente

Referencia: §65 del Master Spec

### Requirement: Separación entre variables públicas y privadas
Solo los valores genuinamente públicos SHALL exponerse con el prefijo `NEXT_PUBLIC_`; los secretos (`DATABASE_URI`, `PAYLOAD_SECRET`, credenciales S3, etc.) SHALL NOT exponerse al navegador.

#### Scenario: secreto no expuesto al cliente
- **WHEN** se inspecciona el código/bundle que se envía al navegador
- **THEN** no contiene el valor de `PAYLOAD_SECRET`, `DATABASE_URI` ni credenciales de almacenamiento S3

Referencia: §65, §70 del Master Spec

### Requirement: Plantilla de variables de entorno versionada
El repositorio SHALL incluir un archivo `.env.example` que documente las variables de entorno conceptuales sin valores reales, y SHALL NOT versionar un archivo `.env` con valores reales.

#### Scenario: un nuevo clon dispone de la plantilla de entorno
- **WHEN** un desarrollador clona el repositorio por primera vez
- **THEN** encuentra `.env.example` con las variables conceptuales documentadas y ningún archivo `.env` con valores reales está versionado en Git
