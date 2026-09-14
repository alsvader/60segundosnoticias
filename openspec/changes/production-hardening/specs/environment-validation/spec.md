## ADDED Requirements

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
