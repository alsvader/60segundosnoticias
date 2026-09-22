## Why

`src/app/(payload)/admin/importMap.js` (comprometido en Fase 9, antes de que
el plugin S3 se agregara en Fase 10) nunca incluyó
`@payloadcms/storage-s3/client#S3ClientUploadHandler`. `Panel Admin` no
hidrata (`/admin/login` queda en blanco, 0 inputs) en cualquier entorno
donde `S3_*` esté configurado - siempre en producción real -, detectado
durante `openspec/changes/testing-qa-performance` (tarea 6.9, E2E de
Admin). Bug de producción real y previamente no detectado, no un defecto
de la prueba.

Investigación de causa raíz (ver design.md): el problema no era solo un
archivo generado desactualizado. `src/payload/plugins/media-storage.ts`
registraba el plugin `s3Storage()` de forma condicional
(`isS3Configured() ? [s3Storage(...)] : []`), así que desarrollo (sin
`S3_*`) y producción (con `S3_*`) resultaban en configuraciones de Payload
ESTRUCTURALMENTE distintas. Como `@payloadcms/plugin-cloud-storage`
registra `S3ClientUploadHandler` en `config.admin.dependencies` de forma
incondicional en cuanto `s3Storage()` se registra - sin importar
`enabled` -, el archivo generado oscilaba según qué entorno lo regeneró
por última vez, confirmado empíricamente regenerando el archivo con y sin
variables `S3_*` y observando al contenedor de desarrollo revertirlo.

## What Changes

- `src/payload/plugins/media-storage.ts`: registrar `s3Storage()` SIEMPRE
  (nunca detrás de `isS3Configured() ? [...] : []`), pasando
  `enabled: isS3Configured()` en su lugar. Esto hace que
  `config.admin.dependencies` sea idéntico en todos los entornos, sin
  afectar el comportamiento de almacenamiento (local en dev, S3 en
  producción sigue siendo exactamente igual - verificado contra el código
  fuente instalado de `@payloadcms/storage-s3` 3.87.1: `enabled: false`
  retorna antes de crear el cliente S3 real o de fijar
  `disableLocalStorage: true`).
- Regenerar y commitear `src/app/(payload)/admin/importMap.js` con el
  plugin ya siempre presente.
- `scripts/verify-importmap.sh` (nuevo) + `pnpm test:importmap`: guard de
  regresión que regenera el import map sin variables `S3_*` y con
  variables `S3_*` de prueba, y falla si el resultado difiere del archivo
  commiteado en `HEAD` en cualquiera de los dos casos. Encadenado en
  `pnpm test`.
- Restaurar `tests/e2e/admin-smoke.spec.ts` (bloqueada en
  `testing-qa-performance`, tarea 6.9) como parte de la verificación de
  este fix.

## Capabilities

Ningún requisito de comportamiento observable cambia: Media SHALL seguir
usando almacenamiento local en desarrollo y S3-compatible en producción,
exactamente como ya especifica `openspec/specs/media-collection`
(AC-STOR-001..003, Fase 10).
Este cambio corrige un defecto de implementación (cómo se registra el
plugin) que rompía esa garantía en la práctica al des-sincronizar el
import map generado. `skip_specs: true` en `.openspec.yaml` - sin deltas
de spec.

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna - ver justificación arriba)

## Impact

- `src/payload/plugins/media-storage.ts`
- `src/app/(payload)/admin/importMap.js` (generado, committeado)
- `scripts/verify-importmap.sh` (nuevo)
- `package.json` (`test:importmap`, encadenado en `test`)
- `tests/e2e/admin-smoke.spec.ts` (desbloqueada, sin cambios de contenido)
- `openspec/changes/testing-qa-performance/tasks.md` (tarea 6.9)
