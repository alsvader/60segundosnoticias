## 1. Extracción de texto buscable

- [x] 1.1 Corregir `extractLexicalText()` (`src/payload/hooks/lib/lexical-text.ts`) para recorrer arrays de objetos (p. ej. `GalleryBlock.images[].caption`) sin depender de una clave fija de campo — verificar que un Post con un bloque Gallery con caption produce ese texto en la salida, y que `computeReadingTime` sigue funcionando igual que antes.
- [x] 1.2 Crear el extractor de texto para Page Blocks no-Lexical (`Hero`/`ImageText`/`CTA`/`FAQ`/`Banner`), delegando en `extractLexicalText()` para el bloque `RichText` — verificar que produce el texto esperado para cada tipo de bloque de una Page real.

## 2. Configuración del Payload Search Plugin

- [x] 2.1 Agregar `@payloadcms/plugin-search@3.87.1` a `package.json` (`pnpm add`) — verificar que la versión instalada coincide exactamente con `payload`/`@payloadcms/db-postgres`/`@payloadcms/next` ya presentes.
- [x] 2.2 Crear `src/payload/plugins/search.ts`: `collections: ['posts', 'pages']`, `searchOverrides.fields` (`excerpt`, `searchText`, `slug`, `categorySlug`, `publishedAt`, `priority`), `beforeSync` usando los extractores de la sección 1, `syncDrafts: false`, `deleteDrafts: true`, `defaultPriorities` (Posts > Pages), `access` (`create`/`update`/`delete` solo Admin, `read` público) — registrar en `payload.config.ts` y verificar que el archivo compila (`pnpm typecheck`).
- [x] 2.3 Ejecutar `pnpm generate:types` — verificar que `src/payload-types.ts` incluye la Collection `search` con los campos configurados en 2.2.

## 3. Migración

- [x] 3.1 Ejecutar `pnpm migrate:create` dentro del contenedor `app` — revisar el SQL generado (nueva tabla `search` + relación polimórfica para `doc`, sin cambios a las tablas de Posts/Pages/Categories) y verificar que el snapshot `.json` correspondiente se creó junto al `.ts`.
- [x] 3.2 Verificar la cadena de migraciones completa contra una base PostgreSQL descartable (`payload migrate` + `payload migrate:status` → todas `Ran: Yes`), sin tocar la base de datos de desarrollo.
- [x] 3.3 Confirmar que `docker compose up` en desarrollo sincroniza el nuevo schema vía push mode automáticamente (AC-DB del proyecto, política de las cuatro bases del README).

## 4. Indexación inicial

- [x] 4.1 Ejecutar la acción de Reindex (Admin UI del plugin) sobre los Posts/Pages publicados existentes (`seed:dev`) — verificar que cada uno queda representado por exactamente un registro en la Collection `search` (AC-SEARCH-009).
- [x] 4.2 Ejecutar Reindex una segunda vez — verificar que el número de registros de Search por documento fuente no aumenta (idempotencia, AC-SEARCH-009).

## 5. DAL y view model público

- [x] 5.1 Crear `src/lib/data/search.ts` con `searchContent({query, page, limit})` — server-side, sin `overrideAccess: true`, deliberadamente sin `unstable_cache` (documentar la razón en el propio archivo) — verificar que consulta la Collection `search` y nunca Posts/Pages directamente, y que retorna metadata de paginación (AC-SEARCH-008).
- [x] 5.2 Crear `src/lib/view-models/search.ts` (`SearchResult` reutilizando `ArticleCardData`, `SearchResultPage`) — verificar que un resultado de Post y uno de Page se normalizan correctamente sin exponer el documento crudo de la Collection `search` a los componentes de React.

## 6. Ruta pública `/buscar`

- [x] 6.1 Crear `src/app/(frontend)/buscar/page.tsx`: formulario GET progresivo, estado inicial sin `q` que no ejecuta consulta, lista de resultados con `ArticleCard`/`Pagination` (12/página, `notFound()` en página inválida/fuera de rango, `q` preservado en los enlaces) — verificar en desarrollo con `/buscar?q=...` tras el reindex de la sección 4 (AC-SEARCH-001/002/003/005/006).
- [x] 6.2 Implementar el estado vacío para búsquedas sin resultados — verificar visualmente que aparece con una sugerencia para el usuario (AC-SEARCH-007).
- [x] 6.3 Configurar metadata de `/buscar` con `robots: {index: false}`; confirmar que `src/app/sitemap.ts` y `src/lib/seo/llms-txt.ts` no incluyen `/buscar` (§36/§53 del Master Spec).

## 7. Accesibilidad y responsive

- [x] 7.1 Verificar navegación completa por teclado en `/buscar` (campo de búsqueda, submit, resultados, paginación) con foco visible en todo momento (AC-A11Y-001/002/003/005/007/008).
- [x] 7.2 Verificar en 375px/768px/1024px/1440px que no hay scroll horizontal ni contenido desbordado (AC-RESP-001/002/006).

## 8. Verificación de ciclo de vida en vivo

- [x] 8.1 Verificar en vivo, con credenciales reales: un Post/Page nuevo en Draft no aparece en Search; publicarlo → aparece; actualizar título/excerpt/contenido ya publicado → el registro de Search se actualiza; despublicar → desaparece; eliminar → desaparece (AC-SEARCH-010/011/013, AC-DRAFT-003).
- [x] 8.2 Verificar en vivo el caso crítico: un Post/Page publicado recibe una edición guardada como Draft (sin publicar) → el registro de Search sigue mostrando la versión publicada, nunca el contenido del Draft.
- [x] 8.3 Verificar que un usuario con rol Writer (no Admin) no puede crear, actualizar ni eliminar un registro de la Collection `search` directamente (AC-SEC-002).
- [x] 8.4 Revisar los registros de Search generados y confirmar que ninguno contiene datos de `User`, URLs de Admin/Preview, ni campos internos innecesarios expuestos.

## 9. Validación y documentación

- [x] 9.1 Ejecutar `pnpm typecheck`, `pnpm lint` y `pnpm build` (build dentro del contenedor `app`, ya que requiere `DATABASE_URI` alcanzable) — verificar que los tres pasan sin errores nuevos.
- [x] 9.2 Ejecutar `openspec validate site-search --strict` — verificar que no reporta errores.
- [x] 9.3 Ejecutar `graphify update .` para reflejar los archivos nuevos/modificados en el grafo.
- [x] 9.4 Actualizar `docs/FRONTEND-ARCHITECTURE.md` y crear `docs/SEARCH.md` (arquitectura del plugin, collections/campos indexados, extracción vía `beforeSync`, contrato `SearchResult`, política de drafts, runbook de reindex, limitación de acentos conocida, flujo de migración/despliegue).
- [x] 9.5 Actualizar `README.md` si el setup de desarrollo cambia (nueva dependencia, comando de reindex relevante para operar el proyecto) — derivarlo del repositorio ya implementado, sin inventar comandos ni variables.

## 10. Entrada de búsqueda en Header/MobileNav (refinamiento de UX aprobado post-implementación)

- [x] 10.1 Extraer un `SearchForm` compartido (`src/components/site/search-form.tsx`) desde el formulario ya existente en `/buscar`, con `idPrefix` para evitar colisión de `id` cuando coexisten varias instancias en la misma página — verificar que `/buscar` sigue funcionando igual (`pnpm typecheck`, verificación en vivo).
- [x] 10.2 (Revisado) Crear `src/components/site/header-search.tsx`: control inline (sin Popover/dropdown/modal) — ícono siempre anclado a la derecha, `<input>` presente en el DOM que se expande de derecha a izquierda vía `width`/`padding`/`opacity` al hacer clic, el propio ícono actúa como submit una vez expandido, `onSubmit` bloquea query vacía, Escape colapsa+limpia+devuelve foco, blur fuera del formulario colapsa sin limpiar — verificar que el trigger aparece en el Header en toda página pública y que el `<input>` ya está montado (oculto) en el HTML inicial. (Se descartó la primera iteración con `Popover` de shadcn/Radix tras feedback explícito de UX; `src/components/ui/popover.tsx` se eliminó por quedar sin uso.)
- [x] 10.3 Integrar `SearchForm` dentro del `Sheet` de `MobileNav` — verificar que aparece en la navegación móvil sin abrir un segundo mecanismo de overlay.
- [x] 10.4 Verificar en vivo: Header expone Search en toda página pública (Home y Category); `/buscar?q=tabasco` conserva el input con `value="tabasco"`; `q=de` pagina y el enlace de paginación conserva `q`; `q` vacío no ejecuta búsqueda amplia; sin regresión en `searchContent()`/DAL (archivos no tocados).
- [x] 10.5 `pnpm typecheck`, `pnpm lint` y `pnpm build` (contenedor `app`) sin errores nuevos; actualizar `specs/public-search/spec.md` y `design.md` con el nuevo Requirement/Decisión (y su revisión tras el feedback de interacción).
