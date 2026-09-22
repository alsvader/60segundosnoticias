## Context

- `src/payload/fields/slug-field.ts` devuelve un `text` `required`/`unique`/`index` en el sidebar. `Categories` y `Pages` le pasan `validate` con `createNamespaceSlugValidate` (`src/payload/fields/validate-namespace-slug.ts`).
- `Posts` genera el slug en `hooks.beforeValidate` (`src/payload/hooks/posts/slug-lifecycle.ts`). En el admin, el form-state (`buildFormState`) valida `required` en el servidor sin correr los hooks de la Collection, así que el formulario queda inválido y no se envía.
- `Users` declara su propio `slug` (`text`, `unique`, opcional).
- `Posts` y `Pages` tienen `versions.drafts: true`. Ninguna Collection usa `autosave`.
- Payload 3.87.1 exporta `slugField` (`payload`), marcado como `@experimental`. Es un `row` con un checkbox oculto `generateSlug` (default `true`) y el `text` del slug. El checkbox tiene un hook `beforeChange` que:
  - en `create`, asigna `slug = slugify(data.slug || data[useAsSlug])` y guarda `generateSlug = !slug`, o sea `false` en cuanto hay slug;
  - en `update` sin autosave, regenera solo si `generateSlug` sigue en `true`.
  - El admin muestra `@payloadcms/next/client#SlugField`, con candado y botón "Generar" que llama al `slugify` del servidor.
- Los hooks de redirect (`hooks/{posts,pages,categories}/redirect-lifecycle.ts`) reaccionan a cambios de `slug` y no dependen de cómo se generó.

## Goals / Non-Goals

**Goals:**
- Un solo helper de campo para las cinco Collections, con la misma normalización y deduplicación.
- Usar el campo nativo de Payload (el que recomienda su documentación) en vez de mantener un componente propio.

**Non-Goals:**
- Regenerar slugs que ya existen o hacer backfill de `Users` sin slug.
- Deduplicar slugs escritos a mano.

## Decisions

### D1. Usar el `slugField` nativo de Payload, envuelto en `src/payload/fields/slug-field.ts`
El helper del proyecto queda con esta firma: `slugField({ collection, useAsSlug, namespaceCollection?, required? })`. Por dentro llama a `payloadSlugField({ useAsSlug, slugify, position: 'sidebar', required, overrides })`.
- Alternativa: arreglar solo el hook `beforeValidate` y poner `required: false`. Se descarta porque no ofrece la experiencia de admin (candado y botón "Generar") y habría que repetir el hook en cada Collection.
- Alternativa: un componente de admin propio. Se descarta: es más código, y Payload ya lo trae.
- Riesgo de la API experimental: todo queda encapsulado en un solo archivo. Si Payload la cambia, se ajusta ahí.

### D2. `slugify` propio en `src/lib/url/slugify.ts`
Hace NFD, quita `\u0300-\u036f`, pasa a minúsculas y cambia `[^a-z0-9]+` por `-`. El de Payload (`[^\w-]+`) elimina las letras con acento ("Política" → "poltica"). La función se mueve de `hooks/posts/slug-lifecycle.ts` para no perderla. Vive en `src/lib/url` (junto a `canonical.ts`) porque no depende de Payload y se puede probar como unidad. También exporta `SLUG_PATTERN`.

### D3. Deduplicación en un hook `beforeValidate` del campo `slug`
Hallazgo durante la implementación: el hook `generateSlug` de Payload 3.87.1 asigna `data.slug = slugify(...)` **sin `await`**. Un `slugify` asíncrono deja una `Promise` en `slug` y la validación falla. Por eso:
- el `slugify` que recibe `payloadSlugField` es **síncrono** y solo normaliza;
- la deduplicación asíncrona vive en un `hooks.beforeValidate` del propio campo `slug`, que se agrega con `overrides`. Si el slug viene vacío y no había uno previo (`previousValue`), lo llena desde el campo fuente (de `siblingData` o, si no viene ahí, de `originalDoc`). Revisa candidatos `base`, `base-2`, `base-3`, … hasta que uno no sea reserved (`isReservedSlug`, solo con `namespaceCollection`), no exista en `collection` (excluyendo el propio `id`) y no exista en `namespaceCollection`. Las consultas usan `req.payload.find` con `depth: 0`, `limit: 1` y `req` para compartir la transacción. Como `beforeValidate` corre antes de `beforeChange`, el hook de Payload encuentra el slug ya lleno y solo lo normaliza. Además deja `generateSlug = false`;
- el botón "Generar" del admin usa `custom.slugify` (Payload lo espera con `await` en su server function `slugifyHandler`). Se reemplaza por la versión asíncrona que deduplica, tratando el slug actual del documento como libre.

Un slug escrito a mano solo se normaliza. Los choques de un slug manual los siguen rechazando `unique` y `createNamespaceSlugValidate`.
- Alternativa: un hook `beforeValidate` de la Collection. Se descarta porque dejaría la lógica partida entre el campo y cada Collection.

### D4. `validate` del campo
Se agrega con `overrides`:
- con valor vacío devuelve `'El slug es obligatorio.'` si el campo es `required`, y `true` si no (`Users`);
- con valor, valida el formato `^[a-z0-9]+(?:-[a-z0-9]+)*$` y, para `Categories`/`Pages`, delega en `createNamespaceSlugValidate`.

Se verificó en el admin real que el form-state no bloquea el envío con el slug vacío. Un control que rechaza cualquier valor sí bloquea el guardado; rechazar solo el vacío no, porque cuando se valida el slug ya fue llenado. Por eso no hace falta tolerar el vacío en campos obligatorios.

### D5. Migración: `generate_slug = false` en las filas existentes
La columna se crea con default `true`, que es lo que Payload necesita para los documentos nuevos. Sin un `UPDATE`, la siguiente edición de un documento existente regeneraría su slug desde el título (rama `update` sin autosave) y cambiaría URLs publicadas. Por eso la migración hace `UPDATE ... SET generate_slug = false` en `posts`, `_posts_v` (`version_generate_slug`), `pages`, `_pages_v`, `categories`, `tags` y `users`.

Además, el helper envuelve el hook `beforeChange` del checkbox: en `update`, si el documento ya tenía `slug`, devuelve `false` sin tocar el slug. Así la estabilidad no depende de los datos de la migración. Hallazgo: la base de desarrollo local sincroniza el esquema con schema push (no corre migraciones), y la columna quedó en `true` en todas las filas existentes. La migración se mantiene para dejar consistentes los datos de producción.

### D6. Users
Usa `slugField({ collection: 'users', useAsSlug: 'displayName', required: false })`. Mantener `required: false` evita una migración `NOT NULL` sobre usuarios que hoy no tienen slug. Los nuevos siempre lo reciben porque `displayName` es obligatorio.

## Risks / Trade-offs

- [Payload corrige el `await` faltante en `generateSlug` o cambia el orden de los hooks] → Las pruebas de integración cubren generación, deduplicación y estabilidad, y fallarían en una actualización.
- [`pnpm test:importmap` restaura `importMap.js` a `HEAD` al terminar] → Si se corre antes de hacer commit se pierde la entrada `SlugField`. Hay que regenerarlo y hacer commit antes de correr el guard.
- [Carrera: dos creaciones simultáneas con el mismo título] → El índice `unique` rechaza la segunda. Se acepta (el volumen editorial es bajo).
- [API `@experimental` de Payload] → Queda encapsulada en `slug-field.ts` y las pruebas de integración la cubren en cada actualización de Payload.
- [La columna `generate_slug` aparece en la API REST/GraphQL] → Es un booleano inocuo y el admin la oculta.

## Migration Plan

1. `pnpm migrate:create auto_slug_generation` y editar la migración para agregar el `UPDATE` de D5 en `up`. `down` borra las columnas (lo genera Payload).
2. Desplegar de forma normal. Las migraciones corren en el arranque según el flujo de producción ya documentado.
3. Rollback: correr la migración `down` y revertir el código. Los slugs existentes no cambian en ningún sentido.
