## Context

Ver `proposal.md` - Why. Estado actual relevante (confirmado por inspección directa del código, Phase 2 ya archivada):

- `Posts.access`: `read` es público-solo-publicado / cualquier autenticado-todo; `create`/`update` es `isAdminOrWriter` sin chequeo de ownership; `delete` es `isAdmin`. `author` es una relación libre (`relationTo: 'users'`), sin hook. `publishedAt` es un `date` plano sin hook. `readingTimeMinutes` es `number` con `admin.readOnly: true` (solo UI, no bloquea escritura por API).
- `Media.access`: `create`/`update` es `isLoggedIn` (cualquier Writer o Admin), sin campo de ownership en el schema ni en `payload-types.ts`.
- `Categories.access`: `create`/`update`/`delete` ya es `isAdmin`; no existe protección de eliminación por referencias.
- `Users.access`: `create`/`update`/`delete` ya es `isAdmin`; `role.update` ya restringido a Admin (field-level). No existe protección de eliminación por referencias.
- `src/payload/access/roles.ts` no tiene ninguna función consciente de ownership (`isOwner`/similar).
- `src/payload/hooks/` existe y está vacío. El único hook custom hoy es `Users.beforeLogin`.
- `Posts.content` usa `createArticleEditor()` (`src/payload/fields/article-editor.ts`): Lexical con `BlocksFeature` restringido a 6 Article Content Blocks (Image, Gallery, Video, Quote, Callout, Embed) embebidos como nodos dentro del JSON de Lexical.
- El CLI de Payload (`payload generate:types`, `payload migrate*`) no resuelve alias `@/*` y no soporta imports ESM con top-level await ni el guard `server-only` en el grafo de módulos que carga — ver `design.md` de `payload-cms-core` (archivado). Cualquier código nuevo cargado por el CLI de Payload (config, collections, hooks, scripts de seed ejecutados con `payload run`) debe seguir la misma disciplina: imports relativos con extensión `.ts` explícita, sin `@/*`, sin `server-only`.
- `payload.config.ts` no configura `prodMigrations`; solo existe la migración inicial de Phase 2.

## Goals / Non-Goals

**Goals:**
- Aplicar todas las reglas de ownership, publish/unpublish, reading time, protección de eliminación y seeds server-side, vía Payload Access Control y hooks — nunca solo en el Admin UI.
- Mantener los drafts parciales funcionando (no volver campos `required` de forma incondicional).
- Reutilizar y extender `src/payload/access/roles.ts` en vez de crear una segunda utilidad de acceso paralela.
- Un módulo de hook por responsabilidad, sin escrituras internas (`payload.create`/`payload.update`) dentro de los propios hooks, para eliminar por construcción el riesgo de recursión.

**Non-Goals:**
- No se crean redirects automáticos, Draft Mode, revalidación, sitemap/robots ni renderizado de SEO/JSON-LD (Phase 8).
- No se reconfigura `versions`/`drafts` de Posts/Pages (ya correcto desde Phase 2); esta change solo verifica el comportamiento de versionado/restore, no lo re-implementa.
- No se crean Globals (Navigation/Home/SiteSettings) ni se les da contenido de seed.
- No se introduce un rol `editor` ni scheduled publishing (fuera de alcance de V1 completo, no solo de esta phase).
- No se agrega ninguna dependencia externa nueva para el cálculo de reading time.

## Decisions

### D1: Una sola función de acceso `isOwnerOrAdmin`, reutilizada
`src/payload/access/roles.ts` gana una función `isOwnerOrAdmin` que compara `doc.author` (o el campo de ownership relevante) contra `req.user.id`, con `role === 'admin'` como bypass. Se reutiliza para `Posts.access.update` (comparando `author`) y `Media.access.update` (comparando `uploadedBy`), en vez de escribir dos funciones casi idénticas.

Alternativa considerada: una función de acceso completamente distinta por Collection. Rechazada — duplica lógica que ya es genérica (comparar un campo de relación contra el usuario actual).

### D2: Lectura de Posts como función de acceso con query-constraint
`Posts.access.read` se reescribe para devolver, según el caso: `true` para Admin; `{ or: [{ _status: { equals: 'published' } }, { author: { equals: req.user.id } }] }` para un Writer autenticado; `{ _status: { equals: 'published' } }` para anónimo. Este patrón ya existe parcialmente en el código actual (el `read` de Posts de Phase 2 ya devuelve un objeto de query-constraint para el caso anónimo) — se extiende, no se reemplaza por un mecanismo distinto.

### D3: Orden y tipo de hook para ownership, publish-validation y reading-time
Los tres se implementan como hooks `beforeChange` separados en el array `Posts.hooks.beforeChange`, en este orden: `enforceAuthor` → `publishValidation` → `computeReadingTime`. Payload ejecuta los hooks de un mismo tipo en el orden del array, cada uno recibiendo el `data` devuelto por el anterior — así `publishValidation` ya ve el `author` correcto cuando el creador es un Writer, y `computeReadingTime` corre independientemente de los otros dos (no depende de su resultado, pero no hace daño que corra después).

Cada hook es una función pura: recibe `{ data, originalDoc, req, operation }` y devuelve `data` modificado, o lanza un error de validación. Ninguno de los tres invoca `payload.create`/`payload.update` internamente — no hay escritura recursiva posible por construcción.

### D4: `enforceAuthor` — asignación y bloqueo de reasignación
- Si `req.user.role === 'writer'`:
  - `operation === 'create'`: fuerza `data.author = req.user.id`, ignorando cualquier valor recibido.
  - `operation === 'update'`: si `data.author` viene definido y difiere de `originalDoc.author`, se descarta el cambio (se conserva `originalDoc.author`).
- Si `req.user.role === 'admin'`: no se toca `data.author` — Admin controla libremente ese campo vía el campo normal del formulario/API.

### D5: `publishValidation` — validación al publicar, sin volver campos incondicionalmente requeridos
Se valida el conjunto `title, slug, excerpt, featuredImage, primaryCategory, author, content` únicamente cuando el documento **resultante** de este guardado queda con `_status: 'published'` (es decir, en cualquier guardado que deje o deje el Post publicado, no solo en la transición draft→published) — esto evita que una edición posterior pueda dejar un Post publicado en un estado inválido. Si falta algún campo, el hook lanza un error de validación (Payload `ValidationError`) y el guardado se rechaza; si el `_status` resultante es `draft`, no se valida nada de esto.

Alternativa considerada: validar solo en la transición draft→published (comparando `originalDoc._status` vs `data._status`). Rechazada — permitiría que una edición posterior de un Post ya publicado le vaciara un campo requerido sin que nada lo impida.

### D6: `publishedAt` — asignación única y estable, defendida también contra restore
En el mismo hook (o uno adyacente que corre junto a `publishValidation`), en cada guardado:
- Si `originalDoc?.publishedAt` ya tiene valor: `data.publishedAt` se fuerza siempre a `originalDoc.publishedAt`, sin importar qué value venga en `data` (esto cubre ediciones normales, unpublish/republish, y explícitamente una restauración de versión que reintroduzca un `publishedAt` viejo o `null` desde una versión histórica — decisión de producto ya resuelta).
- Si `originalDoc?.publishedAt` no tiene valor y el `_status` resultante de este guardado es `'published'`: `data.publishedAt = new Date()`.
- En cualquier otro caso (draft sin publishedAt previo): `data.publishedAt` permanece sin tocar (vacío).

### D7: `computeReadingTime` — extracción de texto de Lexical
Utilidad compartida `src/payload/hooks/lib/lexical-text.ts`: recorre recursivamente `content.root.children`, concatenando el texto de nodos `text`, y descendiendo también en los `fields` de nodos de tipo `block` (para capturar el texto de Quote/Callout/Embed, que llevan su propio texto editorial) y en cualquier `children` anidado (listas, citas). El resultado se cuenta en palabras y se calcula `Math.ceil(palabras / 200)`. El hook `computeReadingTime` (en `Posts.hooks.beforeChange`) llama a esta utilidad y sobrescribe `data.readingTimeMinutes` siempre, ignorando cualquier valor recibido del cliente — el `admin.readOnly: true` existente ya impide la edición en el Admin UI, pero no protege la API, así que la sobrescritura server-side es la protección real.

Sin dependencias externas nuevas — es una función de recorrido de árbol simple sobre el JSON que Payload ya entrega.

### D8: Ownership de Media
Nuevo campo `uploadedBy` en `Media` (`type: 'relationship'`, `relationTo: 'users'`, `admin.readOnly: true`), poblado por un hook `beforeChange` (`enforceUploader`) solo en `operation === 'create'`, mismo patrón que D4 pero sin el caso de bloqueo de reasignación (no hay requisito de que el campo sea inmutable para Admin, y Writer nunca lo edita porque es `readOnly` + poblado por el hook). `Media.access.update` pasa de `isLoggedIn` a `isOwnerOrAdmin` (comparando `uploadedBy`).

### D9: Deletion protection — Categories y Users
Dos hooks `beforeDelete`, uno en `Categories` y otro en `Users`, cada uno consultando `Posts` (`payload.find` con `overrideAccess: true` — la consulta es una comprobación de integridad del sistema, no una lectura en nombre de un usuario, así que no debe verse afectada por el nuevo scope de lectura de D2) por `primaryCategory`/`additionalCategories` o por `author` respectivamente, y lanzando un error (mismo patrón que ya usa `Users.beforeLogin`, que lanza `Forbidden`) si encuentra al menos un resultado.

### D10: Media/Tag deletion — verificar antes de implementar
Antes de escribir cualquier hook para Media o Tags, se verifica en vivo (Local API o REST) qué hace Payload/PostgreSQL por defecto al eliminar un documento referenciado por una relación `hasMany`/`upload` (¿la relación queda `null`, la fila de `_rels` se borra sola, o Payload/Postgres rechaza la operación?). Solo si esa verificación muestra que el Master Spec (AC-MEDIA-005, AC-TAG-004) no se cumple por defecto, se agrega protección custom equivalente a D9. Esto es una tarea de verificación en `tasks.md`, no una decisión de diseño pendiente — el procedimiento ya está definido, solo el resultado está por confirmar.

### D11: Seeds vía `payload run`
Payload 3.87.1 expone el subcomando `payload run <script>` (confirmado con `payload run` sin argumentos → "Please provide a script path to run"), que carga `payload.config.ts` igual que `generate:types`/`migrate` — sujeto a la misma disciplina de imports relativos con `.ts` explícito y sin `@/*`/`server-only` ya resuelta en Phase 2. Se crean `src/payload/seed/initial.ts` y `src/payload/seed/dev.ts`, cada uno un script que llama `getPayload({ config })` y usa la Local API con `overrideAccess: true` (son scripts de servidor de confianza, no peticiones en nombre de un usuario). `package.json` gana `"seed:initial": "payload run src/payload/seed/initial.ts"` y `"seed:dev": "payload run src/payload/seed/dev.ts"`.

`seed:initial` solo crea las Categories iniciales (con `colorTheme`/`icon` del conjunto oficial ya definido en `src/lib/constants/`), verificando por `slug` con `payload.find` antes de cada `create` para ser idempotente — no toca Navigation/Home/SiteSettings porque esos Globals no existen todavía. `seed:dev` crea Posts/Writers/Media/Pages de ejemplo sin chequeo de idempotencia estricto (es una utilidad de desarrollo, no se corre en producción) y nunca se invoca desde ningún hook de arranque de la aplicación.

### D12: Layout de hooks
```
src/payload/hooks/
  lib/lexical-text.ts
  posts/enforce-author.ts
  posts/publish-validation.ts     (incluye la lógica de publishedAt de D6)
  posts/reading-time.ts
  posts/slug-lifecycle.ts
  categories/prevent-delete-with-posts.ts
  users/prevent-delete-with-posts.ts
  media/enforce-uploader.ts
src/payload/seed/
  initial.ts
  dev.ts
```

## Risks / Trade-offs

- [Riesgo] El comportamiento exacto de los hooks `beforeChange`/`beforeValidate` de Payload 3.87.1 frente a drafts (qué `data`/`originalDoc` reciben en cada tipo de guardado: draft, publish, autosave) no está verificado en código propio todavía, solo documentado por Payload. → Mitigación: `tasks.md` incluye verificación en vivo de cada hook contra la instancia real antes de darlo por completo, igual que Phase 2 verificó su control de acceso en vivo.
- [Riesgo] Forzar `data.publishedAt = originalDoc.publishedAt` en cada guardado (D6) no deja ningún camino para que un Admin corrija manualmente un `publishedAt` erróneo. → Mitigación: el Master Spec no pide esa capacidad; si se necesita en el futuro, es una change separada.
- [Riesgo] La extracción de texto de Lexical (D7) puede subestimar el reading time si aparecen tipos de nodo no contemplados. → Mitigación: el Master Spec permite explícitamente un algoritmo aproximado y ajustable; no es un riesgo de corrección funcional.
- [Riesgo] `payload run` no fue probado en la práctica en este proyecto todavía (solo `generate:types`/`migrate` lo fueron en Phase 2). → Mitigación: tarea de smoke-test de `payload run` con un script trivial antes de construir los seeds reales.
- [Riesgo] El resultado de D10 (verificación Media/Tag) es desconocido hasta ejecutar la verificación. → Mitigación: procedimiento ya definido, con un criterio de aceptación claro (cumple o no cumple el Master Spec); si no cumple, la implementación adicional es del mismo tamaño que D9.

## Migration Plan

Único cambio de schema: agregar `uploadedBy` a `Media`. Pasos:
1. Editar `src/payload/collections/Media.ts` agregando el campo.
2. `docker compose run --rm app pnpm migrate:create add_media_uploaded_by` (mismo flujo ya documentado en el README de Phase 2).
3. Revisar la migración generada.
4. `pnpm generate:types` para regenerar `src/payload-types.ts`.
5. Commitear migración + tipos junto con el resto de la change.

Sin rollback especial: la migración `down` que genera Payload elimina la columna. No hay backfill de datos — los documentos de Media existentes de Phase 2 quedan con `uploadedBy` vacío, lo cual es aceptable (nunca se registró esa información).
