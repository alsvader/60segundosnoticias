## Context

Ver proposal.md - Why. Contexto técnico adicional (verificado contra el
código fuente instalado de `@payloadcms/storage-s3`/
`@payloadcms/plugin-cloud-storage` 3.87.1, no contra la documentación):

`node_modules/@payloadcms/storage-s3/dist/index.js`, factory `s3Storage()`:

```js
const isPluginDisabled = s3StorageOptions.enabled === false
initClientUploads({
  clientHandler: '@payloadcms/storage-s3/client#S3ClientUploadHandler',
  ...
  enabled: !isPluginDisabled && Boolean(s3StorageOptions.clientUploads),
  ...
})
if (isPluginDisabled) {
  // ... rama alwaysInsertFields, si no: return incomingConfig
  return incomingConfig
}
// getStorageClient()/createS3Adapter()/disableLocalStorage:true solo aquí,
// después del return anterior
```

`node_modules/@payloadcms/plugin-cloud-storage/.../initClientUploads.js`:

```js
export const initClientUploads = ({ clientHandler, collections, config, enabled, ... }) => {
  if (enabled) { /* ... registra el endpoint POST de firma, no afecta el import map */ }
  if (!config.admin) config.admin = {}
  if (!config.admin.dependencies) config.admin.dependencies = {}
  // Comentario textual del propio paquete:
  // "Ensure client handler is always part of the import map, to avoid
  //  import map discrepancies between dev and prod"
  config.admin.dependencies[clientHandler] = { type: 'function', path: clientHandler }
  // ... y lo mismo en config.admin.components.providers, para cada
  // collection en `collections` - también incondicional a `enabled`.
}
```

`initClientUploads()` se llama ANTES del `if (isPluginDisabled) return`
de `s3Storage()` - se ejecuta siempre que `s3Storage()` se invoque, sin
importar `enabled`. El código previo (`isS3Configured() ? [s3Storage(...)]
: []`) evitaba invocar `s3Storage()` por completo en desarrollo, así que
`config.admin.dependencies` nunca tenía la entrada de S3 ahí - una
configuración de Payload estructuralmente distinta a producción, no solo
un valor de runtime distinto.

Confirmado empíricamente: regenerar `importMap.js` con y sin variables
`S3_*`, comparando hashes (`git hash-object`), con el código previo
producía archivos distintos; con el contenedor de desarrollo corriendo
(`compose.yaml`, bind mount completo, `WATCHPACK_POLLING: true`), cada
recompilación del admin (`docker compose logs app`: `Generating import
map` / `Writing import map to ...`) revertía cualquier regeneración
manual con S3 de vuelta a la forma sin S3, en 1-2 segundos.

## Goals / Non-Goals

**Goals:**
- Una única configuración de Payload estructuralmente idéntica en todos
  los entornos (dev, test, producción/E2E) respecto a `config.admin.*` -
  el import map generado debe ser el mismo sin importar si `S3_*` está
  presente.
- Preservar el comportamiento observable exacto: Media local en
  desarrollo, Media S3-compatible en producción (AC-STOR-001..003,
  `openspec/specs/media-collection`).
- No requerir credenciales reales ni acceso de red a S3/MinIO cuando el
  plugin está deshabilitado.

**Non-Goals:**
- No se modifica ninguna spec de comportamiento observable (`skip_specs:
  true` - ver proposal.md, Capabilities).
- No se toca la validación de entorno de producción
  (`src/lib/env/index.ts`) - sigue exigiendo las seis variables `S3_*` en
  runtime de producción, sin excepción.
- No se agrega un mecanismo para deshabilitar la auto-regeneración del
  import map de Payload en modo dev, ni se le pide a nadie cerrar una
  pestaña del navegador o pausar el contenedor de desarrollo como
  solución: con este fix, la regeneración automática de dev converge al
  mismo resultado que producción, así que deja de ser un problema en vez
  de necesitar evitarse.

## Decisions

**Decisión 1: registrar `s3Storage()` siempre, con `enabled:
isS3Configured()`, en vez de omitir el plugin condicionalmente.**

Alternativa considerada y descartada: mantener el plugin condicional y en
su lugar mantener manualmente `importMap.js` (agregar la entrada de S3 a
mano). Rechazada explícitamente por el usuario - el import map es un
artefacto generado por Payload, mantenerlo a mano diverge en el primer
cambio de configuración real y no soluciona la causa raíz (la
configuración seguiría siendo estructuralmente distinta entre entornos).

Alternativa considerada y descartada: deshabilitar la auto-regeneración
de Payload en modo dev (p. ej. buscando una bandera de configuración).
Rechazada porque ataca el síntoma (el contenedor de dev revertía el
archivo) en vez de la causa (la config estructuralmente distinta); además
el comentario del propio código de Payload (`initClientUploads.js`)
indica que la auto-regeneración incondicional es intencional
precisamente para evitar esta clase de discrepancia - pelear contra ese
diseño es más frágil que alinearse con él.

**Decisión 2: placeholder mínimo para `bucket`/`config` cuando el plugin
está deshabilitado, vía `DISABLED_S3_PLACEHOLDER` en
`media-storage.ts`.**

`s3Storage()` exige `bucket: string` y `config: AWS.S3ClientConfig` por
tipo, sin importar `enabled`. Verificado en el código fuente: ambos solo
se leen dentro de `getStorageClient()`, y `getStorageClient()` solo se
invoca desde `createS3Adapter()`, que solo se construye en la rama que
corre DESPUÉS del `if (isPluginDisabled) return` - es decir, nunca en
modo deshabilitado. `bucket` sí se usa para construir `cacheKey =
s3:${bucket}` (una clave de un `Map` en memoria, antes del check de
`enabled`), pero eso nunca abre una conexión real. Un helper con un valor
constante y un comentario explicando por qué es seguro evita esparcir
strings falsos por el archivo.

## Risks / Trade-offs

[Riesgo] El contenedor de desarrollo (`compose.yaml`) sigue regenerando
`importMap.js` en vivo en cada recompilación del admin (comportamiento
intencional de Payload, no algo que este fix cambie) → Mitigación: ya no
es un riesgo real, porque la regeneración de dev y la de
producción/E2E ahora convergen al mismo resultado (ver `scripts/
verify-importmap.sh`, que prueba exactamente esa convergencia). Un
`git status` puede seguir mostrando el archivo como "modificado" mientras
el contenedor de desarrollo está corriendo con cambios sin commitear en
`payload.config.ts`/plugins - es ruido esperado, no una regresión.

[Riesgo] Un cambio futuro en `media-storage.ts` (o en otro plugin) podría
reintroducir un registro condicional de plugin sin que nadie lo note
localmente, porque el síntoma (Admin sin hidratar) solo aparece con S3
configurado, casi siempre en producción real → Mitigación:
`scripts/verify-importmap.sh` (`pnpm test:importmap`, encadenado en
`pnpm test`) falla determinísticamente en CI/local sin necesitar Docker
ni S3/MinIO real, comparando la regeneración en ambos entornos contra el
blob commiteado en `HEAD`.

## Migration Plan

Sin migración de datos ni de base de datos. Pasos de despliegue:

1. Commitear `src/payload/plugins/media-storage.ts`,
   `src/app/(payload)/admin/importMap.js` regenerado,
   `scripts/verify-importmap.sh` y el `test:importmap` de `package.json`.
2. Cualquier ambiente que reconstruya su imagen (dev, test, producción)
   recibe automáticamente el import map correcto - no requiere ningún
   paso manual adicional, porque la regeneración en cualquier entorno ya
   converge al mismo resultado.

Rollback: revertir el commit. El código previo (`isS3Configured() ?
[s3Storage(...)] : []`) sigue siendo funcionalmente válido para
almacenamiento (solo reintroduce el bug de import map), así que revertir
es seguro si apareciera algo inesperado.
