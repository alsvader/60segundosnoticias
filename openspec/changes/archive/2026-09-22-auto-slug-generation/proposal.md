## Why

En el admin de Payload el campo `slug` hay que llenarlo a mano en todas las Collections. En `Posts` ya existe un hook `beforeValidate` que lo genera desde `title`, pero el form-state del admin marca el `slug` vacío como inválido (`required: true`) y bloquea el guardado antes de que el hook corra. `Pages`, `Categories`, `Tags` y `Users` no tienen generación. Esto va contra §9.5 del Master Spec ("Generar slug desde el título al crearse cuando no exista; normalizar espacios, acentos y caracteres inválidos"). También obliga a los editores a inventar slugs y deja abierta la puerta a formatos inconsistentes.

## What Changes

- Todas las Collections con `slug` (`Posts`, `Pages`, `Categories`, `Tags`, `Users`) generan el slug de su campo fuente (`title`, `name` o `displayName`) al crearse, si no se indicó uno.
- Se usa el `slugField` nativo de Payload 3.87.1. Agrega el checkbox oculto `generateSlug` y el componente de admin con candado y botón "Generar". El `slugify` del proyecto quita acentos, que el de Payload elimina junto con la letra.
- El slug que se genera nunca se repite. Si ya existe en la Collection, es un reserved slug o, en `Categories`/`Pages`, coincide con el de la otra Collection del namespace raíz, se le agrega `-2`, `-3`, … Un slug escrito a mano no se modifica.
- Validación de formato (`a-z`, `0-9`, guiones simples) para los slugs escritos a mano.
- El slug no se regenera cuando se edita el campo fuente de un documento que ya existe.
- Migración: agrega la columna `generate_slug` y la pone en `false` en las filas que ya existen, para que sus slugs y URLs no cambien.
- Se elimina `src/payload/hooks/posts/slug-lifecycle.ts`. Su lógica pasa al campo compartido.

Fuera de alcance: slugs localizados, backfill de `Users` que hoy no tienen slug, cambios en el ciclo de vida de redirects (§30) y rutas `/autor/[slug]` o `/tag/[slug]`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `post-slug-lifecycle`: la generación, la estabilidad y la edición manual pasan de aplicar solo a `Posts` a aplicar en todas las Collections con slug. Se añaden la normalización del formato y el sufijo para evitar duplicados.
- `slug-namespace-integrity`: la generación automática de slugs de `Categories` y `Pages` evita reserved slugs y colisiones del namespace raíz. Se elimina la exclusión explícita de "sin generación automática".

## Impact

- Código: `src/payload/fields/slug-field.ts` (reescrito), `src/lib/url/slugify.ts` (nuevo), `src/payload/collections/{Posts,Pages,Categories,Tags,Users}.ts`, `src/payload/hooks/posts/slug-lifecycle.ts` (se elimina).
- Base de datos: nueva migración con la columna `generate_slug` en `posts`, `_posts_v`, `pages`, `_pages_v`, `categories`, `tags` y `users`.
- Generados: `src/payload-types.ts` y el importMap del admin (`@payloadcms/next/client#SlugField`).
- Tests: nueva suite `tests/integration/slug-generation.test.ts` y tests unitarios de `slugify`.
- Master Spec: §6.2, §6.3 y §9.5. Fase: mantenimiento posterior a la Fase 12 (cumple un requisito de V1 que estaba pendiente).
