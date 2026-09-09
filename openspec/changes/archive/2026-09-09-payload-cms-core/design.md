## Context

Ver `proposal.md` para la motivación completa. Estado relevante confirmado por inspección directa antes de escribir este diseño:

- `payload.config.ts` tiene `collections: []`, `globals: []`, y usa `postgresAdapter` sin `migrationDir` ni `prodMigrations` configurados.
- No existe `src/payload/` en absoluto (ninguna Collection, block, field o hook previo).
- El adaptador Postgres instalado (`@payloadcms/db-postgres@3.87.1`, verificado en `node_modules/@payloadcms/db-postgres/dist/connect.js:109-121`) hace **push automático de schema en desarrollo** (`NODE_ENV !== 'production'`) y **ejecuta migraciones automáticamente al conectar** cuando `NODE_ENV === 'production'` y `prodMigrations` está configurado — dos comportamientos independientes, controlados por opciones distintas del adaptador.
- El CLI de Payload (`node_modules/.bin/payload`) falla al cargar `payload.config.ts` tal como existe hoy, por tres motivos distintos verificados durante la implementación: (1) `src/lib/env/index.ts` tiene `import 'server-only'`, y ese guard lanza un error fuera del bundler de Next.js; (2) el alias `@/*` de `tsconfig.json` no lo resuelve el loader del CLI (a diferencia de Next.js, que sí lo resuelve); (3) una vez que el grafo de imports de `payload.config.ts` incluye `@payloadcms/richtext-lexical` (vía `Posts`/`Pages`), su uso de top-level await ESM colisiona con el `require()` síncrono que el CLI usa para cargar el config (`ERR_REQUIRE_ASYNC_MODULE`).
- `@payloadcms/richtext-lexical` no está instalado; es requerido por `Posts.content` y el block `RichText` de Pages. Verificado como versión `3.87.1` disponible, compatible con `react@19.2.0` instalado.
- `sharp` no está instalado; requerido para que `Media.imageSizes` genere variantes reales.

## Goals / Non-Goals

**Goals:**

- Dejar las 7 Collections V1 con su schema completo (campos, relaciones, índices) registradas en `payload.config.ts`.
- Dejar los 6 Article Content Blocks y los 8 Page Blocks definidos y disponibles como dependencias de schema de `Posts`/`Pages`.
- Dejar el control de acceso base (lectura pública solo-publicado en Posts/Pages, protección de datos sensibles de Users, bloqueo de login por cuenta inactiva) funcionando server-side.
- Dejar la integridad de namespace de slugs (reserved slugs + colisión cruzada Categories↔Pages) funcionando.
- Dejar una primera migración de PostgreSQL explícita, versionada y commiteada.
- Dejar `src/payload-types.ts` generado, commiteado, y consumido por el resto del código donde aplique.
- Resolver el conflicto entre el módulo de validación de entorno (Phase 1) y el CLI de Payload sin debilitar la validación existente del runtime de la aplicación.

**Non-Goals:**

- Ningún hook de ciclo de vida editorial (generación de slug, ownership de Writer, workflow de publish/unpublish, reading time, seeds) — Phase 3.
- Ejecución automática de migraciones en producción (`prodMigrations` en `payload.config.ts`) — Phase 10.
- Creación automática de Redirects, redirect-chain flattening, manejo runtime de redirects — Phase 8.
- Cualquier Global (Home, Navigation, Footer, SiteSettings) o ruta pública de contenido.
- Almacenamiento de objetos en producción (S3/R2) para Media.
- Optimización de storage de blocks sin evidencia de un problema real (`blocksAsJSON` queda descartado para esta fase).

## Decisions

### D1. Control de acceso completo de Posts/Pages: lectura pública + escritura autenticada
`Posts.access.read` y `Pages.access.read` retornan `true` para usuarios autenticados y la constraint `{ _status: { equals: 'published' } }` para peticiones anónimas — el patrón estándar de Payload para "lectura pública solo de documentos publicados, lectura completa para usuarios con sesión". No requiere un hook adicional; es configuración de acceso, coherente con "CMS security baseline" y no con "editorial workflow".

`Posts.access` también define explícitamente `create`/`update: isAdminOrWriter` y `delete: isAdmin`. Esto no era parte del diseño original de esta decisión — Payload aplica `() => true` por defecto a cualquier operación de `access` no definida, así que una Collection que solo declara `read` queda con `create`/`update`/`delete` completamente abiertos a peticiones no autenticadas. Este hueco existió brevemente en la implementación (`Posts` solo tenía `access.read`) y se corrigió durante la verificación en vivo de la tarea 16.3, tras confirmar con una petición no autenticada que efectivamente podía crear/eliminar Posts. Las demás 6 Collections del change ya definían su bloque de `access` completo desde su creación.

**Alternativa considerada**: dejar `access.read` abierto en Phase 2 y confiar en que el frontend (Phase 5+) nunca solicite Drafts. Rechazada explícitamente por la decisión ya tomada de no dejar una ventana de exposición pública de Drafts vía REST/GraphQL.

### D2. Protección de datos sensibles de Users vía field-level access, no collection-level
`Users.access.read` a nivel de Collection permanece abierto (`() => true`) para que el "public author shape" (`displayName`, `slug`, `avatar`, `bio`, `socialLinks`) sea legible; los campos `email`, `role` y `active` llevan su propio `access.read: ({ req }) => Boolean(req.user)` a nivel de campo, ocultándolos de cualquier respuesta no autenticada sin bloquear el resto del documento.

**Alternativa considerada**: `access.read: () => false` a nivel de Collection completa (descartar toda lectura pública de Users). Rechazada porque el Master Spec exige que el "public author shape" exista como dato leíble (§14.1); el control fino a nivel de campo es el mecanismo correcto de Payload para "algunos campos públicos, otros no", sin necesitar una vista/endpoint paralelo.

### D3. Bloqueo de login por cuenta inactiva vía `hooks.beforeLogin`
Un hook `beforeLogin` en la Collection `Users` verifica `active !== false` y lanza un error antes de que Payload emita el token de sesión. Es el hook mínimo necesario — no toca ninguna otra parte del ciclo de vida del documento (creación, actualización, publicación), por lo que se mantiene como "seguridad base" y no como automatización editorial.

### D4. Migración baseline: `migrationDir` sí, `prodMigrations` no
`payload.config.ts` configura `db: postgresAdapter({ ..., migrationDir: 'src/payload/migrations' })`. Durante el desarrollo del schema de este change se sigue usando el push automático de desarrollo (ya activo por default). Una vez estabilizado el schema completo de Phase 2, se ejecuta `payload migrate:create` una sola vez, se revisa el SQL generado y se commitea. `prodMigrations` **no** se configura en este change — verificado que su sola presencia dispara `migrate()` automáticamente en cada `connect()` cuando `NODE_ENV=production` (`connect.js:116-120`), exactamente lo que la orquestación de Phase 10 debe decidir explícitamente, no heredar como efecto secundario de este change.

**Alternativa considerada**: configurar `prodMigrations` ahora "para dejarlo listo". Rechazada explícitamente — activaría ejecución automática de migraciones en producción sin que exista todavía una decisión de despliegue/orquestación (Phase 10).

### D5. Storage de blocks: relacional por default, sin `blocksAsJSON`
Los Article Content Blocks viven dentro del documento Lexical de `Posts.content` (vía `BlocksFeature`), no como tablas relacionales por block — Lexical serializa su árbol completo, blocks incluidos, como parte del JSON del editor. Los Page Blocks de `Pages.layout` usan el tipo `blocks` estándar de Payload con almacenamiento relacional por default (una tabla hijo por tipo de block, comportamiento nativo del adaptador). No se activa `blocksAsJSON` para ninguno de los dos casos, siguiendo la instrucción explícita de no optimizar storage sin evidencia de un problema.

### D6. Fields reutilizables en `src/payload/fields/`
`seoFields`, `slugField` (forma base: texto, único, indexado — sin hooks de generación) y `socialLinksField` se definen una vez y se importan donde corresponda (`seoFields` en Posts/Categories/Pages; `slugField` en Categories/Tags/Posts/Pages; `socialLinksField` en Users). No se crea `linkField` — no tiene consumidor real en este change.

### D7. Integridad de slugs vía `validate` functions, no hooks de ciclo de vida
`src/lib/constants/reserved-slugs.ts` exporta la lista compartida. Un `validate` function en `Categories.slug` y `Pages.slug` (a) rechaza reserved slugs y (b) consulta la otra Collection (`req.payload.find`) para rechazar colisiones cruzadas. Es validación de formato/integridad de datos — misma categoría que cualquier otro `validate` de campo, no un hook de "lifecycle" en el sentido de generación automática o transiciones de `_status`.

**Riesgo aceptado**: existe una ventana de condición de carrera pequeña entre dos creaciones simultáneas en Categories y Pages con el mismo slug (ambas podrían pasar la validación antes de que la primera se commitee). Aceptable dado el volumen de uso esperado (Admin/Writer, no un flujo público de alta concurrencia); no se introduce un mecanismo adicional de bloqueo para esto en Phase 2.

### D8. Tipos de Payload como paso explícito de validación
Se agrega el script `"generate:types": "payload generate:types"` a `package.json`. Se ejecuta una vez todas las Collections están registradas, y su salida (`src/payload-types.ts`) se commitea. `tasks.md` incluye la generación como parte de la validación del change (no como paso opcional), a diferencia del tratamiento en `bootstrap-technical-foundation` donde no había Collections cuyo tipo generar.

### D9. Compatibilidad de `payload.config.ts` con el CLI de Payload (env, imports, module system)
El CLI de Payload (`generate:types`, `migrate:create`, `migrate`) carga `payload.config.ts` fuera del bundler de Next.js, con un mecanismo de carga (tsx sobre un `require()` síncrono) más estricto que Next.js en tres aspectos distintos, verificados durante la implementación:

1. **`server-only`**: se crea `src/lib/env/payload.ts`, un módulo mínimo sin `import 'server-only'` que valida únicamente `DATABASE_URI` y `PAYLOAD_SECRET` (los dos valores que `payload.config.ts` necesita), usado exclusivamente por `payload.config.ts`. El módulo existente `src/lib/env/index.ts` (con el guard `server-only` y el schema completo) no cambia y sigue siendo usado por `instrumentation.ts` y `src/app/api/health/route.ts` dentro del runtime de Next.js.
2. **Alias `@/*` no resuelto por el CLI**: a diferencia de Next.js, el loader del CLI no resuelve el alias `@/*` de `tsconfig.json`. Por eso, `payload.config.ts` y todo su grafo de imports (Collections, blocks, fields, constantes en `src/payload/` y `src/lib/`) usan imports **relativos con extensión explícita** (p. ej. `'../../lib/constants/reserved-slugs.ts'`) en vez del alias. Esto requirió agregar `allowImportingTsExtensions: true` a `tsconfig.json`, seguro de habilitar porque el proyecto ya tiene `noEmit: true`. El código de la aplicación fuera de ese grafo (rutas de Next.js, componentes) sigue usando el alias `@/*` normalmente, sin cambios.
3. **Top-level await de `@payloadcms/richtext-lexical`**: una vez que `Posts`/`Pages` importan ese paquete (para Lexical `BlocksFeature`), su grafo ESM con top-level await hace que el `require()` síncrono del CLI falle con `ERR_REQUIRE_ASYNC_MODULE`. Se resolvió agregando `"type": "module"` a `package.json`, siguiendo la misma convención de la plantilla oficial de Payload 3.x (verificado contra `templates/blank/package.json` del repositorio de Payload en el tag `v3.87.1`, que también declara `"type": "module"`). Se verificó que este cambio no rompe `pnpm build`/`pnpm dev`/`pnpm lint` ni la imagen Docker.

**Alternativa considerada**: eliminar el guard `server-only` de `src/lib/env/index.ts` para que sea universalmente cargable. Rechazada porque debilitaría la protección contra inclusión accidental en un bundle de cliente que Phase 1 estableció deliberadamente para el módulo usado por el resto de la aplicación; la duplicación de dos campos entre ambos módulos es un costo menor que perder esa protección.

**Alternativa considerada**: cargar `payload.config.ts` con un flag/loader distinto que sortee estas limitaciones en vez de adaptar el código. Rechazada por mayor complejidad y por depender de comportamiento no documentado de `tsx`/Node para este caso específico; los tres ajustes aplicados son mínimos, coinciden con convenciones ya usadas por la plantilla oficial de Payload, y no alteran ningún comportamiento observable de la aplicación.

### D10. Dependencias nuevas
`@payloadcms/richtext-lexical@3.87.1` (exacto, igual al resto de paquetes `payload`/`@payloadcms/*`) y `sharp` (versión estable compatible con Node 24/Debian bookworm, igual que la imagen base del `Dockerfile`). Ninguna otra dependencia mayor se introduce.

### D11. `Media.mimeTypes` excluye SVG en esta fase
El conjunto inicial de tipos MIME permitidos en `Media` no incluye `image/svg+xml`. El Master Spec marca el SVG subido por usuarios como un caso que requiere manejo restrictivo por su capacidad de contener contenido activo (§13.2); en ausencia de un mecanismo de sanitización definido, la opción más simple y segura es no permitirlo todavía. Puede añadirse en una fase posterior junto con sanitización.

## Risks / Trade-offs

- **[Riesgo]** `pushDevSchema` puede solicitar confirmación interactiva ante warnings de posible pérdida de datos (verificado en `pushDevSchema.js`), lo cual podría colgar un proceso sin TTY (por ejemplo, `docker compose up -d`). → **[Mitigación]** mantener los cambios de schema aditivos mientras se itera en desarrollo; si aparece un warning, resolverlo interactivamente en una sesión con TTY antes de continuar, en vez de automatizar la iteración de schema en background.
- **[Riesgo]** Condición de carrera pequeña en la validación cruzada de slugs entre Categories y Pages (D7). → **[Mitigación]** aceptado dado el volumen de uso editorial esperado; no se introduce locking adicional en esta fase.
- **[Riesgo]** `sharp` es un binario nativo; posible mismatch entre la plataforma de desarrollo (macOS) y el contenedor Linux del `Dockerfile`. → **[Mitigación]** ya existe la disciplina de `node_modules` en volumen propio del contenedor (Phase 1, D8 de ese change); `sharp` se instala dentro del contenedor igual que el resto de dependencias nativas (`esbuild`, `@parcel/watcher`), sin cambios adicionales de proceso.
- **[Riesgo]** Duplicar dos campos de entorno entre `src/lib/env/index.ts` y `src/lib/env/payload.ts` (D9) puede desincronizarse si cambian los requisitos de esas variables. → **[Mitigación]** ambos módulos son pequeños y las variables que comparten (`DATABASE_URI`, `PAYLOAD_SECRET`) son estables; se documenta la relación entre ambos módulos con un comentario explicando por qué existen dos.
- **[Riesgo]** La superficie de configuración de Lexical `BlocksFeature` es relativamente nueva en el ecosistema de Payload 3.x y puede diferir entre versiones menores. → **[Mitigación]** verificar la API real contra `@payloadcms/richtext-lexical@3.87.1` instalado antes de implementar cada block, con la misma disciplina usada en Phase 1 para el resto de imports de Payload.
- **[Riesgo]** Esta es la primera migración real del proyecto; un error en el schema generado sería más costoso de corregir después de commitearlo. → **[Mitigación]** revisar manualmente el SQL generado por `payload migrate:create` antes de commitear, y validar contra un `docker compose down -v && docker compose up` limpio que la migración reconstruye el schema completo desde cero.
- **[Riesgo]** Payload aplica `() => true` por defecto a cualquier operación de `access` (`create`/`update`/`delete`) que una Collection no defina explícitamente — omitir una sola operación deja esa Collection abierta a peticiones no autenticadas, como ocurrió brevemente con `Posts` en este mismo change (ver D1). → **[Mitigación]** las 7 Collections de este change definen su bloque `access` completo (`read`/`create`/`update`/`delete`) explícitamente, nunca parcial; se recomienda mantener esta disciplina en Phase 3 y fases posteriores al modificar estas Collections.

## Migration Plan

Este change introduce el primer schema real de PostgreSQL del proyecto (no existen Posts/Categories/etc. en producción ni en ningún ambiente). Flujo:

1. Iterar el schema localmente usando el push automático de desarrollo (ya activo, sin cambios de configuración).
2. Una vez las 7 Collections y los 14 blocks están completos y verificados, ejecutar `payload migrate:create` para generar la primera migración.
3. Revisar el SQL generado, commitearlo en `src/payload/migrations/`.
4. Validar reconstruyendo el schema desde cero (`docker compose down -v && docker compose up`) para confirmar que la migración es reproducible.

No aplica estrategia de rollback de datos de producción — no existe ambiente de producción desplegado todavía. Revertir este change equivale a revertir los commits correspondientes.
