## 1. Payload Globals

- [x] 1.1 Crear `src/payload/globals/Navigation.ts`: campos `logo`, `items[]` (`label`, `type: category|page|external`, `category` relationship, `page` relationship, `url`, `openInNewTab`, `children[]`), `socialLinks` (reutilizar `socialLinksField`), `CTA`. `access: { read: () => true, update: isAdmin }`. — Los campos de `items[]`/`children[]` se factorizaron en `src/payload/fields/link-fields.ts` (ver 1.2 y nota de desviación).
- [x] 1.2 Crear `src/payload/globals/Footer.ts`: campos `logo`, `description`, `columns[]` (`title`, `links[]`), `socialLinks`, `legalLinks[]`, `copyright`. Mismo `access` que 1.1. — **Desviación intencional del texto original de esta tarea**: `columns[].links[]` y `legalLinks[]` NO se implementaron como `{label, url}` planos. Master Spec §28 dice explícitamente "Links utilizan el modelo reutilizable de enlace" — el mismo shape `label/type/category/page/url/openInNewTab` que Navigation. Se creó `src/payload/fields/link-fields.ts` compartido por ambos Globals en vez de duplicar/inventar un shape distinto para Footer.
- [x] 1.3 Crear `src/payload/globals/SiteSettings.ts`: Branding/Contact/Social/SEO/Organization. Mismo `access`. Verificado: ningún campo operativo/secreto agregado (todos los campos son branding/contacto/redes/SEO ya pensados como públicos).
- [x] 1.4 Registrar los 3 Globals en `payload.config.ts`. Confirmado: no se agregó un Global `Home`.
- [x] 1.5 `pnpm generate:types` ejecutado; `payload-types.ts` incluye `Navigation`, `Footer`, `SiteSettings` (el tipo generado para este último es `SiteSetting`, singular — heurística de Payload a partir del slug `siteSettings`).

## 2. Acceso centralizado a Payload

- [x] 2.1 `src/lib/payload/get-payload.ts` con `getPayload()` importando `config` desde `@payload-config` (mismo alias que usa el código generado de Payload en `src/app/(payload)/`).
- [x] 2.2 `src/lib/data/public-query.ts`: `findPublished()`, `findOnePublished()`, `findGlobalPublished()` — las tres con `overrideAccess: false` hardcodeado. `posts`/`pages` reciben `_status: published` mezclado en el `where`.
- [x] 2.3 Verificado: `FindPublishedArgs`/la firma de `findGlobalPublished` no tienen ningún campo `overrideAccess` — es sintácticamente imposible pasarlo desde una función pública.

## 3. Data Access Layer

- [x] 3.1 `src/lib/data/posts.ts`: solo `getLatestPosts()` (depth 1, sort `-publishedAt`, `select: { content: false }` — ver Sección 13). `getPostBySlug()`/`getPostsByCategory()` deliberadamente no implementadas — sus consumidores (Artículo/Categoría) son Fase 7.
- [x] 3.2 `src/lib/data/categories.ts`: solo `getCategoriesForNavigation()` (`showInNavigation: true`, `order`). `getCategoryBySlug()` no implementada por la misma razón (consumidor es la página de Categoría, Fase 7).
- [x] 3.3 `src/lib/data/pages.ts` — **no creado**. Su único consumidor (la página de Page genérica) es Fase 7; no hay necesidad real en esta change.
- [x] 3.4 `src/lib/data/navigation.ts`, `footer.ts`, `settings.ts`: `getNavigation()`/`getFooter()`/`getSettings()`, depth 1.

## 4. View Models

- [x] 4.1 `src/lib/view-models/media.ts`: `mapMediaToMediaData()` — usa `preferredSize` (default `card`), nunca `hero` para tarjetas. Verificado en runtime: el featured image de un Post real se sirvió como `.../paper-grain-768x768.webp` (tamaño `card`, 768px), no `hero`.
- [x] 4.2 `src/lib/view-models/author.ts`: `mapUserToAuthorSummary()` — allowlist explícito. Verificado en runtime contra un `User` real con `email`/`role` poblados: ninguno llegó al HTML renderizado.
- [x] 4.3 `src/lib/view-models/category-card.ts`: `mapCategoryToCategoryCardData()`.
- [x] 4.4 `src/lib/view-models/article-card.ts`: `mapPostToArticleCardData()`. Devuelve `undefined` si `primaryCategory` no vino poblado, en vez de construir un `href` roto.
- [x] 4.5 Mapeo `NavigationItem`/Footer link → `ResolvedLink` — implementado co-ubicado con la Sección 5 (`resolveLink()`/`resolveLinks()`/`resolveNavItems()` en `src/lib/url/resolve-link.ts`), tal como esta misma tarea preveía como alternativa; no se creó un `view-models/link.ts` separado (habría sido una indirección sin responsabilidad propia).

## 5. URL helpers

- [x] 5.1 `src/lib/url/canonical.ts`: `getCategoryUrl()`, `getPostUrl()`, `getPageUrl()`, `normalizePath()`. `src/lib/url/resolve-link.ts`: `resolveLink()` (allowlist `http(s)://` para `external` — más robusto que una denylist de esquemas peligrosos), `resolveLinks()` (Footer, sin children) y `resolveNavItems()` (Navigation, un nivel de `children`).
- [x] 5.2 Confirmado: no existe `/[category]`, `/[category]/[post]` ni `/[slug]` en `src/app/(frontend)/`.

## 6. Formato de fecha

- [x] 6.1 `src/lib/format/date.ts`: `formatShortDate()`/`formatLongDate()` sobre `Intl.DateTimeFormat('es-MX', ...)`. Sin dependencia nueva.

## 7. Site shell

- [x] 7.1 `src/components/site/header.tsx`: logo (o fallback de texto si no hay logo configurado — verificado en runtime con Navigation vacío), nav desktop con submenú de un nivel vía `<details>`/`<summary>` (sin instalar un primitivo de dropdown adicional), trigger de menú móvil.
- [x] 7.2 `src/components/site/mobile-nav.tsx` (`'use client'`, único Client Component de esta change): usa shadcn `Sheet`. Escape/foco/scroll-lock son comportamiento nativo de Radix Dialog (que `Sheet` envuelve), no código propio.
- [x] 7.3 `src/components/site/footer.tsx`: columnas, redes, legal, copyright vía props.
- [x] 7.4 `src/app/(frontend)/layout.tsx` obtiene `Navigation`/`Footer`/`SiteSettings` en paralelo (`Promise.all`) y es el único punto que llama al DAL para el shell.
- [x] 7.5 `src/app/(frontend)/page.tsx` adaptado: ya no renderiza su propio `<main>` (el layout ahora posee ese landmark) y no agrega contenido de Home.
- [x] 7.6 Verificado por inspección: `header.tsx`/`footer.tsx`/`mobile-nav.tsx` no importan Payload ni `src/lib/data/`.

## 8. Verificación de integración (ArticleCard/CategoryCard con datos reales)

- [x] 8.1 Se usó una página de desarrollo temporal (`src/app/(frontend)/dev/frontend-core/page.tsx`, guardada con `notFound()` en producción) contra la base de datos de desarrollo real (Docker Compose, `db` + `app`), que ya contenía datos de sesiones previas: 4 Posts (3 `draft`, 1 `published`) y 5 Categories. Verificado en el HTML renderizado: las 5 `CategoryCard` con sus `colorTheme`/`icon` reales, y el único Post publicado renderizado como `ArticleCard` con imagen/autor/categoría reales.
- [x] 8.2 La página temporal fue eliminada (`rm -rf src/app/(frontend)/dev`) inmediatamente después de completar la verificación de la Sección 8/9. Confirmado tras el `pnpm build` final: la ruta ya no aparece en la lista de rutas generadas.

## 9. Seguridad — verificación en tiempo de ejecución (no solo de tipos)

- [x] 9.1 La base de datos de desarrollo ya tenía 3 Posts en `draft` ("Post para publicar", "Borrador de prueba (dev)", "Post con autor forzado"). Verificado: ninguno de los tres apareció en la página temporal de la Sección 8 (que usa `getLatestPosts()`).
- [x] 9.2 El único Post `published` ("Noticia de prueba (dev)") sí apareció, con su imagen destacada, categoría primaria y autor correctamente resueltos.
- [x] 9.3 El autor real de ese Post (`Writer Uno (dev)`, con `email`/`role` reales en la base de datos) se renderizó mostrando únicamente su `displayName`; se confirmó por `grep` sobre el HTML que ningún email de ningún Usuario de la base de datos apareció en la página.

## 10. Accesibilidad

- [x] 10.1 Verificado en el HTML real: `<header>`, `<footer>`, `<nav aria-label="Principal">`, `id="main-content"` en `<main>`, y el texto del skip link ("Saltar al contenido principal") presente.
- [x] 10.2 Verificado por inspección de código + garantía de la librería: `MobileNav` usa Radix Dialog (vía shadcn `Sheet`, sin modificar), que provee Escape-to-close/focus-trap/scroll-lock de fábrica — no se reimplementó ese comportamiento a mano. **Limitación de sesión**: sin `chromium-cli`/Playwright disponibles en este entorno (mismo límite que en Fase 4), no se hizo una prueba interactiva de teclado en navegador real; se confirmó que el trigger renderiza con el `aria-label` correcto y que el componente no introduce manejo de foco/teclado propio que pudiera contradecir el de Radix.
- [x] 10.3 Confirmado por inspección: `Header`/`Footer`/enlaces del menú móvil usan las mismas clases `focus-visible:ring-3 focus-visible:ring-ring/50` (más `focus-visible:border-ring` donde aplica) que `Button`/`CategoryCard` de Fase 4; el trigger de menú móvil es el propio `Button` (`size="icon"`), heredando el fix de touch target de 44px sin duplicar tratamiento.

## 11. Documentación

- [x] 11.1 `docs/FRONTEND-ARCHITECTURE.md` creado: flujo DAL→view-model, regla de `overrideAccess: false`, convenciones de cada capa, y la nota sobre `force-dynamic` (ver 12.1).
- [x] 11.2 Referenciado desde `AGENTS.md` y `CLAUDE.md`, mismo patrón que `docs/DESIGN-SYSTEM.md`.
- [x] 11.3 `docs/DESIGN-SYSTEM.md` actualizado: la afirmación "no se instaló ningún primitivo adicional" ya no era cierta tras esta change — se documentó la instalación de `Sheet` y su primer consumidor real.

## 12. Validación final

- [x] 12.1 `pnpm typecheck`/`pnpm lint`/`pnpm build` pasan limpio. **Hallazgo de implementación no anticipado en design.md**: el primer `pnpm build` falló porque Next.js 16 intenta pre-renderizar `/` estáticamente en build time por defecto, lo cual (a) requiere Postgres en build time y (b) horneiría Navigation/Footer/SiteSettings en un snapshot fijo — contradiciendo AC-NAV-004/AC-FOOT-001/002. Corregido con `export const dynamic = 'force-dynamic'` en `src/app/(frontend)/layout.tsx` (documentado como D10 en `design.md` y en `docs/FRONTEND-ARCHITECTURE.md`). Tras el fix, `pnpm build` no requiere Postgres y `/` aparece correctamente como `ƒ` (dinámica) en la salida de build.
- [x] 12.2 `pnpm generate:types` re-ejecutado tras el ajuste de Footer/Navigation (link-fields compartidos); `payload-types.ts` está al día (confirmado, sin diff tras una segunda ejecución).
- [x] 12.3 Confirmado por `grep`: fuera de `src/lib/data/`/`src/lib/payload/`, solo `src/payload/seed/{dev,initial}.ts` referencian Payload directamente — son scripts de seed de Fase 2/3 preexistentes (CLI, no parte de la aplicación frontend), no una violación de esta regla.
- [x] 12.4 `git diff package.json` vacío — cero dependencias nuevas (`Sheet` se apoya en `radix-ui`, ya instalado).
- [x] 12.5 `graphify update .` ejecutado: 1256 nodes, 1621 edges, 128 communities.
- [x] 12.6 Revisado contra `docs/60-segundos-spec.md` §84: AC-GEN-006/007, AC-USER-008, AC-DRAFT-001/002/003, AC-MEDIA-002/003/004, AC-NAV-001-004, AC-FOOT-001-002, AC-RESP-006, AC-SEC-007 verificados (varios en tiempo de ejecución, no solo por tipos — ver Secciones 8-9). AC-FE-POST-001/002, AC-AUTHOR-001/002, AC-PERF-002, AC-CACHE-005 quedan parcialmente habilitados (el contrato/helper existe; el consumidor completo es Fase 6/7/8). Ningún AC de nivel de página (Home/Categoría/Artículo/Page) se marca satisfecho por esta change.

## 13. Fixes de la ronda de `/opsx:verify` (WARNING → resuelto)

El primer `/opsx:verify` encontró 2 WARNING. Resultado de esta ronda:

- [x] 13.1 **Sobre-consulta de `content` en listados de Posts.** `frontend-data-access/spec.md` ya exigía evitar cargar el Lexical completo en listados; `getLatestPosts()` solo tenía `depth: 1` (que no afecta selección de campos). Se agregó soporte de `select` al helper público (`src/lib/data/public-query.ts`: `FindPublishedArgs`/`findPublished`/`findOnePublished` ahora aceptan `select?: TSelect`, tipado contra `TypedCollectionSelect[TSlug]` — el tipo público que Payload expone y que `payload-types.ts` puebla; `SelectFromCollectionSlug` NO está re-exportado, confirmado por error real de `tsc` al intentarlo). `getLatestPosts()` ahora pasa `select: { content: false }`. Verificado que Payload 3.87.1 usa "modo exclusión" cuando algún valor es `false` (código fuente instalado, `getSelectMode.js`) y, en tiempo de ejecución (ruta temporal `src/app/(frontend)/dev/select-check/route.ts`, eliminada de inmediato tras la verificación), que la respuesta real de `getLatestPosts()` no tiene la propiedad `content` pero sí `title`/`excerpt`. `overrideAccess: false` permanece hardcodeado y sin parámetro — `select` es ortogonal a esa garantía (D2 no cambia). Ver D11 en `design.md`.
- [x] 13.2 **Deriva entre `specs/site-shell/spec.md` y la arquitectura real de SiteSettings/Footer.** El requirement/escenario original afirmaba que el Footer obtiene sus redes sociales de `getSettings()`; la implementación (correcta, y sin cambios) las obtiene de `getFooter()` — cada Global tiene su propio `socialLinks` independiente (Master Spec §27/§28). Se corrigió el requirement en `specs/site-shell/spec.md` para reflejar exactamente lo implementado: `SiteSettings` solo se consume para `branding.siteName` (nombre de respaldo) y `branding.logo` (logo de respaldo, **solo del Footer** — el Header no tiene ese fallback, verificado contra `src/app/(frontend)/layout.tsx` real antes de escribir el nuevo escenario). `SiteSettings.contact`/`SiteSettings.social` quedan en el schema sin un consumidor inventado. No se modificó ningún código de implementación para este punto, ni `docs/60-segundos-spec.md`.
- [x] 13.3 Re-ejecutados `pnpm typecheck`/`pnpm lint`/`pnpm build` (limpio) tras el fix de `select`.
- [x] 13.4 Revisados `proposal.md`, `design.md`, `tasks.md` y `docs/FRONTEND-ARCHITECTURE.md` en busca de referencias que contradijeran los fixes: ninguno de los otros artefactos hacía la afirmación incorrecta sobre `getSettings()`/Footer (`design.md` D5 y `proposal.md` ya describían `Footer.socialLinks` correctamente como campo propio del Global — la deriva estaba únicamente en el texto del requirement de `site-shell/spec.md`). `docs/FRONTEND-ARCHITECTURE.md` sí se actualizó (comportamiento de `select` documentado, ver arriba) porque el DAL cambió materialmente.
- [x] 13.5 `graphify update .` re-ejecutado tras estos cambios de código/specs/docs.

---

**Nota de sesión — entorno de verificación**: la verificación en tiempo de ejecución (Secciones 8-10) se hizo levantando Postgres + la app vía `docker compose` (el daemon de Docker no estaba corriendo al inicio de la sesión; se inició, se usó `compose.yaml` ya existente en el repo, y se apagó al terminar con `docker compose down` sin `-v` — el volumen de datos de desarrollo preexistente se conservó intacto). Los datos de Posts/Categories/Users usados para la verificación ya existían en esa base de datos de sesiones de desarrollo previas; no se sembraron datos nuevos innecesariamente. No se ejecutó `pnpm migrate` formal — la base ya operaba en modo *dev push* (`payload_migrations` con `batch: -1`), y Payload aplicó el push de las 3 tablas nuevas (`navigation`, `footer`, `site_settings` + sus arrays) automáticamente al iniciar, sin prompt destructivo (solo adiciones).
