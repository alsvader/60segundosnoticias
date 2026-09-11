## 1. CTA Page Block — migración a `linkFields` (prerequisito)

- [x] 1.1 Actualizar `src/payload/blocks/page/CTA.ts`: reemplazar `linkLabel`/`linkURL` por un campo `link` (`type: group`, `fields: linkFields`/`optionalLinkFields` según la semántica requerida vs. opcional ya definida para este bloque) — verificar con `pnpm typecheck`
- [x] 1.2 Generar la migración aditiva (`pnpm migrate:create`) que agrega la nueva estructura `link` sin tocar `linkLabel`/`linkURL` — revisar el SQL generado a mano
- [x] 1.3 Escribir y aplicar el paso de transformación de datos (`linkLabel`/`linkURL` → `link.label`/`link.type='external'`/`link.url`) sobre `page_blocks_cta` **y** `_pages_v_blocks_cta` — verificar contra una base PostgreSQL desechable contando filas transformadas vs. filas con datos originales en ambas tablas
- [x] 1.4 Generar la migración de remoción de las columnas viejas `linkLabel`/`linkURL` — verificar que solo se aplica después de confirmar 1.3
- [x] 1.5 Verificar la cadena completa de migraciones desde cero contra una base PostgreSQL desechable — `payload migrate:status` con todas en `Ran: Yes`; la base de desarrollo push-managed no se toca con `migrate`
- [x] 1.6 Correr `pnpm generate:types` y confirmar que `CTABlock` ya no expone `linkLabel`/`linkURL` y sí `link`
- [x] 1.7 Revisar `src/payload/seed/dev.ts`/`initial.ts` por referencias al shape viejo del CTA de Page — confirmar que no quedan referencias a `linkLabel`/`linkURL`

## 2. Root slug resolver y boundaries públicos

- [x] 2.1 Crear el resolver de `/<slug>` (Category primero, luego Page publicada) en el DAL o en una capa intermedia — verificar con un slug de Category, un slug de Page y un slug inexistente
- [x] 2.2 Crear `src/app/(frontend)/[category]/page.tsx` (renombrado de `[slug]/` — Next.js exige que todo segmento dinámico en la misma posición que `[category]/[post]` comparta el mismo nombre de carpeta) que use el resolver y renderice la Category Page, la Generic Page, o llame `notFound()` — verificado en vivo los 3 casos
- [x] 2.3 Crear `src/app/(frontend)/not-found.tsx` dentro de `(frontend)/` con identidad de marca — verificar que hereda `Header`/`Footer` y que no es el 404 genérico de Next.js
- [x] 2.4 Crear `src/app/(frontend)/error.tsx` (`'use client'`, boundary mínimo) sin stack trace expuesto, con acción de recuperación (`reset()`) cuando aplique — verificar forzando un error real (por ejemplo, una excepción temporal en una función del DAL) y confirmando que no aparece stack trace en el HTML servido

## 3. Data Access Layer nuevo

- [x] 3.1 `getPostBySlug(slug)` en `src/lib/data/posts.ts` — solo published, incluye `content` completo con profundidad suficiente para los Article Content Blocks — verificar con un Post real publicado y uno en draft
- [x] 3.2 `getPageBySlug(slug)` en `src/lib/data/pages.ts` (archivo nuevo) — solo published — verificar con una Page publicada y una en draft
- [x] 3.3 `getCategoryBySlug(slug)` en `src/lib/data/categories.ts` — verificar con una Category real
- [x] 3.4 `getRelatedPosts({postId, primaryCategoryId, limit})` en `src/lib/data/posts.ts` — excluye el Post actual, solo published, sin `content` — verificar con datos reales que incluyan al menos 5 Posts de la misma categoría
- [x] 3.5 Extender `getPostsByCategory()` con paginación (`page`, `totalDocs`, `totalPages`) — verificar con más de 12 Posts reales en una categoría

## 4. View models nuevos

- [x] 4.1 Definir el view model de detalle de Article (tipo + mapper) reutilizando `mapMediaToMediaData()`/`mapUserToAuthorSummary()` ya existentes — verificar que no duplica `ArticleCardData`
- [x] 4.2 Confirmar por inspección de imports que la sección de Related Posts consume `ArticleCardData` ya existente, sin un contrato nuevo

## 5. Renderizado seguro de Lexical y Article Content Blocks

- [x] 5.1 Confirmar la API oficial de renderizado React de `@payloadcms/richtext-lexical` 3.87.1 contra el paquete instalado (spike acotado) — documentar el resultado en un comentario del módulo de renderizado
- [x] 5.2 Crear el módulo de renderizado de Lexical usando esa API oficial (nunca `dangerouslySetInnerHTML`) — verificar con un Post real con texto enriquecido básico (negritas, listas, encabezados)
- [x] 5.3 Crear el converter/componente de `ImageBlock` (`size` `small`/`medium`/`large`/`full` — refinamiento post-implementación sobre el `alignment` `normal`/`wide`/`full` originalmente previsto, ver Decisión 13 en `design.md` y `AC-BLOCK-IMG-001` actualizado en el Master Spec —, `caption`/`credits`, reutilizando `ResponsiveMedia`) — verificar visualmente los 4 tamaños
- [x] 5.4 Crear el converter/componente de `GalleryBlock` (`grid` y `carousel` con scroll-snap nativo, sin librería) — verificar navegación por teclado y por touch en `carousel`
- [x] 5.5 Crear el converter/componente de `VideoBlock`: `youtube`/`vimeo` vía `resolveExternalVideoUrl()` ya existente sin modificarlo (extendido para detectar YouTube Shorts verticales), `uploaded` vía `<video>` nativo con `poster`, más un campo `portrait` para aspect ratio 9:16 (Shorts/Reels) — verificar los 3 providers, el modo `portrait`, y confirmar que ningún video reproduce audio automáticamente
- [x] 5.6 Crear el converter/componente de `QuoteBlock` y `CalloutBlock` (variantes `info`/`warning`/`important`) según el Design System — verificar visualmente las 3 variantes de `CalloutBlock`
- [x] 5.7 Crear el módulo de resolución segura de `EmbedBlock`: `instagram`/`x`/`tiktok`/`facebook`/`linkedin` con embed enriquecido por proveedor (ampliado sobre los 3 originalmente previstos — ver Decisión 12 en `design.md`), más un campo `alignment` (`left`/`center`/`right`) para posicionar la caja del embed, `generic` como tarjeta de enlace externo validada server-side (`http(s)` únicamente, `rel="noopener noreferrer"`, nunca iframe/HTML/script arbitrario) — verificar con una URL válida de cada proveedor, las 3 alineaciones, y con una URL inválida (debe degradar sin romper la página)
- [x] 5.8 Crear el mecanismo de dispatch de blocks (mapa `converters.blocks` de `@payloadcms/richtext-lexical`, no un switch propio) sobre los 6 tipos; tipo no reconocido: log warning y omitir sin romper la página — verificar con un `blockType` desconocido de prueba

## 6. Article Page

- [x] 6.1 Crear `src/app/(frontend)/[category]/[post]/page.tsx`: obtiene el Post por slug, compara la categoría solicitada contra `primaryCategory` — verificar los 5 casos (A-E de la exploración) con datos reales
- [x] 6.2 Implementar la corrección canónica con `permanentRedirect(getPostUrl(primaryCategory.slug, post.slug))` cuando la categoría solicitada no coincide — verificar con una URL usando una `additionalCategory` del Post y con una categoría totalmente incorrecta
- [x] 6.3 Crear `ArticleHeader` (dueño del `<h1>`) — verificar que el DOM tiene exactamente un `<h1>`
- [x] 6.4 Componer la metadata visual (autor/fecha/`updatedAt` condicional/reading time), reutilizando `ArticleMetadata` ya existente donde aplique
- [x] 6.5 Crear `AuthorCard` nuevo consumiendo `AuthorSummary` — verificar que no expone `email`/`role`/`active` y que `displayName`/`slug` no son un enlace hacia `/autor/`
- [x] 6.6 Crear la sección de Related Posts usando `getRelatedPosts()` + `ArticleCardData` — verificar que el Post actual nunca aparece y que la sección se omite sin romper la página cuando no hay relacionados
- [x] 6.7 Crear `ShareActions` (Facebook/X/WhatsApp/Copy link/Web Share API, client island mínimo) usando siempre la URL canónica — verificar "Copiar enlace" con feedback accesible y confirmar que no existe botón de Instagram
- [x] 6.8 Componer la página completa en el orden de `§34`: breadcrumb/categoría/H1/excerpt/metadata/share/imagen destacada/contenido/tags/share/author card/related posts — verificar visualmente contra un Post real con todos los campos poblados

## 7. Category Page

- [x] 7.1 Implementar el listado de Category con membership inclusivo vía `getPostsByCategory()` extendido (sección 3.5) — verificar con un Post presente solo en `additionalCategories`
- [x] 7.2 Crear `CategoryHeader` (dueño del `<h1>`, con `colorTheme`/`icon`/imagen/descripción opcional) — verificar que el DOM tiene exactamente un `<h1>`
- [x] 7.3 Implementar la paginación server-side con `?page=N`, 12 por página, página 1 sin `?page=1`, valor inválido/fuera de rango → `notFound()` — verificar con una categoría con más de 24 Posts reales
- [x] 7.4 Reutilizar el componente `Pagination` ya existente — verificar que genera los `href` correctos con `getCategoryUrl()`

## 8. Page rendering (Generic Pages)

- [x] 8.1 Crear `PageBlockRenderer` con switch exhaustivo sobre los 8 tipos, mismo patrón `default` de log+skip que `ArticleBlockRenderer` — verificar con un `blockType` desconocido de prueba
- [x] 8.2 Crear `PageHeroSection`, `ImageTextSection` y `FAQSection` (acordeón accesible vía shadcn) — verificar cada uno visualmente
- [x] 8.3 Reutilizar los converters de `GalleryBlock`/`VideoBlock`/Lexical de la sección 5 para `GallerySection`/`VideoSection`/`RichTextSection` de Page — verificar por inspección que no hay código duplicado
- [x] 8.4 Reutilizar `BannerSection` ya compartido (sin cambios) para el `case` `banner` de `PageBlockRenderer` — verificar que es el mismo componente que usa Home
- [x] 8.5 Renderizar la Page dentro de `src/app/(frontend)/[category]/page.tsx` (mismo archivo del resolver de la sección 2) — verificado que una Page en draft responde 404

## 9. Documentación

- [x] 9.1 Agregar la sección "Article/Category/Page Pipeline — Fase 7" a `docs/FRONTEND-ARCHITECTURE.md`, documentando el resolver de `/<slug>`, la corrección canónica de categoría, el renderizado de Lexical/blocks y el DAL nuevo — verificar que no duplica el Master Spec
- [x] 9.2 Revisar si `README.md` necesita actualización (nuevos comandos/env vars) — verificar que no se documenta nada no implementado

## 10. Graphify

- [x] 10.1 Correr `graphify update .` tras completar la implementación — verificar que `graphify query "Article Page Category Page routing"` encuentra los archivos nuevos

## 11. Validación estática y de build

- [x] 11.1 Correr `pnpm typecheck` y confirmar que pasa sin errores
- [x] 11.2 Correr `pnpm lint` y confirmar que pasa sin errores
- [x] 11.3 Correr `pnpm build` y confirmar que las nuevas rutas aparecen en la salida de build
- [x] 11.4 Levantar `docker compose up --build` y confirmar que una Category real, una Page real y un Article real responden 200

## 12. Verificación end-to-end (datos reales)

- [x] 12.1 Category: Post con categoría primaria aparece; Post solo en `additionalCategories` aparece; Post en draft nunca aparece; paginación correcta en ambos extremos
- [x] 12.2 Article: URL canónica responde 200; categoría incorrecta redirige a la canónica; URL con una `additionalCategory` no crea una página alterna; Post en draft responde 404; los 6 Article Content Blocks renderizan de forma segura; los datos privados del autor están ausentes del HTML servido
- [x] 12.3 Page: Page publicada responde 200; Page en draft responde 404; los 8 Page Blocks renderizan; la resolución del namespace raíz funciona para Category y para Page
- [x] 12.4 Seguridad: auditar que todas las funciones DAL nuevas usan el helper público compartido (`overrideAccess: false`), sin ninguna llamada directa a `payload.find()`/`payload.findByID()` fuera del DAL
- [x] 12.5 Visual: QA real en anchos representativos (~375/768/1024/1440) para Category, Article y Page — completado y aprobado por el usuario en navegador real

## 13. Article Sidebar (post-implementación, tras revisión manual)

- [x] 13.1 Crear el Global `ArticleSidebar` (`postsPanel`: `enabled`/`mode`/`heading`/`limit`) y registrarlo en `payload.config.ts` — verificar que el default (`enabled: true`, `mode: latest`) funciona sin que un admin lo haya guardado nunca
- [x] 13.2 Crear `getFeaturedPosts()`/`getNewestPostPerCategory()` (`src/lib/data/posts.ts`) y `getAllCategories()` (`src/lib/data/categories.ts`) — verificar que ambas excluyen `content` y respetan el boundary `overrideAccess: false`
- [x] 13.3 Crear `src/lib/data/article-sidebar.ts` (`getArticleSidebar()`, `getArticleSidebarHeading()`, `getArticleSidebarPosts()`) — verificar que excluye siempre el Post actual, para los 3 modos
- [x] 13.4 Crear `ArticleAside` (`src/components/content/article-aside.tsx`), reutilizando `ArticleCard variant="compact"` — verificar visualmente
- [x] 13.5 Layout de 2 columnas (`lg:grid-cols-[2fr_1fr]`) + fallback centrado de 1 columna cuando el aside está deshabilitado/sin posts, en `src/app/(frontend)/[category]/[post]/page.tsx` — verificar ambos casos con datos reales
- [x] 13.6 Sticky (`lg:sticky lg:top-24 lg:self-start`) en `ArticleAside` — verificado a nivel de CSS/clases compiladas y confirmado en navegador real como parte de 12.5
- [x] 13.7 Generar la migración de Payload para el Global `ArticleSidebar` (`article_sidebar_global`: tabla `article_sidebar` + `enum_article_sidebar_posts_panel_mode`) — verificada contra una base desechable, cadena completa desde cero (`payload migrate:status` con todas en `Ran: Yes`), y un `migrate:create` posterior confirma "No schema changes detected" (cero diff restante). La base de desarrollo push-managed no se tocó con `migrate`.
- [x] 13.8 (hallazgo durante 13.7) Generar la migración pendiente para `VideoBlock.portrait` en la tabla de Page Blocks (`page_video_block_portrait_field`, `pages_blocks_video_block`/`_pages_v_blocks_video_block`) — gap preexistente, independiente de `ArticleSidebar` (el campo no tiene impacto de schema en el uso de Article/Lexical, pero sí en el bloque `Video` de Page, que reexporta el mismo `VideoBlock`) — verificada de la misma forma
- [x] 13.9 Reconstruir los snapshots Drizzle/Payload faltantes (`.json`) de las 3 migraciones hand-authored de `page/CTA.ts` (`20260910_212800/213500/214200_page_cta_link_fields_*`), que existían sin su snapshot sidecar y bloqueaban cualquier `migrate:create` futuro con un prompt de rename ambiguo (`pages_blocks_cta.link_type` vs. `link_u_r_l`) — reconstruidos vía herramienta real (nunca editados a mano), verificados byte-a-byte idénticos al SQL de los `.ts` existentes, y confirmados con un `migrate:create` baseline en cero antes de proceder con 13.7/13.8
