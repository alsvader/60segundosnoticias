## Context

Ver `proposal.md` para la motivación. Fase 6 ya estableció la infraestructura sobre la que esta fase construye — no se reinventa nada de esto:

- DAL público con `overrideAccess: false` sin escape hatch (`src/lib/data/public-query.ts`).
- View models allowlist (`src/lib/view-models/`), incluido `mapUserToAuthorSummary()` ya correcto para Decisión 1.
- URL helpers completos (`src/lib/url/canonical.ts`: `getPostUrl`/`getCategoryUrl`/`getPageUrl`/`normalizePath`).
- Componentes reutilizables: `ArticleCard`, `CategoryCard`, `CategoryBadge`, `ArticleMetadata`, `Breadcrumbs`, `Pagination`.
- El patrón Payload Block → Resolver → View Model → Renderer → Section (`resolveHomeBlocks`/`HomeBlockRenderer`).
- El patrón de embed seguro por allowlist (`resolveExternalVideoUrl()` en `src/lib/editorial/video-provider.ts`).
- El patrón de carousel nativo (`overflow-x-auto` + scroll-snap, sin librería) usado por `FeaturedPosts`/`PostsByCategory`.
- El modelo de enlace reutilizable `linkFields`/`optionalLinkFields` (`src/payload/fields/link-fields.ts`), ya adoptado por `Banner`/`HeroNews`/`EditorialIntro`.
- La integridad de namespace de slug (`slug-namespace-integrity`, ya implementado): Categories/Pages nunca colisionan entre sí ni con un reserved slug — el resolver de `/<slug>` puede confiar en esa garantía sin revalidar nada.

Todas las decisiones de producto/arquitectura quedaron resueltas explícitamente por el usuario tras la exploración; este documento traduce esas decisiones a diseño técnico concreto.

## Goals / Non-Goals

**Goals:**
- Resolver `/<slug>` y `/<category>/<post>` reutilizando el mismo patrón DAL/view-model/renderer ya establecido, sin un segundo stack paralelo.
- Renderizar Lexical y los Article/Page Blocks de forma segura con la API oficial de `@payloadcms/richtext-lexical`.
- Migrar `page/CTA.ts` al modelo `linkFields` preservando los datos existentes, incluida la tabla de versiones de Pages.

**Non-Goals:**
- No se optimiza el algoritmo de Related Posts más allá de lo que exige el Master Spec (sin scoring por tags ni por `additionalCategories`).
- No se introduce ningún mecanismo de cache/revalidación nuevo — se hereda `force-dynamic` sin cambios.
- No se resuelve ninguna inconsistencia de contenido del Master Spec (por ejemplo, que "Share actions" aparezca dos veces en `§34`) — se implementa tal como está especificado.

## Decisions

**1. Root slug resolver secuencial, no paralelo.** Category primero (siempre pública, sin filtrado de draft), luego Page (`findOnePublished`). Alternativa considerada: `Promise.all` de ambas queries — descartada porque el namespace ya es mutuamente excluyente (nunca ambas resuelven), así que la ganancia de latencia no justifica la complejidad adicional; se puede revisar si el perfil de performance real lo amerita.

**2. El resolver de raíz vive en `[category]/page.tsx`, no en un `[slug]/` separado — corrección durante implementación.** El diseño original asumía `[slug]` y `[category]/[post]` como carpetas hermanas independientes; Next.js App Router lo rechaza en tiempo de ejecución ("You cannot use different slug names for the same dynamic path"), porque exige que todo segmento dinámico en la misma posición de ruta comparta un único nombre de parámetro. Se resolvió renombrando la carpeta a `[category]/page.tsx` (mismo nombre que `[category]/[post]/page.tsx`) — el resolver interno sigue tratando el valor como un slug raíz genérico (Category o Page), el nombre de la carpeta es solo la restricción de Next.js. Verificado en vivo: `/noticias` (Category), `/verificacion-page-blocks` (Page), 404 para inexistentes.

**3. Renderizado de Lexical vía la API oficial de `@payloadcms/richtext-lexical`, parametrizada por un mapa de converters por `blockType`.** El mismo mapa de converters (Image/Gallery/Video/Quote/Callout/Embed) se reutiliza tanto para el body de Article como para el `RichText` Page Block, ya que ambos comparten `createArticleEditor()`. La API exacta del converter React de la versión instalada (3.87.1) se confirma como primer paso de implementación (ver Riesgos). Alternativa descartada: escribir un serializer propio — mayor superficie de riesgo de seguridad y duplicación de una API que Payload ya mantiene.

**4. `EmbedBlock` con `provider: generic` se resuelve como tarjeta de enlace externo, nunca como iframe.** El resolver valida `url` como http(s) server-side y produce un contrato frontend-safe (`{url, hostname}` o similar); el componente solo muestra el destino como texto de enlace accesible con `rel="noopener noreferrer"`. No se hace fetch ni se ejecuta contenido remoto. Mismo principio de seguridad por validación server-side que `resolveExternalVideoUrl()`, pero sin necesidad de un allowlist de hostnames porque no hay renderizado enriquecido para `generic`.

**5. `VideoBlock` externo reutiliza `resolveExternalVideoUrl()` sin modificarlo.** `provider: uploaded` es un path nuevo y separado: `<video>` nativo con `poster`, sin proveedor externo ni parsing de URL.

**6. `GalleryBlock` en modo `carousel` reutiliza el patrón de scroll-snap nativo ya establecido en Fase 6** — cero dependencias nuevas, mismo comportamiento de accesibilidad por teclado/touch que `FeaturedPosts`/`PostsByCategory`.

**7. `(frontend)/error.tsx`**: boundary de cliente mínimo (`'use client'`, requerido por el mecanismo de error boundaries de Next.js App Router), sin lógica de negocio — captura el error, nunca expone detalles técnicos/stack trace, ofrece `reset()` como acción de recuperación cuando aplica, usa el Design System existente. Vive dentro de `(frontend)/`, no en la raíz de `src/app/`, para heredar `Header`/`Footer` del layout — corrección deliberada sobre el árbol ilustrativo de `§75/76` del Master Spec, que está documentado como guía de responsabilidades, no como estructura literal.

**8. `(frontend)/not-found.tsx`**: misma ubicación que `error.tsx` y por la misma razón (heredar el site shell para una experiencia 404 realmente de marca).

**9. Redirect canónico de categoría vía `permanentRedirect()` de `next/navigation`** (confirmado disponible en la versión instalada de Next.js, 16.3.3), apuntando a `getPostUrl(primaryCategory.slug, post.slug)`. Este redirect nunca escribe en la Collection `Redirects` — esa collection permanece exclusivamente para resolución histórica en Fase 8.

**10. Migración de `page/CTA.ts`: secuencia aditiva → transformación de datos → verificación → remoción**, extendiendo el precedente ya usado en Fase 6 para `HeroNews`/`Banner`/`EditorialIntro` (que fue solo-schema, sin preservar datos):
   1. Migración aditiva: agrega la nueva estructura `link` (grupo `linkFields`) junto a las columnas existentes `linkLabel`/`linkURL`, sin tocarlas.
   2. Transformación de datos (SQL, dentro de la misma migración o en una migración de datos separada): para cada fila de `page_blocks_cta` **y** de su tabla de versiones `_pages_v_blocks_cta` (Pages tiene `versions.drafts: true`) con `linkLabel`/`linkURL` no nulos, poblar `link.label = linkLabel`, `link.type = 'external'`, `link.url = linkURL`.
   3. Verificación contra una base PostgreSQL desechable: contar filas transformadas vs. filas con datos originales en ambas tablas antes de continuar.
   4. Migración de remoción: elimina las columnas viejas `linkLabel`/`linkURL` (solo schema), únicamente después de confirmar el paso 3.
   Cada paso se genera con `pnpm migrate:create`, se revisa a mano, y se verifica contra una base desechable — nunca contra la base de desarrollo push-managed, siguiendo la política de las cuatro bases ya documentada en `README.md`.

**11. `AuthorSummary`/`AuthorCard` sin cambios al view-model.** `src/lib/view-models/author.ts` ya expone exactamente el contrato aprobado por la Decisión 1 (`displayName`/`slug`/`avatar`/`bio`/`socialLinks`, nunca `name`/`email`/`role`/`active`). Solo se construye el componente de presentación `AuthorCard` nuevo; no se agrega ningún campo de URL/href de autor al view-model ni al componente, para no sugerir una ruta `/autor/[slug]` que no existe.

**12. `EmbedBlock` amplía sus providers controlados a `facebook`/`linkedin` (además de `instagram`/`x`/`tiktok`) y agrega un campo `alignment` (`left`/`center`/`right`, default `left`) — refinamiento post-implementación tras revisión visual manual.** Cada provider controlado se renderiza en un ancho fijo responsivo (550px vía `react-social-media-embed` para instagram/x/facebook/linkedin, o el 420px ya usado por TikTok pensado para su formato 9:16) para que `alignment` tenga efecto visual real — sin esto, el wrapper ocupaba el 100% de la columna y la alineación no se notaba. El `<figure>` envolvente aplica `justify-start/center/end` según el campo; sigue sin aceptar CSS/margen libre desde Payload (AC-CONTENT-004).

**13. Dos dependencias nuevas de runtime, con alcance explícitamente acotado: `@vidstack/react` (VideoBlock/VideoFeature) y `react-social-media-embed` (EmbedBlock: instagram/x/facebook/linkedin).** Corrige el "Sin dependencias nuevas" originalmente previsto en `proposal.md` — decisión post-implementación tomada durante la revisión manual, no un defecto de scope creep: ambas quedan confinadas a esos dos Content Blocks (nunca se usan para reemplazar Lexical, el patrón de scroll-snap de `GalleryBlock`, ni ningún otro componente ya cubierto por las Decisiones 3/4/5/6). TikTok y Facebook-video siguen resueltos con un iframe/SDK propio, sin pasar por `react-social-media-embed`.

**14. `ImageBlock` usa un campo `size` (`small`/`medium`/`large`/`full`) en vez del `alignment` (`normal`/`wide`/`full`) originalmente especificado — refinamiento post-implementación tras revisión visual manual.** `AC-BLOCK-IMG-001` en el Master Spec se actualizó para reflejar el modelo `size`; `AC-BLOCK-IMG-002` (sin CSS/margen libre desde Payload) sigue vigente sin cambios — cada valor de `size` sigue mapeando a una clase fija en el componente, nunca a una clase arbitraria proveniente del CMS.

**15. `VideoBlock` agrega un campo `portrait` (checkbox) para aspect ratio 9:16 (Shorts/Reels), y `resolveExternalVideoUrl()` se extiende (sin romper su contrato) para detectar YouTube Shorts verticales.** Adición aditiva sobre la Decisión 5; no cambia el comportamiento para video horizontal existente.

## Risks / Trade-offs

- [Riesgo] La API exacta de renderizado React de `@payloadcms/richtext-lexical` 3.87.1 no se verificó en la exploración (solo se confirmó que el paquete ya es dependencia) → Mitigación: primera tarea de implementación es confirmar esa API contra la versión real instalada, antes de construir los 6 converters de Article Blocks.
- [Riesgo] La transformación de datos de CTA debe cubrir tanto la tabla live como la de versiones de Pages; un error aquí pierde configuraciones de CTA existentes → Mitigación: verificación explícita contra base desechable antes de la migración de remoción (Decisión 10, paso 3), nunca se remueven las columnas viejas sin confirmar la transformación primero.
- [Riesgo] Confundir la corrección canónica en vivo (Fase 7) con el sistema de Redirects (Fase 8) durante la implementación → Mitigación: la Decisión 9 fija explícitamente que este redirect nunca escribe en la Collection `Redirects`; queda documentado en el requirement de `article-page`.
- [Trade-off] Reutilizar el mismo mapa de converters de Lexical para el body de Article y el `RichText` de Page acopla ambos consumidores a un solo módulo compartido → aceptado deliberadamente para evitar dos stacks de renderizado de rich text (Decisión 3); el costo es que un cambio futuro en ese módulo afecta a ambos contextos a la vez.

## Migration Plan

1. DAL nuevo (`getPostBySlug`/`getPageBySlug`/`getCategoryBySlug`/`getRelatedPosts`) y view models nuevos — sin tocar schema, desplegable de forma aislada.
2. Migración de `page/CTA.ts` en su propio paso, siguiendo la secuencia de la Decisión 10, verificada contra una base desechable antes de tocar la base de desarrollo o producción; `pnpm generate:types` al final.
3. Renderers (`ArticleBlockRenderer`, `PageBlockRenderer`) y rutas (`[category]/page.tsx`, `[category]/[post]/page.tsx`, `not-found.tsx`, `error.tsx`).
4. Verificación end-to-end con datos reales (mismos escenarios A-Q ya identificados en la exploración: membership inclusivo, draft nunca visible, corrección canónica, additional-category sin URL alterna, los 6/8 blocks, seguridad de autor) antes de archivar el change.

**Rollback**: cada paso de migración de Payload sigue el patrón ya establecido en el repo — cadena completa verificada contra una base desechable antes de tocar dev/producción. Si la verificación del paso 3 (transformación de datos de CTA) falla, no se procede al paso 4 (remoción) — las columnas viejas permanecen hasta corregir la transformación; no hay estado intermedio irreversible.

## Open Questions

- Estilo visual exacto de la tarjeta de fallback de `EmbedBlock` `provider: generic` — lo define el Design System al implementar; no cambia el contrato de los specs.
- Campo de desempate determinístico exacto para Posts con `publishedAt` idéntico en paginación/Related — la Decisión 7 del usuario ya autoriza agregarlo "si lo soporta limpiamente la API actual de Payload"; se confirma en implementación sin cambiar el spec.
