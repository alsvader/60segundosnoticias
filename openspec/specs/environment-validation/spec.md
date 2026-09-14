## Purpose

Garantiza que la aplicación valide su configuración de entorno al arrancar o hacer build, evitando arranques con configuración inválida o la fuga de secretos hacia el navegador.

## Requirements

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

### Requirement: Config cargable desde el CLI de Payload
El módulo de validación de entorno usado por `payload.config.ts` SHALL poder cargarse cuando `payload.config.ts` se carga fuera del bundler de Next.js (por ejemplo, desde el CLI de Payload), sin producir un error de carga de módulo.

#### Scenario: generación de tipos desde el CLI
- **WHEN** se ejecuta un comando del CLI de Payload que carga `payload.config.ts` (generación de tipos o de una migración)
- **THEN** la configuración se carga sin errores de resolución o de carga de módulos

#### Scenario: la validación existente del runtime de la aplicación no cambia
- **WHEN** la aplicación Next.js arranca o hace build
- **THEN** la validación de variables críticas sigue comportándose igual que antes de este change (variable faltante falla explícitamente, secretos no expuestos al cliente)

Referencia: necesario para que `payload generate:types` y `payload migrate:create` funcionen; ver design.md para el mecanismo elegido

### Requirement: Validación condicional a producción de variables del runtime de producción
Cuando `NODE_ENV=production`, el sistema SHALL validar como requeridas las variables `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` y `S3_PUBLIC_URL`, y SHALL fallar de forma explícita si falta alguna. `NEXT_PUBLIC_SITE_URL` SHALL exigirse tanto durante `next build` como en tiempo de ejecución, porque Next la incrusta en el bundle de cliente durante el build. `PREVIEW_SECRET` y las variables `S3_*` son secretos/config que la aplicación solo lee en tiempo de ejecución (nunca se incrustan en el build): el sistema SHALL exigirlas al arrancar realmente a servir tráfico (`next start` o el servidor standalone), pero SHALL NOT exigirlas durante el paso de build de Next, de forma que construir la imagen de producción no dependa de secretos operativos. En desarrollo y test las nueve variables SHALL permanecer opcionales, sin cambiar el comportamiento existente.

#### Scenario: `next build` no requiere secretos de runtime
- **WHEN** se ejecuta `next build` con `NODE_ENV=production` y `NEXT_PUBLIC_SITE_URL` presente, pero sin `PREVIEW_SECRET` ni las variables `S3_*`
- **THEN** el build se completa exitosamente

#### Scenario: falta `NEXT_PUBLIC_SITE_URL` en build de producción
- **WHEN** se ejecuta `next build` con `NODE_ENV=production` y falta `NEXT_PUBLIC_SITE_URL`
- **THEN** el build falla de forma explícita

#### Scenario: falta una variable de runtime al arrancar realmente en producción
- **WHEN** el servidor de producción arranca a servir tráfico (`next start` o el servidor standalone) con `NODE_ENV=production` y falta `PREVIEW_SECRET` o alguna variable `S3_*`
- **THEN** el arranque falla de forma explícita indicando qué variable falta

#### Scenario: las mismas variables siguen siendo opcionales en desarrollo
- **WHEN** la aplicación arranca en desarrollo sin `S3_*` configuradas
- **THEN** el arranque no falla por esas variables, igual que antes de este change

Referencia: AC-ENV-004

### Requirement: Variable de revalidación externa documentada sin ser requerida
`REVALIDATION_SECRET` SHALL permanecer declarada en la plantilla de variables de entorno como reservada/opcional, sin ser exigida por la validación de entorno ni consumida por ningún endpoint HTTP de revalidación, mientras no exista un mecanismo de revalidación externo implementado.

#### Scenario: ausencia de REVALIDATION_SECRET no bloquea el arranque
- **WHEN** la aplicación arranca sin `REVALIDATION_SECRET` definida, en cualquier entorno
- **THEN** el arranque no falla por esa variable

Referencia: §65 del Master Spec
