## Context

Ver `proposal.md` — Why. Grounding técnico (confirmado durante `/opsx:explore` de Fase 9, no solo de la documentación oficial del plugin):

- `payload.config.ts` no registra plugins hoy; no existe convención `src/payload/plugins/`.
- `extractLexicalText()` (`src/payload/hooks/lib/lexical-text.ts`) ya recorre el árbol Lexical de `Posts.content` (usado hoy solo por `computeReadingTime`) y ya excluye correctamente `EmbedBlock.url`/`provider` vía su allowlist de claves (`quote`/`title`/`content`/`caption`/`text`). Tiene un gap real: `GalleryBlock.images[].caption` no se extrae porque la clave del campo es `images`, no `caption`.
- Los 8 Page Blocks (`Hero`/`RichText`/`ImageText`/`Gallery`/`Video`/`CTA`/`FAQ`/`Banner`) tienen su texto público en campos escalares directos sobre cada objeto de `layout` (`Hero.title/eyebrow/description`, `ImageText.title/eyebrow/content`, `CTA.title/description/link.label`, `FAQ.items[].question/answer`, `Banner.title/description`) — fuera de cualquier árbol Lexical, salvo el propio bloque `RichText`.
- `@payloadcms/plugin-search` sigue el versionado en lockstep del monorepo de Payload: debe fijarse exactamente `3.87.1`, igual que el resto de `@payloadcms/*` ya instalado.
- Confirmado en el código fuente del plugin: sin `beforeSync`, solo se sincroniza `title` (+ `doc`/`priority`). `syncDrafts:false` + `deleteDrafts:true` deja intacto el registro publicado cuando se guarda un Draft sobre un documento ya publicado (vuelve a consultar `draft:false` antes de decidir si borra). El endpoint de Reindex es transaccional, secuencial por collection, y borra-antes-de-reconstruir (idempotente por construcción). El acceso por defecto de la Collection generada es `read:true`, `create:false`, `update`/`delete` sin definir.
- Ninguna lectura del DAL público existente es deliberadamente sin cache — todas usan `unstable_cache` + tags (`src/lib/cache/tags.ts`/`invalidate.ts`).
- `Pagination` (`src/components/editorial/pagination.tsx`) es presentacional puro; `[category]/page.tsx` ya resuelve `?page=N` con `notFound()` en páginas inválidas — precedente directo a reutilizar.
- `ArticleCardData` (`src/lib/view-models/article-card.ts` / `src/components/editorial/article-card.tsx`) ya es opcional en todo salvo `title`/`href`.

## Goals / Non-Goals

**Goals:**
- Indexar Posts y Pages publicados en la Collection `search` del plugin, con texto acotado y campos de display denormalizados (sin N+1 por resultado).
- Mantener `/buscar` como frontera de frontend estable (`searchContent()`), sin acoplar componentes React al documento crudo del plugin.
- Ciclo de vida de índice correcto a través de draft/publish/unpublish/delete, verificado contra el comportamiento real del plugin (no supuesto).

**Non-Goals:**
- Resolver la limitación de acentos/typos de V1 (Postgres `unaccent` u otra mitigación) — documentado como limitación conocida, no implementado aquí.
- Automatizar el reindex en el pipeline de despliegue de producción (Fase 10).

**Actualización (refinamiento de UX aprobado explícitamente tras la implementación inicial):** el Header/MobileNav SÍ exponen ahora una entrada visible a Search — ver la Decisión "Entrada de búsqueda en Header/MobileNav" abajo. El Master Spec sigue sin exigirlo explícitamente; se agrega porque, sin él, `/buscar` no era descubrible desde la navegación global.

## Decisions

**Plugin config en módulo propio (`src/payload/plugins/search.ts`)** — no existe convención `plugins/` previa; se prefiere un módulo dedicado a un bloque inline en `payload.config.ts` para mantener ese archivo legible, consistente con cómo Collections/Globals ya están extraídos a sus propios archivos. Alternativa descartada: config inline en `payload.config.ts` — funciona pero no escala si se agregan más plugins después.

**`collections: ['posts', 'pages']`** — decisión de producto ya aprobada (ver proposal.md). Categories no se registran; su `name`/`slug` viajan solo como campos denormalizados dentro del registro de Search de un Post.

**Campos denormalizados vía `searchOverrides.fields` + `beforeSync`** (más allá del `title` por defecto del plugin): `excerpt`, `searchText` (texto plano acotado), `slug`, `categorySlug` (Post) o ausente (Page), `publishedAt`, `priority`. Sin esto, cada resultado necesitaría un fetch adicional al documento fuente — contradice el principio de evitar N+1 ya establecido en el Master Spec para esta fase.

**Reutilizar `extractLexicalText()` en su ubicación actual, corrigiendo el gap de Gallery** — vive bajo `src/payload/hooks/lib/` (código de configuración de Payload, no de Next.js), y `beforeSync` corre en el mismo contexto de carga que los hooks de Collection, así que no hace falta reubicarlo a `src/lib/`. Se generaliza la recursión sobre arrays de objetos para que capture `images[].caption` sin depender de una clave fija, corrigiendo el único gap real encontrado. Alternativa descartada: escribir un segundo parser Lexical independiente — rechazada explícitamente por el Master Spec y sin justificación, dado que el existente es generalizable con un cambio acotado.

**Nuevo extractor de texto para Page Blocks no-Lexical** (Hero/ImageText/CTA/FAQ/Banner), co-ubicado junto a la config del plugin (`src/payload/plugins/search/`) por tener un único consumidor — no es un segundo parser Lexical (esos campos no son Lexical), es un recorrido de objetos planos; el bloque `RichText` de Page delega en `extractLexicalText()` para su propio `content`.

**`syncDrafts:false` / `deleteDrafts:true`** — política ya aprobada; comportamiento del plugin confirmado en su código fuente durante la exploración (una edición en Draft sobre un Post/Page ya publicado deja el registro de Search publicado intacto, sin blanquear ni actualizar con contenido de Draft).

**Acceso de la Collection `search`**: `create`/`update`/`delete` → solo Admin (necesario para que Admin use la acción de Reindex del propio plugin, que exige `update`+`delete`); `read` → público, igual que `Categories`/`Media` (`access.read: () => true`) ya lo son hoy. Alternativa descartada: cerrar `read` por completo y forzar todo acceso vía Local API con `overrideAccess:true` — innecesario, ya que el índice por construcción solo contiene contenido ya público (`syncDrafts:false`/`deleteDrafts:true`), y añadiría una excepción de acceso que el proyecto evita explícitamente en otros lados.

**`searchContent()` deliberadamente sin cache** (`src/lib/data/search.ts`) — primera lectura DAL del proyecto sin `unstable_cache`. Justificado por la cardinalidad arbitraria de `q`; documentarlo explícitamente en el propio archivo evita que un futuro reviewer lo confunda con un descuido.

**Relevancia**: `where` con `or` sobre `title`/`excerpt`/`searchText` (Payload `contains` → SQL `ILIKE` en `@payloadcms/db-postgres`), orden `[-priority, -publishedAt]`. `defaultPriorities`: Posts=10, Pages=5 (la representación numérica exacta es implementación; la relación Posts>Pages es lo que importa). Sin scoring de texto (título vs. cuerpo) — no soportado sin full-text search, y el Master Spec exige determinismo simple, no un motor de ranking.

**Resultado normalizado**: reutilizar `ArticleCardData` como forma de `SearchResult` (todo opcional salvo `title`/`href` ya calza para Post y Page), envuelto en `SearchResultPage{results, page, totalPages, totalDocs, query}` (`src/lib/view-models/search.ts`). Alternativa descartada: un `SearchResultCard` dedicado — se revisita solo si el resultado de Page necesita tratamiento visualmente distinto, lo cual no está pedido hoy.

**Ruta `/buscar`**: Server Component, `<form action="/buscar" method="get">`, 12 resultados/página (mismo valor que Category Page), `notFound()` en página inválida/fuera de rango (mismo patrón que `[category]/page.tsx`), metadata `robots: {index: false}`, sin entrada en `sitemap.ts`/`llms-txt.ts`.

**Entrada de búsqueda en Header/MobileNav** (refinamiento aprobado post-implementación, revisado una segunda vez tras feedback de interacción): `/buscar` mantiene su propio `SearchForm` compartido (`src/components/site/search-form.tsx` — mismo `<form action="/buscar" method="get">` de siempre, sin lógica de backend propia), reutilizado tal cual dentro del `Sheet` de `MobileNav`. El Header de escritorio, en cambio, usa un control propio (`src/components/site/header-search.tsx`) con un formulario inline: el ícono de búsqueda permanece anclado a la derecha y, al hacer clic, un `<input>` ya presente en el DOM se expande de derecha a izquierda (transición de `width`/`padding`/`opacity`, `duration-[var(--motion-normal)]`) — nunca un Popover/dropdown/modal. Alternativas consideradas:

- **`<details>/<summary>` nativo** (mismo patrón que los dropdowns de navegación del Header) — descartado: no cierra con Escape ni devuelve el foco al trigger sin JS adicional.
- **Un Dialog/modal grande de búsqueda** — descartado explícitamente: sobredimensionado para un campo + botón.
- **Popover de shadcn/Radix** — primera iteración de este refinamiento; descartada tras feedback explícito: la interacción deseada es que el propio ícono se expanda en línea dentro del Header, no que revele un panel flotante separado.
- **Control inline propio con `useState` local** (elegido) — el ícono siempre actúa como botón de submit una vez expandido; el primer clic solo expande (`preventDefault` vía el propio evento de clic, sin depender de estado de React aún no confirmado); `onSubmit` del formulario bloquea una búsqueda vacía leyendo el DOM directamente (sin problema de closure obsoleto); Escape colapsa y limpia el valor devolviendo foco al ícono; perder el foco fuera del formulario también colapsa (sin limpiar). Ancho expandido con `clamp()` (no un valor fijo) para no forzar el wrap de la navegación en viewports intermedios.
- **Mobile**: el mismo `SearchForm` se inserta directamente dentro del `Sheet` de `MobileNav` — reutiliza el manejo de foco/Escape/scroll-lock que `MobileNav` ya tenía (Radix Dialog), sin abrir un segundo mecanismo de overlay. El ícono expansivo del Header sigue montado en todos los tamaños de viewport (el `clamp()` reduce su ancho expandido en pantallas angostas).

## Risks / Trade-offs

- [Gap de extracción: `GalleryBlock.images[].caption` no se indexaba] → corregido generalizando `extractLexicalText()` como parte de esta implementación, no aceptado como limitación.
- [N+1 al renderizar resultados] → mitigado denormalizando `excerpt`/`searchText`/`slug`/`categorySlug`/`publishedAt` en el propio registro de Search.
- [`read` público en la Collection `search`] → mitigado: el índice solo contiene contenido ya público por política de sync; consistente con `Categories`/`Media`, no una excepción nueva.
- [Acento/typo insensible (`ILIKE` sin `unaccent`)] → aceptado y documentado como limitación V1 explícita, no resuelto aquí (ver Non-Goals).
- [Primera lectura DAL sin cache del proyecto] → documentado explícitamente en el código y en `docs/SEARCH.md` para que no se lea como omisión.
- [Reindex inicial en producción podría fallar a medio camino] → mitigado: el propio mecanismo de reindex es transaccional y borra-antes-de-reconstruir (idempotente); reintentar es seguro.

## Migration Plan

1. Registrar el plugin + `searchOverrides` en `payload.config.ts` vía `src/payload/plugins/search.ts`.
2. `pnpm generate:types` (agrega el tipo de la Collection `search`).
3. `pnpm migrate:create` — revisar el SQL generado (nueva tabla `search` + relación polimórfica para `doc`, sin tocar tablas de Posts/Pages/Categories).
4. Verificar la cadena de migraciones contra una base descartable (convención ya establecida en README) antes de tocar cualquier base gestionada por `migrate`.
5. Dev local: `docker compose up` sincroniza el nuevo schema vía push mode automáticamente — nunca correr `migrate` contra la base de desarrollo.
6. Rollout de producción (orquestación real es Fase 10, aquí solo la secuencia): aplicar migración → desplegar app con el plugin registrado → ejecutar Reindex manual autenticado (Admin) sobre Posts/Pages publicados → verificar la Collection `search` poblada → recién entonces considerar `/buscar` disponible para usuarios reales.
7. Rollback: revertir el registro del plugin y la migración; no hay pérdida de datos editoriales porque `search` es estado derivado, regenerable con un reindex.

## Open Questions

- Longitud exacta de acotamiento de `searchText` (p. ej. límite de caracteres) — parámetro de afinación, no cambia el contrato observable ni las specs; se decide en `tasks.md`/implementación.
- Si en el futuro se justifica mitigar el límite de acentos con `unaccent` de Postgres — deliberadamente diferido, no bloquea esta change.
