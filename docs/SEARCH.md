# 60 Segundos Noticias — Search (Fase 9)

Este documento describe la implementación de `openspec/changes/site-search/` (Master Spec §36). Los requisitos de producto viven en `docs/60-segundos-spec.md`; este archivo documenta convenciones de implementación y comportamiento del plugin verificado en vivo contra la versión instalada.

Versión instalada: `@payloadcms/plugin-search@3.87.1` (fijada exacta, igual que el resto de `@payloadcms/*` en este proyecto — el monorepo de Payload libera todos sus paquetes en lockstep, no hay un rango de compatibilidad independiente).

## Arquitectura

```text
/buscar?q=...&page=N
  → searchContent() (src/lib/data/search.ts)
  → Collection `search` (@payloadcms/plugin-search)
  → PostgreSQL
```

Sin servicio de búsqueda externo (Algolia/Elasticsearch/OpenSearch/Meilisearch/Typesense) — decisión de escala inicial del proyecto, documentada como tal en el Master Spec, no una afirmación de que sea innecesario para siempre.

## Collections indexadas

`collections: ['posts', 'pages']` (`src/payload/plugins/search.ts`). **Categories NO se registran** como Collection indexada — su `name`/`slug` solo llegan al registro de Search de un Post a través de `buildPostSearchDoc()` (`src/payload/plugins/build-search-doc.ts`), nunca como documento de Search propio.

## Forma del documento de Search

Por defecto el plugin solo sincroniza `title` (+ `doc: {relationTo, value}` + `priority`) — cualquier otro campo debe declararse explícitamente vía `searchOverrides.fields` y poblarse en `beforeSync`. Este proyecto agrega:

| Campo | Origen | Propósito |
|---|---|---|
| `excerpt` | `Post.excerpt` / `Page.seo.metaDescription` | Extracto mostrado en el resultado |
| `searchText` | Texto plano derivado (ver abajo), acotado a 2000 caracteres | Matching de cuerpo/bloques |
| `slug` | `Post.slug` / `Page.slug` | Construcción de URL canónica |
| `categorySlug` / `categoryName` | `Post.primaryCategory` resuelto | URL canónica + matching (Pages: vacío) |
| `publishedAt` | `Post.publishedAt` | Orden de relevancia secundario (Pages: `null`) |

`priority` lo fija el propio plugin a partir de `defaultPriorities` (`posts: 10`, `pages: 5`) — `beforeSync` no lo toca. En igualdad de condiciones, Posts rankean antes que Pages.

Deliberadamente NO se indexa: el documento Lexical completo, IDs de `User`/`Author` crudos, URLs de Admin/Preview, ni el JSON crudo de ningún Page Block.

## Extracción de texto buscable (`beforeSync`)

- **Posts / bloque `richText`**: `extractLexicalText()` (`src/payload/hooks/lib/lexical-text.ts`), reutilizado desde el cálculo de `readingTimeMinutes` (Fase 3) — no se escribió un segundo parser Lexical. Como parte de esta fase se corrigió un gap real: `GalleryBlock.images[].caption` no se extraía porque la clave del campo (`images`) no estaba en el allowlist de claves tipo-texto; ahora cualquier objeto anidado sin forma de nodo Lexical (`{image, caption}`) también se escanea contra ese mismo allowlist.
- **Page Blocks no-Lexical** (`Hero`/`ImageText`/`CTA`/`FAQ`/`Banner`): `extractPageSearchText()` (`src/payload/plugins/extract-page-search-text.ts`) — recorrido plano de los campos de texto público de cada block (`eyebrow`/`title`/`description`/`content`/`link.label`/`items[].question`/`items[].answer`), delegando en `extractLexicalText()` solo para el bloque `RichText`. `Gallery`/`Video` (Page Blocks que reexportan los blocks de Artículo) extraen `images[].caption`/`caption` directamente.

## Política de Drafts

`syncDrafts: false`, `deleteDrafts: true`. Comportamiento confirmado en vivo (no solo en la documentación del plugin):

- Draft nunca publicado → nunca se sincroniza.
- Publicar → se crea el registro de Search.
- Actualizar contenido ya publicado → el registro se actualiza.
- **Guardar una nueva revisión en Draft sobre un Post/Page ya publicado** → el registro de Search **no se toca** (sigue reflejando la última versión publicada) — el propio hook del plugin vuelve a consultar `draft: false` antes de decidir si borra, y como sigue existiendo una versión publicada, no la borra ni la sobreescribe con el contenido del Draft.
- Despublicar o eliminar → el registro se remueve.

## Acceso de la Collection `search`

`create`/`update`/`delete`: solo Admin (`isAdmin`) — Admin lo necesita, además, para poder usar la acción "Reindex" del propio plugin (exige `update` + `delete` sobre `search`). `read`: público (`anyone`), igual que `Categories`/`Media` — el índice, por la política de sync de arriba, solo contiene contenido ya publicado.

## Reindexación

La Admin UI expone un botón "Reindex" sobre la Collection `search` (endpoint `POST /api/search/reindex`, gestionado por el propio plugin). Comportamiento confirmado en vivo:

- Borra los registros existentes de las collections seleccionadas antes de reconstruir — **idempotente**: ejecutarlo dos veces no duplica resultados.
- Respeta `syncDrafts`: con `syncDrafts: false`, solo indexa contenido `_status: published`.
- Requiere que el usuario que la invoca tenga `update` + `delete` sobre `search` (Admin).
- No se dispara automáticamente al iniciar la aplicación — es una acción manual.

En el runbook de primer arranque de producción (`docs/OPERATIONS.md` §"Primer arranque"), este Reindex es el paso 7 — después de crear el primer Admin, correr `seed:initial` y publicar contenido real, y antes del smoke público. Ese mismo runbook aclara que el reindex **no** recurre en cada despliegue: solo cuando una release cambia qué Collections se indexan o la extracción `beforeSync`.

**Runbook de despliegue** (production automation es Fase 10; aquí solo la secuencia):

```text
1. pnpm migrate:create (revisar el SQL generado)
2. verificar la cadena de migraciones contra una base descartable
3. aplicar la migración en producción
4. desplegar la app con el plugin registrado
5. ejecutar Reindex (Admin UI) sobre Posts/Pages publicados
6. verificar la Collection `search` poblada
7. recién entonces enlazar/anunciar /buscar
```

## Semántica de búsqueda / limitaciones conocidas de V1

`searchContent()` arma un `where: {or: [{title:{contains:q}}, {excerpt:{contains:q}}, {searchText:{contains:q}}]}`. En el adaptador Postgres, `contains` (igual que `like`) se traduce a `ILIKE`, y — confirmado en el código fuente del adaptador — el valor de búsqueda se **divide por espacios y cada palabra se exige por separado (AND) dentro del mismo campo**, unidas con `OR` entre campos.

Limitaciones V1 documentadas explícitamente (no resueltas aquí, por diseño):

- **Sin insensibilidad a acentos**: "México" no coincide con "Mexico" (`ILIKE` no normaliza acentos; requeriría la extensión `unaccent` de Postgres, deliberadamente no agregada en V1).
- **Sin matching entre campos**: si las palabras de la búsqueda están repartidas entre `title` y `searchText` sin que ninguno de los dos las contenga todas, ese resultado no aparece.
- Sin tolerancia a errores tipográficos, sinónimos, ni stemming.
- Sin ranking de texto (no hay full-text search) — solo `priority` (Posts > Pages) + `publishedAt` como orden secundario.

## Cache

`searchContent()` es la única función del DAL deliberadamente **sin** `unstable_cache` (ver `docs/FRONTEND-ARCHITECTURE.md`) — la cardinalidad de `q` es arbitraria. La sincronización del índice (hooks del propio plugin) es la fuente de verdad de frescura de Search, sin relación con `src/lib/cache/*` (Fase 8).

## Variables de entorno

Ninguna nueva.
