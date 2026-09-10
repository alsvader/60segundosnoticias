# Graph Report - 60segundosnoticias  (2026-09-10)

## Corpus Check
- 210 files · ~124,372 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1260 nodes · 1625 edges · 132 communities (83 shown, 47 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a992dbd9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- payload-types.ts
- Decisions
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
- article-editor.ts
- ADDED Requirements
- ADDED Requirements
- Requirements
- category-card.tsx
- header.tsx
- Bootstrap Technical Foundation — proposal.md
- 60 Segundos Noticias — Master Specification
- Requirements
- Requirements
- (frontend)/layout.tsx
- Pages.ts
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
- Accessibility Foundation (capability)
- Retheming Installed Primitives (no generic shadcn look)
- Requirements
- Requirements
- article-card.ts
- ADDED Requirements
- ADDED Requirements
- article-card.tsx
- Requirements
- Requirements
- @payloadcms/db-postgres
- reading-time.ts
- accessibility-foundation spec (archived)
- texture-foundation spec (archived)
- ADDED Requirements
- media.ts
- ADDED Requirements
- Category Theme System (capability)
- [...slug]/route.ts
- OPSX: Apply command
- Button (shadcn primitive, re-themed)
- ADDED Requirements
- check-environment.sh
- public-frontend-core/tasks.md
- D6: publishedAt assignment and restore defense
- 60 Segundos Noticias — Frontend Architecture (Fase 5)
- payload.ts
- category-badge.tsx
- category-icon-map.tsx (CategoryIconKey to Lucide mapping)
- eslint.config.mjs
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
- ADDED Requirements
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
- sheet.tsx
- ADDED Requirements
- AGENTS.md — Agent Instructions
- payload
- public-frontend-core/proposal.md
- Requirement: Utilidad centralizada de formato de fecha
- ADDED Requirements
- graphql/route.ts
- Config
- compose.yaml
- Layout Primitives (capability)
- Typography System (capability)
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `payload` - 43 edges
2. `60 Segundos Noticias — Master Specification` - 19 edges
3. `compilerOptions` - 17 edges
4. `Payload CMS Core Tasks` - 17 edges
5. `Payload CMS Core — proposal.md` - 16 edges
6. `Bootstrap Technical Foundation — proposal.md` - 13 edges
7. `scripts` - 12 edges
8. `Decisions` - 12 edges
9. `Editorial Components (capability)` - 12 edges
10. `editorial-components spec (archived)` - 12 edges

## Surprising Connections (you probably didn't know these)
- `.claude/CLAUDE.md (graphify trigger)` --semantically_similar_to--> `CLAUDE.md — Claude Code Project Instructions`  [INFERRED] [semantically similar]
  .claude/CLAUDE.md → CLAUDE.md
- `AI / SDD Workflow` --references--> `Bootstrap Technical Foundation — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-bootstrap-technical-foundation/proposal.md
- `AI / SDD Workflow` --references--> `Payload CMS Core — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-payload-cms-core/proposal.md
- `editorial-components spec (archived)` --references--> `Pagination component`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/editorial-components/spec.md → docs/DESIGN-SYSTEM.md
- `60 Segundos Noticias — Master Specification` --references--> `Next.js`  [EXTRACTED]
  docs/60-segundos-spec.md → README.md

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

## Communities (132 total, 47 thin omitted)

### Community 0 - "payload-types.ts"
Cohesion: 0.04
Nodes (49): Auth, BannerBlock, BannerBlockSelect, CalloutBlock, CategoriesSelect, CollectionsWidget, CTABlock, CTABlockSelect (+41 more)

### Community 1 - "Decisions"
Cohesion: 0.05
Nodes (44): CATEGORY_THEME_KEYS (framework-neutral constant), resolveCategoryThemeKey() (src/lib/editorial/category-theme.ts), src/app/globals.css (token source of truth), Context, D1: Tokens as CSS variables in @theme, no JS token file, D1: Tokens como variables CSS en `@theme`, sin archivo de tokens en JS, D2: Category theme via data-cat-theme, not dynamic Tailwind classes, D2: Category theme via `data-cat-theme`, no clases Tailwind dinámicas (+36 more)

### Community 2 - "Editorial Workflow Change Proposal"
Cohesion: 0.07
Nodes (41): Editorial Workflow Change Metadata, D10: Media/Tag deletion behavior verification, D11: Seeds via payload run, D12: Hooks directory layout, D1: isOwnerOrAdmin access function, D2: Posts.access.read query-constraint, D3: beforeChange hook order (enforceAuthor -> publishValidation -> computeReadingTime), D4: enforceAuthor hook (+33 more)

### Community 3 - "Payload CMS Core Tasks"
Cohesion: 0.09
Nodes (30): Page Blocks Spec (Archived Change), Pages Collection Spec (Archived Change), Reserved Slugs Constant (Archived Change), Slug Namespace Integrity Spec (Archived Change), Payload CLI Module Resolution Fix, src/lib/env/payload.ts Module, ESM Required for Payload CLI Load (ERR_REQUIRE_ASYNC_MODULE fix), Initial PostgreSQL Migration (+22 more)

### Community 4 - "Payload CMS Core — proposal.md"
Cohesion: 0.08
Nodes (29): article-content-blocks capability, categories-collection capability, cms-access-control capability, environment-validation capability, media-collection capability, page-blocks capability, pages-collection capability, posts-collection capability (+21 more)

### Community 5 - "payload.config.ts"
Cohesion: 0.15
Nodes (14): GET, isAdmin(), isAdminFieldAccess(), isLoggedIn(), isLoggedInFieldAccess(), isOwnerOrAdmin(), Media, Redirects (+6 more)

### Community 6 - "Bootstrap Technical Foundation — tasks.md"
Cohesion: 0.08
Nodes (23): Bootstrap Technical Foundation — design.md, Context, D1. Baseline de versiones fijado explícitamente, D2. Alcance de Docker: dev ahora, hardening en Phase 10, D3. Validación de entorno con Zod, fallo temprano, D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía, D5. `payload-types.ts` como efecto natural, no como entregable, D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario (+15 more)

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
Cohesion: 0.11
Nodes (19): dependencies, class-variance-authority, cn, graphql, lucide-react, next, payload, @payloadcms/db-postgres (+11 more)

### Community 12 - "(payload)/layout.tsx"
Cohesion: 0.14
Nodes (6): nextConfig, next, importMap, Args, Args, Args

### Community 13 - "Requirements"
Cohesion: 0.11
Nodes (17): Purpose, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+9 more)

### Community 14 - "ADDED Requirements"
Cohesion: 0.12
Nodes (17): ADDED Requirements, Requirement: Accessible name en controles solo-icono, Requirement: Alt apropiado en imágenes editoriales, Requirement: Contraste apropiado en category themes, Requirement: Foco visible, Requirement: Jerarquía de encabezados correcta, Requirement: Motion respeta reduced motion, Requirement: Navegación por teclado en funciones críticas (+9 more)

### Community 15 - "article-editor.ts"
Cohesion: 0.18
Nodes (8): @payloadcms/richtext-lexical, CalloutBlock, EmbedBlock, GalleryBlock, ImageBlock, QuoteBlock, RichText, createArticleEditor()

### Community 16 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+8 more)

### Community 17 - "ADDED Requirements"
Cohesion: 0.25
Nodes (8): ADDED Requirements, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Scenario: Se consulta un breakpoint del Design System, Scenario: Se usa Container en desktop ancho, Scenario: Se usa Container en mobile, Scenario: Un futuro componente de artículo necesita el ancho legible

### Community 18 - "Requirements"
Cohesion: 0.13
Nodes (14): Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Requirements (+6 more)

### Community 19 - "category-card.tsx"
Cohesion: 0.16
Nodes (13): ArticleCardData Contract (decoupled from Payload Post), CategoryCard(), CategoryCardData, CategoryCardProps, SectionHeader(), SectionHeaderProps, CATEGORY_THEME_KEYS, CategoryThemeKey (+5 more)

### Community 20 - "header.tsx"
Cohesion: 0.14
Nodes (13): class-variance-authority, cn, radix-ui, react, PaginationProps, Container(), ContainerProps, Header() (+5 more)

### Community 21 - "Bootstrap Technical Foundation — proposal.md"
Cohesion: 0.18
Nodes (11): local-docker-environment capability, Bootstrap Technical Foundation — change config, Bootstrap Technical Foundation — proposal.md, Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes (+3 more)

### Community 22 - "60 Segundos Noticias — Master Specification"
Cohesion: 0.14
Nodes (14): Acceptance Criteria (AC-* normative checklist), Block rendering pipeline (Payload Block → Resolver → View Model → Renderer → Section), Tag-based cache and targeted revalidation, Category color themes and icon keys, Data Access Layer (src/lib/data), 60 Segundos editorial Design System, Docker Compose app+db architecture, Admin/Writer roles and permissions (+6 more)

### Community 23 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Fondo principal editorial, Requirement: Fuente única de tokens de color, Requirement: Radius y sombras restringidos, Requirement: Rojo como accent principal, Requirement: Sin modo oscuro en V1, Requirements, Scenario: Se define una card editorial (+5 more)

### Community 24 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Requirements, Scenario: conexión interna usa el nombre del servicio (+5 more)

### Community 25 - "(frontend)/layout.tsx"
Cohesion: 0.10
Nodes (32): server-only, inter, oswald, dynamic, FrontendLayout(), metadata, Footer(), FooterColumn (+24 more)

### Community 26 - "Pages.ts"
Cohesion: 0.20
Nodes (7): VideoBlock, Banner, CTA, FAQ, Hero, ImageText, Pages

### Community 27 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): app-bootstrap capability, App Bootstrap — spec.md, ADDED Requirements, Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto (+8 more)

### Community 28 - "Editorial Components (capability)"
Cohesion: 0.24
Nodes (13): Correct Heading Hierarchy (AC-A11Y-005), --cat-accent / --cat-accent-fg / --cat-soft / --cat-soft-fg / --cat-border, ArticleCard, ArticleMetadata, Breadcrumbs, CategoryBadge, CategoryCard, Editorial Components (capability) (+5 more)

### Community 29 - "Categories.ts"
Cohesion: 0.23
Nodes (7): isReservedSlug(), RESERVED_SLUGS, Categories, seoFields, slugField(), createNamespaceSlugValidate(), preventDeleteWithPosts()

### Community 30 - "Posts.ts"
Cohesion: 0.23
Nodes (11): isAdminOrWriter(), Posts, enforceAuthor(), assignPublishedAt(), hasValue(), publishValidation(), REQUIRED_TO_PUBLISH, resultingStatus() (+3 more)

### Community 31 - "editorial-components spec (archived)"
Cohesion: 0.20
Nodes (12): ArticleCard component, ArticleMetadata component, ArticleCardData contract (frontend-only, not Post), Breadcrumbs component, --cat-strong (darkened accent for non-textual/text contrast fix), CategoryBadge component, CategoryCard component, ResponsiveMedia component (+4 more)

### Community 32 - "env/index.ts"
Cohesion: 0.24
Nodes (7): register(), pg, checkDatabase(), dynamic, GET(), env, envSchema

### Community 33 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Scenario: conexión interna usa el nombre del servicio, Scenario: eliminación explícita de volúmenes (+4 more)

### Community 34 - "2026-09-09-design-system-shadcn/tasks.md"
Cohesion: 0.17
Nodes (11): 10. Validación final, 11. Fixes de la ronda de `/opsx:verify` (WARNING → resuelto), 1. Tokens de color y eliminación de dark mode, 2. Tipografía, 3. Category theme system, 4. Layout primitives, 5. Texturas, 6. Primitivos shadcn (+3 more)

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
Cohesion: 0.20
Nodes (9): bootstrap-technical-foundation (prior phase), Capabilities, editorial-workflow (prior phase), Impact, Modified Capabilities, New Capabilities, payload-cms-core (prior phase), What Changes (+1 more)

### Community 43 - "Accessibility Foundation (capability)"
Cohesion: 0.27
Nodes (10): Accessibility Foundation (capability), Accessible Name on Icon-only Controls (AC-A11Y-002), Required Alt Text on ResponsiveMedia (AC-A11Y-004), Keyboard Navigation on Critical Controls (AC-A11Y-001), Motion Respects prefers-reduced-motion (AC-A11Y-008), 44px Minimum Touch Targets (AC-A11Y-007), Visible Focus State (AC-A11Y-003), Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info) (+2 more)

### Community 44 - "Retheming Installed Primitives (no generic shadcn look)"
Cohesion: 0.22
Nodes (10): Design Tokens (capability), src/app/globals.css, No Dark Mode in V1, Restricted Radius/Shadow Scale, Incremental, Not Mass Installation, No Inherited Dark Mode in Primitives, Retheming Installed Primitives (no generic shadcn look), shadcn/ui as Sole Primitive Base (+2 more)

### Community 45 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Requirements, Scenario: Se consulta un breakpoint del Design System, Scenario: Se usa Container en desktop ancho, Scenario: Se usa Container en mobile (+1 more)

### Community 46 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Requirements, Scenario: Se aplica la textura de papel al canvas, Scenario: Se revisa el contrato de textura expuesto al CMS, Scenario: Se usa la textura en el cuerpo de un artículo (+1 more)

### Community 47 - "article-card.ts"
Cohesion: 0.33
Nodes (7): formatShortDate(), LONG_DATE_FORMATTER, SHORT_DATE_FORMATTER, getPostUrl(), mapPostToArticleCardData(), mapUserToAuthorSummary(), mapMediaToMediaData()

### Community 48 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos, Requirement: Sin modo oscuro heredado en los primitivos, Scenario: Se evalúa añadir un primitivo nuevo, Scenario: Se inspecciona un primitivo shadcn generado, Scenario: Se renderiza Button tras la retematización (+1 more)

### Community 49 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Scenario: Se define un título de artículo (H1), Scenario: Se renderiza texto de cuerpo, Scenario: Se renderiza un encabezado de sección (+1 more)

### Community 50 - "article-card.tsx"
Cohesion: 0.21
Nodes (9): ArticleCardData, ArticleCardProps, ArticleCardVariant, ArticleMetadata(), ArticleMetadataData, ArticleMetadataProps, formatReadingTime(), ResponsiveMedia() (+1 more)

### Community 51 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Requirements, Scenario: secreto no expuesto al cliente, Scenario: un nuevo clon dispone de la plantilla de entorno, Scenario: variable crítica faltante

### Community 52 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Requirements, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles, Scenario: verificación de estado operativo

### Community 54 - "reading-time.ts"
Cohesion: 0.39
Nodes (7): countWords(), extractFromNode(), extractFromValue(), extractLexicalText(), LexicalNode, TEXT_LIKE_BLOCK_FIELD_KEYS, computeReadingTime()

### Community 55 - "accessibility-foundation spec (archived)"
Cohesion: 0.25
Nodes (8): DESIGN-SYSTEM.md (Fase 4 implementation doc), Motion tokens (--motion-fast/normal/slow + reduced-motion reset), 44px touch target technique (icon ::after 4-way + text min-w-11 + vertical-only ::after), accessibility-foundation spec (archived), AC-A11Y-006: Category theme contrast requirement, AC-A11Y-007: 44px touch target requirement, AC-A11Y-008: prefers-reduced-motion requirement, Purpose

### Community 56 - "texture-foundation spec (archived)"
Cohesion: 0.18
Nodes (11): .texture-paper-grain / .texture-newspaper-pattern utilities, texture-foundation spec (archived), ADDED Requirements, Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Scenario: Se aplica la textura de papel al canvas (+3 more)

### Community 57 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: Acceso público seguro por defecto, sin escape hatch genérico, Requirement: DAL centraliza toda lectura pública de Payload, Requirement: Filtrado explícito de _status como defensa adicional, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Requirement: Proyección/profundidad evita sobre-consulta, Scenario: El site shell necesita la configuración de navegación (+6 more)

### Community 58 - "media.ts"
Cohesion: 0.22
Nodes (7): AuthorSummary, MapMediaOptions, MediaData, MediaSizeName, enforceUploader(), Media, User

### Community 59 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Footer es administrable, Requirement: Header y Footer son presentacionales, Requirement: La ruta raíz no implementa contenido de Home, Requirement: Navegación móvil como Client Component acotado, Requirement: Navigation es administrable y dirige el Header, Requirement: SiteSettings integrado para identidad de marca (+8 more)

### Community 60 - "Category Theme System (capability)"
Cohesion: 0.18
Nodes (11): Appropriate Contrast in Category Themes (AC-A11Y-006), CATEGORY_THEME_KEYS, Category Theme System (capability), Only Controlled Keys, No Arbitrary CMS Color, data-cat-theme Attribute Mapping Mechanism, Explicit Per-theme Contrast Requirement, Paper/Off-white Main Background (--paper), newspaper-pattern.webp Utility (+3 more)

### Community 61 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 62 - "OPSX: Apply command"
Cohesion: 0.40
Nodes (6): OPSX: Apply command, OPSX: Archive command, OPSX: Explore command, OPSX: Propose command, OPSX: Sync command, OPSX: Update command

### Community 63 - "Button (shadcn primitive, re-themed)"
Cohesion: 0.40
Nodes (6): Button (shadcn primitive, re-themed), Pagination component, D5: Incremental shadcn primitive installation, shadcn-primitives capability, shadcn-primitives spec (archived), Purpose

### Community 64 - "ADDED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: AuthorSummary excluye campos privados de Users, Requirement: Category theme/icon permanecen controlados en el mapeo, Requirement: Los componentes presentacionales no reciben documentos Payload completos, Requirement: Selección de tamaño de imagen apropiado, Requirement: Solo view models con consumidor real en esta change, Scenario: Se evalúa crear un nuevo view model (+4 more)

### Community 65 - "check-environment.sh"
Cohesion: 0.60
Nodes (5): fail(), has(), ok(), check-environment.sh script, warn()

### Community 66 - "public-frontend-core/tasks.md"
Cohesion: 0.14
Nodes (13): 10. Accesibilidad, 11. Documentación, 12. Validación final, 13. Fixes de la ronda de `/opsx:verify` (WARNING → resuelto), 1. Payload Globals, 2. Acceso centralizado a Payload, 3. Data Access Layer, 4. View Models (+5 more)

### Community 67 - "D6: publishedAt assignment and restore defense"
Cohesion: 0.40
Nodes (5): D6: publishedAt assignment and restore defense, publishedAt permanece estable (delta), publishedAt se asigna una sola vez (delta), publishedAt permanece estable, publishedAt se asigna una sola vez

### Community 68 - "60 Segundos Noticias — Frontend Architecture (Fase 5)"
Cohesion: 0.18
Nodes (10): 60 Segundos Noticias — Frontend Architecture (Fase 5), Data Access Layer (`src/lib/data/`), Fechas, Flujo general, Fuera de alcance de esta Fase, Next.js 16 y contenido administrable, Seguridad — acceso público a Payload, Site shell (`src/components/site/`) (+2 more)

### Community 69 - "payload.ts"
Cohesion: 0.40
Nodes (3): zod, payloadEnv, payloadEnvSchema

### Community 70 - "category-badge.tsx"
Cohesion: 0.21
Nodes (10): CategoryBadge(), CategoryBadgeProps, categoryBadgeVariants, CATEGORY_ICON_COMPONENTS, CategoryIcon(), CategoryIconProps, CATEGORY_ICON_KEYS, CategoryIconKey (+2 more)

### Community 73 - "category-icon-map.tsx (CategoryIconKey to Lucide mapping)"
Cohesion: 0.67
Nodes (3): category-icon-keys.ts (framework-neutral constant), category-icon-map.tsx (CategoryIconKey to Lucide mapping), D3: Category icon key to Lucide mapping in dedicated frontend module

### Community 90 - "ADDED Requirements"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Purpose, Requirement: Helpers de URL canónica centralizados, Requirement: No implementa las rutas dinámicas correspondientes, Requirement: Resolución de enlaces de Navigation/Footer, Scenario: Se busca la ruta dinámica de artículo, Scenario: Se necesita el enlace de un Post en una tarjeta, Scenario: Un item de Navigation es de tipo category (+1 more)

### Community 119 - "sheet.tsx"
Cohesion: 0.22
Nodes (6): MobileNavProps, Sheet(), SheetContent(), SheetHeader(), SheetTitle(), SheetTrigger()

### Community 120 - "ADDED Requirements"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Purpose, Requirement: Continuidad de foco visible y touch targets, Requirement: Landmarks semánticos en el shell público, Requirement: Navegación móvil operable por teclado, Scenario: Se abre la navegación móvil con teclado, Scenario: Se enfoca el trigger del menú móvil por teclado, Scenario: Un usuario de lector de pantalla navega el shell

### Community 121 - "AGENTS.md — Agent Instructions"
Cohesion: 0.24
Nodes (11): AGENTS.md — Agent Instructions, .claude/CLAUDE.md (graphify trigger), CLAUDE.md — Claude Code Project Instructions, Graphify-first navigation rule, OpenSpec change workflow, Presentational components do not query Payload directly (rule), skills-lock.json roster, Project skills routing/precedence policy (+3 more)

### Community 122 - "payload"
Cohesion: 0.54
Nodes (4): payload, linkFields, socialLinksField, Footer

### Community 123 - "public-frontend-core/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 124 - "Requirement: Utilidad centralizada de formato de fecha"
Cohesion: 0.33
Nodes (5): ADDED Requirements, Purpose, Requirement: Utilidad centralizada de formato de fecha, Scenario: Se formatea la fecha de publicación de un Post, Scenario: Se revisan las dependencias tras este change

### Community 125 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): Health Check — spec.md, ADDED Requirements, Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles (+1 more)

### Community 128 - "compose.yaml"
Cohesion: 0.52
Nodes (6): health-check capability, Next.js, Payload CMS, PostgreSQL, AI / SDD Workflow, README.md — 60 Segundos Noticias

### Community 129 - "Layout Primitives (capability)"
Cohesion: 0.29
Nodes (7): Container (layout primitive), layout-primitives spec (archived), Purpose, Breakpoints Aligned to Master Spec (sm/md/lg/xl/2xl), Container, Layout Primitives (capability), Readable Article/Wide-media Widths

### Community 130 - "Typography System (capability)"
Cohesion: 0.33
Nodes (6): D7: Fonts via next/font/google, no font management library, typography-system spec (archived), Purpose, Typographic Scale (Display XL, H1-H3, Section Heading, Body, Lead, Metadata), Typography System (capability), Uppercase Restricted to Nav/Buttons/Section & Category Labels

### Community 131 - "lucide-react"
Cohesion: 0.40
Nodes (3): lucide-react, BreadcrumbItem, BreadcrumbsProps

## Ambiguous Edges - Review These
- `Motion Respects prefers-reduced-motion (AC-A11Y-008)` → `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`  [AMBIGUOUS]
  openspec/specs/accessibility-foundation/spec.md · relation: conceptually_related_to

## Knowledge Gaps
- **595 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+590 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 644 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Motion Respects prefers-reduced-motion (AC-A11Y-008)` and `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Category Theme System (capability)` connect `Category Theme System (capability)` to `Decisions`, `2026-09-09-design-system-shadcn/tasks.md`, `category-badge.tsx`, `2026-09-09-design-system-shadcn/proposal.md`, `category-card.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `payload` connect `payload` to `media.ts`, `payload.config.ts`, `category-badge.tsx`, `package.json`, `dev.ts`, `(payload)/layout.tsx`, `article-editor.ts`, `reading-time.ts`, `(frontend)/layout.tsx`, `Pages.ts`, `Categories.ts`, `Posts.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Texture Foundation (capability)` connect `Category Theme System (capability)` to `texture-foundation spec (archived)`, `2026-09-09-design-system-shadcn/proposal.md`, `2026-09-09-design-system-shadcn/tasks.md`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _595 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Decisions` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._