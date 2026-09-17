## 1. Registro estructural del plugin S3

- [x] 1.1 `src/payload/plugins/media-storage.ts`: registrar `s3Storage()`
  siempre (nunca `isS3Configured() ? [s3Storage(...)] : []`), pasando
  `enabled: isS3Configured()`. Verificar con `pnpm typecheck` y
  `pnpm lint`.
- [x] 1.2 Verificar contra el código fuente instalado de
  `@payloadcms/storage-s3`/`@payloadcms/plugin-cloud-storage` 3.87.1 que
  `enabled: false` no crea el cliente S3 real (`getStorageClient()` solo
  se llama desde `createS3Adapter()`, nunca alcanzado en esa rama) ni fija
  `disableLocalStorage: true`. Documentado en design.md, Context.

## 2. Import map committeado

- [x] 2.1 Regenerar `src/app/(payload)/admin/importMap.js` con
  `pnpm payload generate:importmap` y confirmar que
  `@payloadcms/storage-s3/client#S3ClientUploadHandler` está presente vía
  `grep`.
- [x] 2.2 Confirmar que el archivo regenerado es idéntico (mismo
  `git hash-object`) tanto sin variables `S3_*` como con las variables
  `S3_*` de prueba (MinIO, `.env.test`/`compose.test.yml`).
- [x] 2.3 Confirmar que la regeneración automática del contenedor de
  desarrollo (`compose.yaml`, disparada por recompilaciones del admin) ya
  no revierte el archivo a una forma sin S3 - verificado forzando
  recompilaciones y comparando `git hash-object` antes/después.

## 3. Guard de regresión

- [x] 3.1 `scripts/verify-importmap.sh` (nuevo): regenera el import map
  sin `S3_*` y con `S3_*` de prueba, comparando ambos resultados contra
  el blob commiteado en `HEAD` (`git rev-parse HEAD:<path>`); falla con
  mensaje explícito si alguno difiere. No requiere Postgres/Docker real.
- [x] 3.2 `package.json`: agregar `test:importmap` y encadenarlo en
  `pnpm test`. Verificar con `pnpm test:importmap` (pasa) y con una
  reproducción manual del bug original (archivo commiteado sin la entrada
  de S3) para confirmar que el guard falla como se espera.

## 4. Restaurar el smoke de Admin

- [x] 4.1 `tests/e2e/admin-smoke.spec.ts`: correr contra un build de
  producción fresco con MinIO (`pnpm exec playwright test
  tests/e2e/admin-smoke.spec.ts --project=chromium`) y confirmar que pasa
  - login de Admin con las fixtures E2E deterministas alcanza la
  colección de Posts.
- [x] 4.2 Actualizar `openspec/changes/testing-qa-performance/tasks.md`,
  tarea 6.9: marcarla hecha, reemplazando la nota BLOQUEADO por la
  resolución y la referencia a este change.

## 5. Verificación general

- [x] 5.1 `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` y
  `pnpm test:importmap` pasan todos tras el cambio.
