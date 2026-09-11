# Graph Report - 60segundosnoticias  (2026-09-11)

## Corpus Check
- 310 files · ~255,537 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1961 nodes · 2779 edges · 170 communities (124 shown, 45 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02651ff8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- payload-types.ts
- ADDED Requirements
- Editorial Workflow Change Proposal
- Payload CMS Core Tasks
- Payload CMS Core — proposal.md
- payload.config.ts
- Bootstrap Technical Foundation — tasks.md
- package.json
- components.json
- compilerOptions
- Requirements
- dependencies
- (payload)/layout.tsx
- Requirements
- ADDED Requirements
- payload
- ADDED Requirements
- layout-primitives spec (archived)
- Requirements
- category-card.tsx
- home-block-renderer.tsx
- Bootstrap Technical Foundation — proposal.md
- 60 Segundos Noticias — Master Specification
- Requirements
- Requirements
- footer.tsx
- ADDED Requirements
- ADDED Requirements
- Editorial Components (capability)
- Categories.ts
- Posts.ts
- editorial-components spec (archived)
- env/index.ts
- ADDED Requirements
- 2026-09-09-design-system-shadcn/tasks.md
- Requirements
- devDependencies
- scripts
- Decisions
- 60 Segundos Noticias — Design System (Fase 4)
- Requirements
- Requirements
- 2026-09-09-design-system-shadcn/proposal.md
- accessibility-foundation spec (archived)
- Accessibility Foundation (capability)
- Requirements
- Requirements
- Requirements
- ADDED Requirements
- ADDED Requirements
- Requirements
- Requirements
- Requirements
- @payloadcms/db-postgres
- reading-time.ts
- category-theme-keys.ts
- texture-foundation spec (archived)
- ADDED Requirements
- [post]/page.tsx
- Requirements
- ADDED Requirements
- [...slug]/route.ts
- OPSX: Apply command
- ADDED Requirements
- 2026-09-10-public-frontend-core/tasks.md
- check-environment.sh
- mapMediaToMediaData
- D6: publishedAt assignment and restore defense
- 60 Segundos Noticias — Frontend Architecture (Fase 5-7)
- facebook-video-embed.tsx
- ADDED Requirements
- dev.ts
- category-icon-map.tsx (CategoryIconKey to Lucide mapping)
- [category]/page.tsx
- postcss.config.mjs
- next-env.d.ts
- Admin puede asignar y reasignar el autor (delta)
- El slug no se regenera al editar el titulo (delta)
- El slug permanece editable explicitamente (delta)
- Un Post nunca publicado no tiene publishedAt (delta)
- Writer publica y despublica solo sus propios Posts (delta)
- readingTimeMinutes se actualiza cuando cambia el contenido (delta)
- Los seeds no contienen credenciales reales (delta)
- seed:dev es contenido de desarrollo, no automatico en produccion (delta)
- Posts Collection Spec (Archived Change)
- Redirects Collection Spec (Archived Change)
- Tags Collection Spec (Archived Change)
- GalleryBlock
- VideoBlock
- Requirements
- Users Collection Spec (Archived Change)
- CalloutBlock
- EmbedBlock
- ImageBlock
- QuoteBlock
- Acceso a Categories
- Campos de Categories
- colorTheme e icon controlados
- Aplicacion server-side, no solo ocultamiento de UI
- Bloqueo de login para cuentas inactivas
- Escritura de Posts requiere autenticacion
- Lectura publica restringida a contenido publicado en Pages
- Lectura publica restringida a contenido publicado en Posts
- Proteccion de datos sensibles de Users
- Acceso a Media
- Almacenamiento local en desarrollo
- Metadatos editoriales de Media
- Restriccion de tipos de archivo
- Tamanos de imagen editoriales
- Banner Block (Page)
- CTA Block
- FAQ Block
- Hero Block
- ImageText Block
- Autenticacion nativa de Payload
- Campos administrativos
- Campos publicos/editoriales
- Roles de usuario
- button.tsx
- article-card.tsx
- embed-block.tsx
- Decisions
- ADDED Requirements
- Requirements
- ADDED Requirements
- (frontend)/layout.tsx
- environment-validation capability
- Typography System (capability)
- Decisions
- Home.ts
- video-player.tsx
- ADDED Requirements
- Requirements
- 2026-09-10-public-frontend-core/proposal.md
- Requirement: Utilidad centralizada de formato de fecha
- Requirement: Utilidad centralizada de formato de fecha
- resolve-home-blocks.ts
- resolve-root-slug.ts
- ADDED Requirements
- ADDED Requirements
- Decisions
- ADDED Requirements
- Requirements
- ADDED Requirements
- 2026-09-10-dynamic-home-builder/tasks.md
- eslint.config.mjs
- ADDED Requirements
- Requirements
- ADDED Requirements
- Requirements
- 2026-09-09-design-system-shadcn/design.md
- Requirement: seed:initial pobla solo entidades con schema ya implementado
- video-block.tsx
- 2026-09-10-dynamic-home-builder/proposal.md
- Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL
- lexical-renderer.tsx
- ADDED Requirements
- ADDED Requirements
- category-article-pages/tasks.md
- Requirement: Búsqueda pública de contenido por slug
- faq-section.tsx
- Media.ts
- category-article-pages/design.md
- category-article-pages/proposal.md
- gallery-block.tsx
- author-card.tsx
- ADDED Requirements
- Requirement: CTA
- page-block-renderer.tsx

## God Nodes (most connected - your core abstractions)
1. `payload` - 53 edges
2. `mapMediaToMediaData()` - 25 edges
3. `60 Segundos Noticias — Master Specification` - 19 edges
4. `compilerOptions` - 17 edges
5. `Payload CMS Core Tasks` - 17 edges
6. `Payload CMS Core — proposal.md` - 16 edges
7. `react` - 15 edges
8. `server-only` - 14 edges
9. `Container()` - 14 edges
10. `Button()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `.claude/CLAUDE.md (graphify trigger)` --semantically_similar_to--> `CLAUDE.md — Claude Code Project Instructions`  [INFERRED] [semantically similar]
  .claude/CLAUDE.md → CLAUDE.md
- `AI / SDD Workflow` --references--> `Payload CMS Core — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-payload-cms-core/proposal.md
- `editorial-components spec (archived)` --references--> `Pagination component`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/editorial-components/spec.md → docs/DESIGN-SYSTEM.md
- `CLAUDE.md — Claude Code Project Instructions` --references--> `docs/AI-WORKFLOW.md`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `CLAUDE.md — Claude Code Project Instructions` --references--> `graphify-out/graph.json`  [EXTRACTED]
  CLAUDE.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OPSX experimental 'actions on a change' command set** — claude_commands_opsx_apply_command, claude_commands_opsx_archive_command, claude_commands_opsx_explore_command, claude_commands_opsx_propose_command, claude_commands_opsx_sync_command, claude_commands_opsx_update_command [EXTRACTED 0.95]
- **Posts beforeChange hook order: enforceAuthor -> publishValidation -> computeReadingTime** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d3_hook_order_beforechange, openspec_changes_archive_2026_09_09_editorial_workflow_design_d4_enforceauthor, openspec_changes_archive_2026_09_09_editorial_workflow_design_d5_publishvalidation, openspec_changes_archive_2026_09_09_editorial_workflow_design_d7_computereadingtime [EXTRACTED 1.00]
- **Bootstrap Technical Foundation New Capabilities** — capability_app_bootstrap, capability_environment_validation, capability_health_check, capability_local_docker_environment [EXTRACTED 1.00]
- **beforeDelete reference-check pattern shared by Categories and Users (D9)** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d9_deletion_protection_categories_users, openspec_specs_categories_collection_spec_eliminacion_de_categories_bloqueada_mientras_existan_posts_que_las_referencian, openspec_specs_users_collection_spec_eliminacion_de_users_bloqueada_mientras_existan_posts_que_los_referencian [EXTRACTED 1.00]
- **Incremental shadcn primitive adoption policy** — openspec_changes_archive_2026_09_09_design_system_shadcn_design_d5_incremental_shadcn_installation, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_shadcn_primitives_spec, docs_design_system_button_component, openspec_changes_archive_2026_09_09_design_system_shadcn_proposal_shadcn_primitives_capability [EXTRACTED 1.00]
- **OPSX Experimental Artifact Workflow Commands** — claude_commands_opsx_new, claude_commands_opsx_continue, claude_commands_opsx_ff, claude_commands_opsx_verify [EXTRACTED 1.00]
- **Payload CMS Core V1 Collections** — capability_users_collection, capability_media_collection, capability_categories_collection, capability_tags_collection, capability_posts_collection, capability_pages_collection, capability_redirects_collection [EXTRACTED 1.00]
- **CMS Cannot Choose Arbitrary Visual Values (controlled-vocabulary + data-boundary pattern)** — openspec_specs_category_theme_system_spec_controlled_keys_policy, openspec_specs_texture_foundation_spec_texture_contract, openspec_specs_editorial_components_spec_articlecarddata_contract, src_lib_constants_category_theme_keys [INFERRED 0.75]
- **Local Development Infrastructure Bootstrap** — openspec_specs_app_bootstrap_spec_appbootstrapspec, openspec_specs_environment_validation_spec_environmentvalidationspec, openspec_specs_health_check_spec_healthcheckspec, openspec_specs_local_docker_environment_spec_localdockerenvironmentspec [INFERRED 0.80]
- **Server always overrides client-submitted value (author, publishedAt, readingTimeMinutes)** — openspec_specs_post_ownership_spec_writer_no_puede_reasignar_el_autor, openspec_specs_publishing_workflow_spec_publishedat_permanece_estable, openspec_specs_reading_time_spec_readingtimeminutes_no_es_editable_manualmente [INFERRED 0.80]
- **Contrast-safe category theme rendering** — docs_design_system_cat_strong_token, docs_design_system_category_card, docs_design_system_category_badge, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_accessibility_foundation_spec_ac_a11y_006_contrast [INFERRED 0.85]
- **Controlled Content Block System (Payload-managed, no arbitrary HTML/CSS)** — openspec_specs_article_content_blocks_spec_articlecontentblocksspec, openspec_specs_page_blocks_spec_pageblocksspec, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages [INFERRED 0.85]
- **Payload CMS Core Collections** — openspec_specs_tags_collection_spec_tags, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages, openspec_specs_redirects_collection_spec_redirects [INFERRED 0.85]
- **Phase 4 Design System (8 capabilities)** — openspec_specs_accessibility_foundation_spec_accessibility_foundation, openspec_specs_category_theme_system_spec_category_theme_system, openspec_specs_design_tokens_spec_design_tokens, openspec_specs_editorial_components_spec_editorial_components, openspec_specs_layout_primitives_spec_layout_primitives, openspec_specs_shadcn_primitives_spec_shadcn_primitives, openspec_specs_texture_foundation_spec_texture_foundation, openspec_specs_typography_system_spec_typography_system [INFERRED 0.85]
- **Retheming shadcn Primitives with 60 Segundos Tokens** — openspec_specs_design_tokens_spec_color_tokens, openspec_specs_typography_system_spec_oswald, openspec_specs_typography_system_spec_inter, openspec_specs_shadcn_primitives_spec_retheming [INFERRED 0.85]
- **Documents independently restating the Master Spec > OpenSpec > implementation > tooling priority order** — docs_60_segundos_spec_doc, concept_source_of_truth_priority [INFERRED 0.85]
- **44px touch target accessibility fix flow** — docs_design_system_touch_target_technique, docs_design_system_button_component, docs_design_system_pagination, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_accessibility_foundation_spec_ac_a11y_007_touch_target, openspec_changes_archive_2026_09_09_design_system_shadcn_tasks [INFERRED 0.85]

## Communities (170 total, 45 thin omitted)

### Community 0 - "payload-types.ts"
Cohesion: 0.04
Nodes (57): ArticleSidebar, ArticleSidebarSelect, Auth, BannerBlock, BannerBlockSelect, CategoriesSelect, CategoryExplorerBlock, CategoryExplorerBlockSelect (+49 more)

### Community 1 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Requirement: Fondo principal editorial, Requirement: Fuente única de tokens de color, Requirement: Radius y sombras restringidos, Requirement: Rojo como accent principal, Requirement: Sin modo oscuro en V1, Scenario: Se define una card editorial, Scenario: Se inspecciona globals.css tras el cambio (+4 more)

### Community 2 - "Editorial Workflow Change Proposal"
Cohesion: 0.07
Nodes (41): Editorial Workflow Change Metadata, D10: Media/Tag deletion behavior verification, D11: Seeds via payload run, D12: Hooks directory layout, D1: isOwnerOrAdmin access function, D2: Posts.access.read query-constraint, D3: beforeChange hook order (enforceAuthor -> publishValidation -> computeReadingTime), D4: enforceAuthor hook (+33 more)

### Community 3 - "Payload CMS Core Tasks"
Cohesion: 0.09
Nodes (30): Page Blocks Spec (Archived Change), Pages Collection Spec (Archived Change), Reserved Slugs Constant (Archived Change), Slug Namespace Integrity Spec (Archived Change), Payload CLI Module Resolution Fix, src/lib/env/payload.ts Module, ESM Required for Payload CLI Load (ERR_REQUIRE_ASYNC_MODULE fix), Initial PostgreSQL Migration (+22 more)

### Community 4 - "Payload CMS Core — proposal.md"
Cohesion: 0.14
Nodes (18): article-content-blocks capability, categories-collection capability, cms-access-control capability, media-collection capability, page-blocks capability, pages-collection capability, posts-collection capability, redirects-collection capability (+10 more)

### Community 5 - "payload.config.ts"
Cohesion: 0.13
Nodes (16): GET, OPTIONS, POST, isAdmin(), isAdminFieldAccess(), isAdminOrWriter(), isLoggedInFieldAccess(), Posts (+8 more)

### Community 6 - "Bootstrap Technical Foundation — tasks.md"
Cohesion: 0.20
Nodes (9): Bootstrap Technical Foundation — tasks.md, 1. Verificación de versiones y bootstrap del proyecto, 2. Esqueleto de Next.js (App Router), 3. Integración de Payload CMS + PostgreSQL, 4. Tailwind CSS + shadcn/ui, 5. Validación de variables de entorno, 6. Endpoint `/api/health`, 7. Docker Compose para desarrollo (+1 more)

### Community 7 - "package.json"
Cohesion: 0.08
Nodes (24): engines, node, name, pnpm, onlyBuiltDependencies, private, type, version (+16 more)

### Community 8 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 10 - "Requirements"
Cohesion: 0.11
Nodes (18): Purpose, Requirement: Accessible name en controles solo-icono, Requirement: Alt apropiado en imágenes editoriales, Requirement: Contraste apropiado en category themes, Requirement: Foco visible, Requirement: Jerarquía de encabezados correcta, Requirement: Motion respeta reduced motion, Requirement: Navegación por teclado en funciones críticas (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, cn, graphql, lucide-react, next, payload, @payloadcms/db-postgres (+13 more)

### Community 12 - "(payload)/layout.tsx"
Cohesion: 0.14
Nodes (6): nextConfig, next, importMap, Args, Args, Args

### Community 13 - "Requirements"
Cohesion: 0.11
Nodes (17): Purpose, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+9 more)

### Community 14 - "ADDED Requirements"
Cohesion: 0.12
Nodes (17): ADDED Requirements, Requirement: Accessible name en controles solo-icono, Requirement: Alt apropiado en imágenes editoriales, Requirement: Contraste apropiado en category themes, Requirement: Foco visible, Requirement: Jerarquía de encabezados correcta, Requirement: Motion respeta reduced motion, Requirement: Navegación por teclado en funciones críticas (+9 more)

### Community 15 - "payload"
Cohesion: 0.12
Nodes (16): payload, @payloadcms/richtext-lexical, CalloutBlock, EmbedBlock, GalleryBlock, ImageBlock, QuoteBlock, VideoBlock (+8 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+8 more)

### Community 17 - "layout-primitives spec (archived)"
Cohesion: 0.18
Nodes (11): Container (layout primitive), layout-primitives spec (archived), ADDED Requirements, Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Scenario: Se consulta un breakpoint del Design System (+3 more)

### Community 18 - "Requirements"
Cohesion: 0.13
Nodes (14): Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Requirements (+6 more)

### Community 19 - "category-card.tsx"
Cohesion: 0.23
Nodes (11): CategoryHeader(), CategoryHeaderData, CategoryHeaderProps, CategoryCard(), CategoryCardProps, CATEGORY_ICON_COMPONENTS, CategoryIcon(), CategoryIconProps (+3 more)

### Community 20 - "home-block-renderer.tsx"
Cohesion: 0.10
Nodes (25): SectionHeader(), SectionHeaderProps, Container(), ContainerProps, CategoryExplorerSection(), CategoryExplorerSectionProps, EditorialIntroSection(), EditorialIntroSectionProps (+17 more)

### Community 21 - "Bootstrap Technical Foundation — proposal.md"
Cohesion: 0.16
Nodes (17): health-check capability, local-docker-environment capability, Next.js, Payload CMS, PostgreSQL, AI / SDD Workflow, Bootstrap Technical Foundation — change config, Bootstrap Technical Foundation — proposal.md (+9 more)

### Community 22 - "60 Segundos Noticias — Master Specification"
Cohesion: 0.10
Nodes (25): AGENTS.md — Agent Instructions, .claude/CLAUDE.md (graphify trigger), CLAUDE.md — Claude Code Project Instructions, Acceptance Criteria (AC-* normative checklist), Block rendering pipeline (Payload Block → Resolver → View Model → Renderer → Section), Tag-based cache and targeted revalidation, Category color themes and icon keys, Data Access Layer (src/lib/data) (+17 more)

### Community 23 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Fondo principal editorial, Requirement: Fuente única de tokens de color, Requirement: Radius y sombras restringidos, Requirement: Rojo como accent principal, Requirement: Sin modo oscuro en V1, Requirements, Scenario: Se define una card editorial (+5 more)

### Community 24 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Requirements, Scenario: conexión interna usa el nombre del servicio (+5 more)

### Community 25 - "footer.tsx"
Cohesion: 0.40
Nodes (4): Footer(), FooterColumn, FooterProps, ResolvedLink

### Community 26 - "ADDED Requirements"
Cohesion: 0.08
Nodes (24): ADDED Requirements, Purpose, Requirement: BannerSection comparte contrato con el Page Banner block, Requirement: Cada Home Section es presentacional y recibe solo props resueltas, Requirement: CategoryExplorerSection usa categorías seleccionadas explícitamente, Requirement: EditorialIntroSection compone un fondo y un primer plano gestionados desde el CMS, Requirement: FeaturedPostsSection usa selección manual explícita únicamente, Requirement: HeroNewsSection soporta selección manual y automática con un contrato unificado (+16 more)

### Community 27 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): app-bootstrap capability, App Bootstrap — spec.md, ADDED Requirements, Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto (+8 more)

### Community 28 - "Editorial Components (capability)"
Cohesion: 0.26
Nodes (12): Correct Heading Hierarchy (AC-A11Y-005), ArticleCard, ArticleMetadata, Breadcrumbs, CategoryBadge, CategoryCard, Editorial Components (capability), Pagination (+4 more)

### Community 29 - "Categories.ts"
Cohesion: 0.23
Nodes (7): isReservedSlug(), RESERVED_SLUGS, Categories, Tags, slugField(), createNamespaceSlugValidate(), preventDeleteWithPosts()

### Community 30 - "Posts.ts"
Cohesion: 0.28
Nodes (9): enforceAuthor(), assignPublishedAt(), hasValue(), publishValidation(), REQUIRED_TO_PUBLISH, resultingStatus(), generateSlugFromTitle(), slugify() (+1 more)

### Community 31 - "editorial-components spec (archived)"
Cohesion: 0.20
Nodes (12): ArticleCard component, ArticleMetadata component, ArticleCardData contract (frontend-only, not Post), Breadcrumbs component, --cat-strong (darkened accent for non-textual/text contrast fix), CategoryBadge component, CategoryCard component, ResponsiveMedia component (+4 more)

### Community 32 - "env/index.ts"
Cohesion: 0.15
Nodes (10): register(), pg, zod, checkDatabase(), dynamic, GET(), env, envSchema (+2 more)

### Community 33 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Scenario: conexión interna usa el nombre del servicio, Scenario: eliminación explícita de volúmenes (+4 more)

### Community 34 - "2026-09-09-design-system-shadcn/tasks.md"
Cohesion: 0.11
Nodes (19): Button (shadcn primitive, re-themed), Pagination component, 44px touch target technique (icon ::after 4-way + text min-w-11 + vertical-only ::after), D5: Incremental shadcn primitive installation, shadcn-primitives capability, AC-A11Y-007: 44px touch target requirement, shadcn-primitives spec (archived), Purpose (+11 more)

### Community 35 - "Requirements"
Cohesion: 0.17
Nodes (11): Purpose, Requirement: Constantes de Payload permanecen framework-neutral, Requirement: Contraste explícito por tema, Requirement: Mapeo de category theme mediante atributo de datos, Requirement: Solo keys controladas, sin color arbitrario del CMS, Requirements, Scenario: Se audita el código por clases Tailwind dinámicas de categoría, Scenario: Se inspecciona category-theme-keys.ts tras el cambio (+3 more)

### Community 36 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, postcss, sass, tailwindcss, @tailwindcss/postcss, @types/node (+4 more)

### Community 37 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, generate:types, lint, migrate, migrate:create, payload (+4 more)

### Community 38 - "Decisions"
Cohesion: 0.12
Nodes (16): Context, D10: `export const dynamic = 'force-dynamic'` en el layout público (descubierto en implementación), D11: `select` en `findPublished()`/`findOnePublished()` (agregado en la ronda de `/opsx:verify`), D1: `getPayload()` centralizado en `src/lib/payload/get-payload.ts`, D2: Helper de acceso público — la decisión de seguridad central, D3: `src/lib/data/` (DAL) y `src/lib/view-models/` (normalización) como capas separadas, D4: Profundidad y proyección de consultas, D5: Globals — schema y acceso (+8 more)

### Community 39 - "60 Segundos Noticias — Design System (Fase 4)"
Cohesion: 0.18
Nodes (11): 60 Segundos Noticias — Design System (Fase 4), Accesibilidad, Category theme system, Componentes editoriales (`src/components/editorial/`), Contraste verificado (`--cat-accent-fg`), Layout, Motion, shadcn/ui (+3 more)

### Community 40 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos, Requirement: Sin modo oscuro heredado en los primitivos, Requirements, Scenario: Se evalúa añadir un primitivo nuevo, Scenario: Se inspecciona un primitivo shadcn instalado (+2 more)

### Community 41 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Requirements, Scenario: Se define un título de artículo (H1), Scenario: Se renderiza texto de cuerpo (+2 more)

### Community 42 - "2026-09-09-design-system-shadcn/proposal.md"
Cohesion: 0.11
Nodes (17): bootstrap-technical-foundation (prior phase), Capabilities, editorial-workflow (prior phase), Impact, Modified Capabilities, New Capabilities, payload-cms-core (prior phase), What Changes (+9 more)

### Community 43 - "accessibility-foundation spec (archived)"
Cohesion: 0.20
Nodes (11): DESIGN-SYSTEM.md (Fase 4 implementation doc), CATEGORY_THEME_KEYS (framework-neutral constant), resolveCategoryThemeKey() (src/lib/editorial/category-theme.ts), Motion tokens (--motion-fast/normal/slow + reduced-motion reset), D2: Category theme via data-cat-theme, not dynamic Tailwind classes, accessibility-foundation spec (archived), AC-A11Y-006: Category theme contrast requirement, AC-A11Y-008: prefers-reduced-motion requirement (+3 more)

### Community 44 - "Accessibility Foundation (capability)"
Cohesion: 0.13
Nodes (20): Accessibility Foundation (capability), Accessible Name on Icon-only Controls (AC-A11Y-002), Required Alt Text on ResponsiveMedia (AC-A11Y-004), Keyboard Navigation on Critical Controls (AC-A11Y-001), Motion Respects prefers-reduced-motion (AC-A11Y-008), 44px Minimum Touch Targets (AC-A11Y-007), Visible Focus State (AC-A11Y-003), Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info) (+12 more)

### Community 45 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Requirements, Scenario: Se consulta un breakpoint del Design System, Scenario: Se usa Container en desktop ancho, Scenario: Se usa Container en mobile (+1 more)

### Community 46 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Requirements, Scenario: Se aplica la textura de papel al canvas, Scenario: Se revisa el contrato de textura expuesto al CMS, Scenario: Se usa la textura en el cuerpo de un artículo (+1 more)

### Community 47 - "Requirements"
Cohesion: 0.08
Nodes (24): Purpose, Requirement: BannerSection comparte contrato con el Page Banner block, Requirement: Cada Home Section es presentacional y recibe solo props resueltas, Requirement: CategoryExplorerSection usa categorías seleccionadas explícitamente, Requirement: EditorialIntroSection compone un fondo y un primer plano gestionados desde el CMS, Requirement: FeaturedPostsSection usa selección manual explícita únicamente, Requirement: HeroNewsSection soporta selección manual y automática con un contrato unificado, Requirement: LatestPostsSection consulta automáticamente por fecha de publicación (+16 more)

### Community 48 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Footer es administrable, Requirement: Header y Footer son presentacionales, Requirement: La ruta raíz no implementa contenido de Home, Requirement: Navegación móvil como Client Component acotado, Requirement: Navigation es administrable y dirige el Header, Requirement: SiteSettings integrado para identidad de marca (+8 more)

### Community 49 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Scenario: Se define un título de artículo (H1), Scenario: Se renderiza texto de cuerpo, Scenario: Se renderiza un encabezado de sección (+1 more)

### Community 50 - "Requirements"
Cohesion: 0.12
Nodes (16): Purpose, Requirement: Footer es administrable, Requirement: Header y Footer son presentacionales, Requirement: La ruta raíz no implementa contenido de Home, Requirement: Navegación móvil como Client Component acotado, Requirement: Navigation es administrable y dirige el Header, Requirement: SiteSettings integrado para identidad de marca, Requirements (+8 more)

### Community 51 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Requirements, Scenario: secreto no expuesto al cliente, Scenario: un nuevo clon dispone de la plantilla de entorno, Scenario: variable crítica faltante

### Community 52 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Requirements, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles, Scenario: verificación de estado operativo

### Community 54 - "reading-time.ts"
Cohesion: 0.39
Nodes (7): countWords(), extractFromNode(), extractFromValue(), extractLexicalText(), LexicalNode, TEXT_LIKE_BLOCK_FIELD_KEYS, computeReadingTime()

### Community 55 - "category-theme-keys.ts"
Cohesion: 0.15
Nodes (15): Appropriate Contrast in Category Themes (AC-A11Y-006), --cat-accent / --cat-accent-fg / --cat-soft / --cat-soft-fg / --cat-border, CATEGORY_THEME_KEYS, Category Theme System (capability), Only Controlled Keys, No Arbitrary CMS Color, data-cat-theme Attribute Mapping Mechanism, Explicit Per-theme Contrast Requirement, ArticleCardData Contract (decoupled from Payload Post) (+7 more)

### Community 56 - "texture-foundation spec (archived)"
Cohesion: 0.18
Nodes (11): .texture-paper-grain / .texture-newspaper-pattern utilities, texture-foundation spec (archived), ADDED Requirements, Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Scenario: Se aplica la textura de papel al canvas (+3 more)

### Community 57 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: Acceso público seguro por defecto, sin escape hatch genérico, Requirement: DAL centraliza toda lectura pública de Payload, Requirement: Filtrado explícito de _status como defensa adicional, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Requirement: Proyección/profundidad evita sobre-consulta, Scenario: El site shell necesita la configuración de navegación (+6 more)

### Community 58 - "[post]/page.tsx"
Cohesion: 0.14
Nodes (24): ArticlePage(), ArticlePageProps, AuthorCard(), getArticleSidebar(), getArticleSidebarHeading(), getArticleSidebarPosts(), GetArticleSidebarPostsArgs, MODE_LABELS (+16 more)

### Community 59 - "Requirements"
Cohesion: 0.12
Nodes (15): Purpose, Requirement: Acceso público seguro por defecto, sin escape hatch genérico, Requirement: DAL centraliza toda lectura pública de Payload, Requirement: Filtrado explícito de _status como defensa adicional, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Requirement: Proyección/profundidad evita sobre-consulta, Requirements, Scenario: El site shell necesita la configuración de navegación (+7 more)

### Community 60 - "ADDED Requirements"
Cohesion: 0.07
Nodes (26): ADDED Requirements, Purpose, Requirement: Author Card con datos públicos, sin ruta de autor, Requirement: Composición editorial del Article, Requirement: Related Posts, Requirement: Resolución canónica de `/<category>/<post>`, Requirement: Sharing con URL canónica, Requirement: Tags visuales sin ruta pública (+18 more)

### Community 61 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 62 - "OPSX: Apply command"
Cohesion: 0.40
Nodes (6): OPSX: Apply command, OPSX: Archive command, OPSX: Explore command, OPSX: Propose command, OPSX: Sync command, OPSX: Update command

### Community 63 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Purpose, Requirement: Bloque no reconocido no rompe la página, Requirement: EmbedBlock con providers controlados, Requirement: GalleryBlock, Requirement: ImageBlock, Requirement: QuoteBlock y CalloutBlock, Requirement: Renderizado seguro de Lexical (+13 more)

### Community 64 - "2026-09-10-public-frontend-core/tasks.md"
Cohesion: 0.14
Nodes (13): 10. Accesibilidad, 11. Documentación, 12. Validación final, 13. Fixes de la ronda de `/opsx:verify` (WARNING → resuelto), 1. Payload Globals, 2. Acceso centralizado a Payload, 3. Data Access Layer, 4. View Models (+5 more)

### Community 65 - "check-environment.sh"
Cohesion: 0.60
Nodes (5): fail(), has(), ok(), check-environment.sh script, warn()

### Community 66 - "mapMediaToMediaData"
Cohesion: 0.18
Nodes (17): formatLongDate(), formatShortDate(), LONG_DATE_FORMATTER, SHORT_DATE_FORMATTER, getPageUrl(), getPostUrl(), normalizePath(), MapPostToArticleCardDataOptions (+9 more)

### Community 67 - "D6: publishedAt assignment and restore defense"
Cohesion: 0.40
Nodes (5): D6: publishedAt assignment and restore defense, publishedAt permanece estable (delta), publishedAt se asigna una sola vez (delta), publishedAt permanece estable, publishedAt se asigna una sola vez

### Community 68 - "60 Segundos Noticias — Frontend Architecture (Fase 5-7)"
Cohesion: 0.14
Nodes (13): 60 Segundos Noticias — Frontend Architecture (Fase 5-7), Article/Category/Page Pipeline (Fase 7), Data Access Layer (`src/lib/data/`), Fechas, Flujo general, Fuera de alcance de esta Fase, Home Block Pipeline (Fase 6), Los cuatro roles de la base de datos en desarrollo (+5 more)

### Community 69 - "facebook-video-embed.tsx"
Cohesion: 0.21
Nodes (9): EmbedLinkCard(), EmbedLinkCardProps, FacebookVideoEmbed(), FacebookVideoEmbedProps, loadFacebookSdk(), Window, extractTikTokVideoId(), TikTokEmbed() (+1 more)

### Community 70 - "ADDED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: AuthorSummary excluye campos privados de Users, Requirement: Category theme/icon permanecen controlados en el mapeo, Requirement: Los componentes presentacionales no reciben documentos Payload completos, Requirement: Selección de tamaño de imagen apropiado, Requirement: Solo view models con consumidor real en esta change, Scenario: Se evalúa crear un nuevo view model (+4 more)

### Community 71 - "dev.ts"
Cohesion: 0.18
Nodes (6): CATEGORY_LABELS, CATEGORY_POSTS, categoryBySlug, CategoryPostSeed, createdPostsByCategory, devBlocks

### Community 73 - "category-icon-map.tsx (CategoryIconKey to Lucide mapping)"
Cohesion: 0.67
Nodes (3): category-icon-keys.ts (framework-neutral constant), category-icon-map.tsx (CategoryIconKey to Lucide mapping), D3: Category icon key to Lucide mapping in dedicated frontend module

### Community 74 - "[category]/page.tsx"
Cohesion: 0.24
Nodes (8): RootSlugPageProps, ArticleHeader(), ArticleHeaderProps, BreadcrumbItem, Breadcrumbs(), BreadcrumbsProps, Pagination(), ArticleDetailData

### Community 90 - "Requirements"
Cohesion: 0.15
Nodes (12): Purpose, Requirement: AuthorSummary excluye campos privados de Users, Requirement: Category theme/icon permanecen controlados en el mapeo, Requirement: Los componentes presentacionales no reciben documentos Payload completos, Requirement: Selección de tamaño de imagen apropiado, Requirement: Solo view models con consumidor real, Requirements, Scenario: Se evalúa crear un nuevo view model (+4 more)

### Community 119 - "button.tsx"
Cohesion: 0.12
Nodes (16): cn, radix-ui, ErrorBoundaryProps, PaginationProps, Header(), HeaderProps, MobileNav(), MobileNavProps (+8 more)

### Community 120 - "article-card.tsx"
Cohesion: 0.13
Nodes (19): class-variance-authority, ArticleAside(), ArticleAsideProps, RelatedPosts(), RelatedPostsProps, ArticleCard(), ArticleCardData, ArticleCardProps (+11 more)

### Community 121 - "embed-block.tsx"
Cohesion: 0.18
Nodes (13): react-social-media-embed, ALIGNMENT_CLASSES, EmbedBlockClient(), EmbedBlockClientProps, EmbedBlockView(), EmbedBlockViewProps, EmbedBlockLoader, CONTROLLED_PROVIDER_HOSTS (+5 more)

### Community 122 - "Decisions"
Cohesion: 0.11
Nodes (18): Context, D10. Validación de proveedor de video externo: módulo nuevo, sin acoplar a Article, D11. `EditorialIntro`: dos capas de Media independientes, sin nueva query ni nuevo DAL, D12. CTA de `HeroNews`/`Banner`/`EditorialIntro` unificado sobre `linkFields`, no un par de campos de texto plano, D13. Migración del cambio de CTA dividida en dos pasos (aditivo, luego remoción), D1. Ubicación de archivos sigue literalmente el árbol del Master Spec (§75), D2. Resolver como capa propia, separada del DAL, D3. Ubicación de las nuevas funciones del DAL (+10 more)

### Community 123 - "ADDED Requirements"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Purpose, Requirement: Helpers de URL canónica centralizados, Requirement: No implementa las rutas dinámicas correspondientes, Requirement: Resolución de enlaces de Navigation/Footer, Scenario: Se busca la ruta dinámica de artículo, Scenario: Se necesita el enlace de un Post en una tarjeta, Scenario: Un item de Navigation es de tipo category (+1 more)

### Community 124 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Helpers de URL canónica centralizados, Requirement: No implementa las rutas dinámicas correspondientes, Requirement: Resolución de enlaces de Navigation/Footer, Requirements, Scenario: Se busca la ruta dinámica de artículo, Scenario: Se necesita el enlace de un Post en una tarjeta, Scenario: Un item de Navigation es de tipo category (+1 more)

### Community 125 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): Health Check — spec.md, ADDED Requirements, Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles (+1 more)

### Community 126 - "(frontend)/layout.tsx"
Cohesion: 0.18
Nodes (17): server-only, inter, oswald, dynamic, FrontendLayout(), metadata, HomePage(), getFooter() (+9 more)

### Community 127 - "environment-validation capability"
Cohesion: 0.20
Nodes (11): environment-validation capability, Environment Validation (bootstrap) — spec.md, ADDED Requirements, Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Scenario: secreto no expuesto al cliente (+3 more)

### Community 128 - "Typography System (capability)"
Cohesion: 0.33
Nodes (6): D7: Fonts via next/font/google, no font management library, typography-system spec (archived), Purpose, Typographic Scale (Display XL, H1-H3, Section Heading, Body, Lead, Metadata), Typography System (capability), Uppercase Restricted to Nav/Buttons/Section & Category Labels

### Community 129 - "Decisions"
Cohesion: 0.14
Nodes (14): Bootstrap Technical Foundation — design.md, Context, D1. Baseline de versiones fijado explícitamente, D2. Alcance de Docker: dev ahora, hardening en Phase 10, D3. Validación de entorno con Zod, fallo temprano, D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía, D5. `payload-types.ts` como efecto natural, no como entregable, D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario (+6 more)

### Community 130 - "Home.ts"
Cohesion: 0.16
Nodes (11): CategoryExplorer, EditorialIntro, FeaturedPosts, HeroNews, LatestPosts, PostsByCategory, VideoFeature, Banner (+3 more)

### Community 131 - "video-player.tsx"
Cohesion: 0.50
Nodes (3): @vidstack/react, VideoPlayer(), VideoPlayerProps

### Community 132 - "ADDED Requirements"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Purpose, Requirement: Continuidad de foco visible y touch targets, Requirement: Landmarks semánticos en el shell público, Requirement: Navegación móvil operable por teclado, Scenario: Se abre la navegación móvil con teclado, Scenario: Se enfoca el trigger del menú móvil por teclado, Scenario: Un usuario de lector de pantalla navega el shell

### Community 133 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Continuidad de foco visible y touch targets, Requirement: Landmarks semánticos en el shell público, Requirement: Navegación móvil operable por teclado, Requirements, Scenario: Se abre la navegación móvil con teclado, Scenario: Se enfoca el trigger del menú móvil por teclado, Scenario: Un usuario de lector de pantalla navega el shell

### Community 134 - "2026-09-10-public-frontend-core/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 135 - "Requirement: Utilidad centralizada de formato de fecha"
Cohesion: 0.33
Nodes (5): ADDED Requirements, Purpose, Requirement: Utilidad centralizada de formato de fecha, Scenario: Se formatea la fecha de publicación de un Post, Scenario: Se revisan las dependencias tras este change

### Community 136 - "Requirement: Utilidad centralizada de formato de fecha"
Cohesion: 0.33
Nodes (5): Purpose, Requirement: Utilidad centralizada de formato de fecha, Requirements, Scenario: Se formatea la fecha de publicación de un Post, Scenario: Se revisan las dependencias

### Community 137 - "resolve-home-blocks.ts"
Cohesion: 0.21
Nodes (21): RootSlugPage(), CategoryCardData, getPostsByCategory(), isPopulated(), RawHomeBlock, resolveBanner(), resolveBlock(), resolveCategoryExplorer() (+13 more)

### Community 138 - "resolve-root-slug.ts"
Cohesion: 0.33
Nodes (7): ResolvedRootSlug, resolveRootSlug(), getCategoryBySlug(), getPageBySlug(), GetPageBySlugArgs, findOnePublished(), Page

### Community 139 - "ADDED Requirements"
Cohesion: 0.20
Nodes (10): ADDED Requirements, Requirement: Constantes de Payload permanecen framework-neutral, Requirement: Contraste explícito por tema, Requirement: Mapeo de category theme mediante atributo de datos, Requirement: Solo keys controladas, sin color arbitrario del CMS, Scenario: Se audita el código por clases Tailwind dinámicas de categoría, Scenario: Se inspecciona category-theme-keys.ts tras el cambio, Scenario: Se usa el theme yellow (+2 more)

### Community 140 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos, Requirement: Sin modo oscuro heredado en los primitivos, Scenario: Se evalúa añadir un primitivo nuevo, Scenario: Se inspecciona un primitivo shadcn generado, Scenario: Se renderiza Button tras la retematización (+1 more)

### Community 141 - "Decisions"
Cohesion: 0.25
Nodes (8): D1: Tokens como variables CSS en `@theme`, sin archivo de tokens en JS, D2: Category theme via `data-cat-theme`, no clases Tailwind dinámicas, D3: Mapeo de category icon key → Lucide en un módulo frontend dedicado, D4: `ArticleCard` contra un contrato `ArticleCardData`, no contra `Post`, D5: Instalación incremental de primitivos shadcn, D6: Eliminación explícita del modo oscuro, D7: Fuentes vía `next/font/google`, sin librería de gestión de fuentes, Decisions

### Community 142 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Consultas de Home evitan sobre-consulta, Requirement: getHome() usa el límite de acceso público existente, Requirement: PostsByCategory usa membership inclusivo de categoría, Requirement: Selección automática de Posts excluye siempre contenido no publicado, Requirement: Selección manual de Posts se revalida en el momento de resolución, Requirement: VideoFeature con fuente externa restringe el proveedor de video (+8 more)

### Community 143 - "Requirements"
Cohesion: 0.12
Nodes (16): Purpose, Requirement: Consultas de Home evitan sobre-consulta, Requirement: getHome() usa el límite de acceso público existente, Requirement: PostsByCategory usa membership inclusivo de categoría, Requirement: Selección automática de Posts excluye siempre contenido no publicado, Requirement: Selección manual de Posts se revalida en el momento de resolución, Requirement: VideoFeature con fuente externa restringe el proveedor de video, Requirements (+8 more)

### Community 144 - "ADDED Requirements"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Purpose, Requirement: Home administrable exclusivamente por Admin, Requirement: Home publicado refleja exactamente el orden guardado, Requirement: Home restringe layout a bloques predefinidos, sin CSS/HTML arbitrario, Requirement: Home soporta versionado sin exponer estado no publicado públicamente, Requirement: Lectura pública de Home, Requirement: SEO override opcional en Home (+7 more)

### Community 145 - "2026-09-10-dynamic-home-builder/tasks.md"
Cohesion: 0.12
Nodes (15): 10. Seeds, 11. Documentación, 12. Graphify, 13. Validación estática y de build, 14. Verificación end-to-end (datos reales), 15. Unificar CTA de HeroNews/Banner/EditorialIntro sobre `linkFields`, 1. Banner compartido (prerequisito de Home Blocks), 2. Payload schema: Home Global y Home Blocks (+7 more)

### Community 147 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Banner de Page reutiliza el componente ya compartido, Requirement: Bloque no reconocido no rompe la página, Requirement: FAQ accesible, Requirement: Gallery y Video de Page reutilizan la infraestructura de Article, Requirement: Page en draft nunca se renderiza públicamente, Requirement: Renderizado de los 8 Page Blocks (+9 more)

### Community 148 - "Requirements"
Cohesion: 0.12
Nodes (15): Purpose, Requirement: Home administrable exclusivamente por Admin, Requirement: Home publicado refleja exactamente el orden guardado, Requirement: Home restringe layout a bloques predefinidos, sin CSS/HTML arbitrario, Requirement: Home soporta versionado sin exponer estado no publicado públicamente, Requirement: Lectura pública de Home, Requirement: SEO override opcional en Home, Requirements (+7 more)

### Community 150 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, Purpose, Requirement: Bloque desconocido o malformado no rompe la página, Requirement: Home mantiene un único encabezado H1 principal, Requirement: Home sin bloques configurados degrada de forma segura, Requirement: Renderizado exhaustivo de los tipos de bloque soportados, Scenario: Admin reordena HeroNews fuera de la primera posición, Scenario: Home con los 8 tipos de bloque configurados (+2 more)

### Community 151 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Bloque desconocido o malformado no rompe la página, Requirement: Home mantiene un único encabezado H1 principal, Requirement: Home sin bloques configurados degrada de forma segura, Requirement: Renderizado exhaustivo de los tipos de bloque soportados, Requirements, Scenario: Admin reordena HeroNews fuera de la primera posición, Scenario: Home con los 8 tipos de bloque configurados (+2 more)

### Community 152 - "2026-09-09-design-system-shadcn/design.md"
Cohesion: 0.24
Nodes (9): src/app/globals.css (token source of truth), Context, D1: Tokens as CSS variables in @theme, no JS token file, D6: Explicit removal of dark mode, Goals / Non-Goals, Migration Plan, Risks / Trade-offs, design-tokens spec (archived) (+1 more)

### Community 153 - "Requirement: seed:initial pobla solo entidades con schema ya implementado"
Cohesion: 0.25
Nodes (7): ADDED Requirements, MODIFIED Requirements, Requirement: seed:dev puede configurar bloques de Home representativos, Requirement: seed:initial pobla solo entidades con schema ya implementado, Scenario: ejecutar seed:initial en esta fase, Scenario: seed:dev configura Home con contenido de desarrollo, Scenario: seed:initial no sobrescribe una Home ya configurada por un administrador

### Community 154 - "video-block.tsx"
Cohesion: 0.19
Nodes (12): VideoBlockView(), VideoBlockViewProps, VideoSection(), VideoSectionProps, ExternalVideo, ExternalVideoProvider, extractVimeoId(), extractYoutubeId() (+4 more)

### Community 155 - "2026-09-10-dynamic-home-builder/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 156 - "Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Scenario: El site shell necesita la configuración de navegación, Scenario: La página de inicio necesita el layout de Home, Scenario: Se busca el Global Home

### Community 157 - "lexical-renderer.tsx"
Cohesion: 0.12
Nodes (16): CalloutBlockView(), CalloutBlockViewProps, VARIANT_STYLES, ImageBlockView(), ImageBlockViewProps, SIZE_CLASSES, QuoteBlockView(), QuoteBlockViewProps (+8 more)

### Community 158 - "ADDED Requirements"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Purpose, Requirement: Composición visual de la Category Page, Requirement: Membership inclusivo del listado, Requirement: Paginación server-side, Requirement: Un único H1 en la Category Page, Scenario: Category con descripción configurada, Scenario: Category sin descripción (+7 more)

### Community 159 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: 404 con identidad de marca, Requirement: Error boundary con identidad de marca para fallas inesperadas, Requirement: Resolución de `/<slug>`, Requirement: Rutas reservadas no colisionan con `/<slug>`, Scenario: Contenido en draft accedido públicamente, Scenario: Contenido inexistente no activa el error boundary (+6 more)

### Community 160 - "category-article-pages/tasks.md"
Cohesion: 0.15
Nodes (12): 10. Graphify, 11. Validación estática y de build, 12. Verificación end-to-end (datos reales), 1. CTA Page Block — migración a `linkFields` (prerequisito), 2. Root slug resolver y boundaries públicos, 3. Data Access Layer nuevo, 4. View models nuevos, 5. Renderizado seguro de Lexical y Article Content Blocks (+4 more)

### Community 161 - "Requirement: Búsqueda pública de contenido por slug"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Búsqueda pública de contenido por slug, Requirement: La consulta de detalle de Article es la única que carga contenido completo, Requirement: Related Posts vía DAL, Scenario: Auditoría de consultas de listado, Scenario: Auditoría de la consulta de detalle, Scenario: Page en draft por slug, Scenario: Page publicada por slug (+3 more)

### Community 164 - "faq-section.tsx"
Cohesion: 0.33
Nodes (7): FAQSection(), FAQSectionProps, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), FAQBlock

### Community 165 - "Media.ts"
Cohesion: 0.28
Nodes (6): isLoggedIn(), isOwnerOrAdmin(), Media, enforceUploader(), preventDeleteReferenced(), Media

### Community 166 - "category-article-pages/design.md"
Cohesion: 0.29
Nodes (6): Context, Decisions, Goals / Non-Goals, Migration Plan, Open Questions, Risks / Trade-offs

### Community 167 - "category-article-pages/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 168 - "gallery-block.tsx"
Cohesion: 0.38
Nodes (5): GalleryBlockView(), GalleryBlockViewProps, GallerySection(), GallerySectionProps, GalleryBlock

### Community 169 - "author-card.tsx"
Cohesion: 0.18
Nodes (13): lucide-react, react, AuthorCardProps, PLATFORM_ICONS, ShareActions(), ShareActionsProps, FacebookLogo(), IconProps (+5 more)

### Community 170 - "ADDED Requirements"
Cohesion: 0.33
Nodes (5): ADDED Requirements, Requirement: Contrato de detalle de Article, Requirement: Related Posts reutiliza ArticleCardData, Scenario: Se renderiza la sección de Related Posts, Scenario: Se renderiza un Article real

### Community 171 - "Requirement: CTA"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: CTA, Scenario: CTA con enlace, Scenario: Migración de datos existentes

### Community 172 - "page-block-renderer.tsx"
Cohesion: 0.11
Nodes (23): ResponsiveMedia(), ResponsiveMediaProps, BannerData, BannerSection(), BannerSectionProps, BannerVariant, VARIANT_STYLES, CTASection() (+15 more)

## Ambiguous Edges - Review These
- `Motion Respects prefers-reduced-motion (AC-A11Y-008)` → `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`  [AMBIGUOUS]
  openspec/specs/accessibility-foundation/spec.md · relation: conceptually_related_to

## Knowledge Gaps
- **919 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+914 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 988 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Motion Respects prefers-reduced-motion (AC-A11Y-008)` and `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Category Theme System (capability)` connect `category-theme-keys.ts` to `category-card.tsx`, `2026-09-09-design-system-shadcn/proposal.md`, `accessibility-foundation spec (archived)`, `2026-09-09-design-system-shadcn/tasks.md`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `payload` connect `payload` to `Home.ts`, `payload.config.ts`, `Media.ts`, `package.json`, `dev.ts`, `(payload)/layout.tsx`, `category-theme-keys.ts`, `reading-time.ts`, `Posts.ts`, `[post]/page.tsx`, `Categories.ts`, `(frontend)/layout.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `payload.config.ts`, `package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _919 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `Editorial Workflow Change Proposal` be split into smaller, more focused modules?**
  _Cohesion score 0.06585365853658537 - nodes in this community are weakly interconnected._