# Graph Report - 60segundosnoticias  (2026-09-09)

## Corpus Check
- 26 files · ~111,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1054 nodes · 1299 edges · 119 communities (71 shown, 46 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.88)
- Token cost: 206,513 input · 0 output

## Community Hubs (Navigation)
- payload-types.ts
- Category Theme Token Design Decisions
- Editorial Workflow Change Proposal
- Payload CMS Core Tasks
- Payload CMS Core — proposal.md
- Payload Config & GraphQL API
- Bootstrap Technical Foundation — tasks.md
- package.json
- components.json
- compilerOptions
- Requirements
- dependencies
- (payload)/layout.tsx
- Requirements
- ADDED Requirements
- Article Content Blocks
- ADDED Requirements
- ADDED Requirements
- Requirements
- ArticleCard & ArticleMetadata Components
- CategoryCard & Icon Mapping
- Bootstrap Technical Foundation — proposal.md
- 60 Segundos Noticias — Master Specification
- Requirements
- Requirements
- button.tsx
- Page & Gallery Content Blocks
- ADDED Requirements
- Editorial Components Spec
- Categories & Slug Validation
- Posts Ownership & Publish Validation
- Design System Doc — Components
- env/index.ts
- ADDED Requirements
- tasks.md
- Requirements
- devDependencies
- scripts
- AGENTS.md — Agent Instructions
- 60 Segundos Noticias — Design System (Fase 4)
- Requirements
- Requirements
- proposal.md
- Accessibility Foundation Spec
- Design Tokens & shadcn Primitives Spec
- Requirements
- Requirements
- ADDED Requirements
- ADDED Requirements
- ADDED Requirements
- Category Theme & Texture Contracts Spec
- Requirements
- Requirements
- @payloadcms/db-postgres
- reading-time.ts
- Accessibility Foundation Doc & Spec (Archived)
- ADDED Requirements
- SectionHeader & Category Theme Resolver
- Media Collection Ownership
- compose.yaml
- Texture Foundation Doc & Spec
- [...slug]/route.ts
- OPSX: Apply command
- Button & Pagination — shadcn Policy (Archived)
- Typography System Spec
- check-environment.sh
- (frontend)/layout.tsx
- D6: publishedAt assignment and restore defense
- breadcrumbs.tsx
- Payload Env Loader
- CategoryBadge Component
- Category Icon Key Mapping
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
- Package pnpm Config
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

## God Nodes (most connected - your core abstractions)
1. `payload` - 37 edges
2. `60 Segundos Noticias — Master Specification` - 19 edges
3. `compilerOptions` - 17 edges
4. `Payload CMS Core Tasks` - 17 edges
5. `Payload CMS Core — proposal.md` - 16 edges
6. `Bootstrap Technical Foundation — proposal.md` - 13 edges
7. `editorial-components spec (archived)` - 12 edges
8. `scripts` - 12 edges
9. `Editorial Components (capability)` - 12 edges
10. `Bootstrap Technical Foundation — tasks.md` - 11 edges

## Surprising Connections (you probably didn't know these)
- `.claude/CLAUDE.md (graphify trigger)` --semantically_similar_to--> `CLAUDE.md — Claude Code Project Instructions`  [INFERRED] [semantically similar]
  .claude/CLAUDE.md → CLAUDE.md
- `editorial-components spec (archived)` --references--> `Pagination component`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/editorial-components/spec.md → docs/DESIGN-SYSTEM.md
- `AI / SDD Workflow` --references--> `Bootstrap Technical Foundation — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-bootstrap-technical-foundation/proposal.md
- `AI / SDD Workflow` --references--> `Payload CMS Core — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-payload-cms-core/proposal.md
- `editorial-components spec (archived)` --references--> `ArticleCard component`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/editorial-components/spec.md → docs/DESIGN-SYSTEM.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OPSX experimental 'actions on a change' command set** — claude_commands_opsx_apply_command, claude_commands_opsx_archive_command, claude_commands_opsx_explore_command, claude_commands_opsx_propose_command, claude_commands_opsx_sync_command, claude_commands_opsx_update_command [EXTRACTED 0.95]
- **Posts beforeChange hook order: enforceAuthor -> publishValidation -> computeReadingTime** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d3_hook_order_beforechange, openspec_changes_archive_2026_09_09_editorial_workflow_design_d4_enforceauthor, openspec_changes_archive_2026_09_09_editorial_workflow_design_d5_publishvalidation, openspec_changes_archive_2026_09_09_editorial_workflow_design_d7_computereadingtime [EXTRACTED 1.00]
- **Bootstrap Technical Foundation New Capabilities** — capability_app_bootstrap, capability_environment_validation, capability_health_check, capability_local_docker_environment [EXTRACTED 1.00]
- **beforeDelete reference-check pattern shared by Categories and Users (D9)** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d9_deletion_protection_categories_users, openspec_specs_categories_collection_spec_eliminacion_de_categories_bloqueada_mientras_existan_posts_que_las_referencian, openspec_specs_users_collection_spec_eliminacion_de_users_bloqueada_mientras_existan_posts_que_los_referencian [EXTRACTED 1.00]
- **OPSX Experimental Artifact Workflow Commands** — claude_commands_opsx_new, claude_commands_opsx_continue, claude_commands_opsx_ff, claude_commands_opsx_verify [EXTRACTED 1.00]
- **Payload CMS Core V1 Collections** — capability_users_collection, capability_media_collection, capability_categories_collection, capability_tags_collection, capability_posts_collection, capability_pages_collection, capability_redirects_collection [EXTRACTED 1.00]
- **Local Development Infrastructure Bootstrap** — openspec_specs_app_bootstrap_spec_appbootstrapspec, openspec_specs_environment_validation_spec_environmentvalidationspec, openspec_specs_health_check_spec_healthcheckspec, openspec_specs_local_docker_environment_spec_localdockerenvironmentspec [INFERRED 0.80]
- **Server always overrides client-submitted value (author, publishedAt, readingTimeMinutes)** — openspec_specs_post_ownership_spec_writer_no_puede_reasignar_el_autor, openspec_specs_publishing_workflow_spec_publishedat_permanece_estable, openspec_specs_reading_time_spec_readingtimeminutes_no_es_editable_manualmente [INFERRED 0.80]
- **Controlled Content Block System (Payload-managed, no arbitrary HTML/CSS)** — openspec_specs_article_content_blocks_spec_articlecontentblocksspec, openspec_specs_page_blocks_spec_pageblocksspec, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages [INFERRED 0.85]
- **Payload CMS Core Collections** — openspec_specs_tags_collection_spec_tags, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages, openspec_specs_redirects_collection_spec_redirects [INFERRED 0.85]
- **Documents independently restating the Master Spec > OpenSpec > implementation > tooling priority order** — docs_60_segundos_spec_doc, concept_source_of_truth_priority [INFERRED 0.85]
- **Contrast-safe category theme rendering** — docs_design_system_cat_strong_token, docs_design_system_category_card, docs_design_system_category_badge, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_accessibility_foundation_spec_ac_a11y_006_contrast [INFERRED 0.85]
- **Incremental shadcn primitive adoption policy** — openspec_changes_archive_2026_09_09_design_system_shadcn_design_d5_incremental_shadcn_installation, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_shadcn_primitives_spec, docs_design_system_button_component, openspec_changes_archive_2026_09_09_design_system_shadcn_proposal_shadcn_primitives_capability [EXTRACTED 1.00]
- **44px touch target accessibility fix flow** — docs_design_system_touch_target_technique, docs_design_system_button_component, docs_design_system_pagination, openspec_changes_archive_2026_09_09_design_system_shadcn_specs_accessibility_foundation_spec_ac_a11y_007_touch_target, openspec_changes_archive_2026_09_09_design_system_shadcn_tasks [INFERRED 0.85]
- **Phase 4 Design System (8 capabilities)** — openspec_specs_accessibility_foundation_spec_accessibility_foundation, openspec_specs_category_theme_system_spec_category_theme_system, openspec_specs_design_tokens_spec_design_tokens, openspec_specs_editorial_components_spec_editorial_components, openspec_specs_layout_primitives_spec_layout_primitives, openspec_specs_shadcn_primitives_spec_shadcn_primitives, openspec_specs_texture_foundation_spec_texture_foundation, openspec_specs_typography_system_spec_typography_system [INFERRED 0.85]
- **Retheming shadcn Primitives with 60 Segundos Tokens** — openspec_specs_design_tokens_spec_color_tokens, openspec_specs_typography_system_spec_oswald, openspec_specs_typography_system_spec_inter, openspec_specs_shadcn_primitives_spec_retheming [INFERRED 0.85]
- **CMS Cannot Choose Arbitrary Visual Values (controlled-vocabulary + data-boundary pattern)** — openspec_specs_category_theme_system_spec_controlled_keys_policy, openspec_specs_texture_foundation_spec_texture_contract, openspec_specs_editorial_components_spec_articlecarddata_contract, src_lib_constants_category_theme_keys [INFERRED 0.75]

## Communities (119 total, 46 thin omitted)

### Community 0 - "payload-types.ts"
Cohesion: 0.04
Nodes (47): Auth, BannerBlock, BannerBlockSelect, CalloutBlock, CategoriesSelect, Category, CollectionsWidget, Config (+39 more)

### Community 1 - "Category Theme Token Design Decisions"
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

### Community 5 - "Payload Config & GraphQL API"
Cohesion: 0.12
Nodes (15): GET, OPTIONS, POST, isAdmin(), isAdminFieldAccess(), isAdminOrWriter(), isLoggedIn(), isLoggedInFieldAccess() (+7 more)

### Community 6 - "Bootstrap Technical Foundation — tasks.md"
Cohesion: 0.08
Nodes (23): Bootstrap Technical Foundation — design.md, Context, D1. Baseline de versiones fijado explícitamente, D2. Alcance de Docker: dev ahora, hardening en Phase 10, D3. Validación de entorno con Zod, fallo temprano, D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía, D5. `payload-types.ts` como efecto natural, no como entregable, D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario (+15 more)

### Community 7 - "package.json"
Cohesion: 0.09
Nodes (22): engines, node, name, private, type, version, eslint, graphql (+14 more)

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

### Community 15 - "Article Content Blocks"
Cohesion: 0.21
Nodes (9): payload, @payloadcms/richtext-lexical, CalloutBlock, EmbedBlock, ImageBlock, QuoteBlock, VideoBlock, RichText (+1 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+8 more)

### Community 17 - "ADDED Requirements"
Cohesion: 0.13
Nodes (15): Container (layout primitive), layout-primitives spec (archived), ADDED Requirements, Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Scenario: Se consulta un breakpoint del Design System (+7 more)

### Community 18 - "Requirements"
Cohesion: 0.13
Nodes (14): Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Requirements (+6 more)

### Community 19 - "ArticleCard & ArticleMetadata Components"
Cohesion: 0.19
Nodes (10): cn, ArticleCardData, ArticleCardProps, ArticleCardVariant, ArticleMetadata(), ArticleMetadataData, ArticleMetadataProps, formatReadingTime() (+2 more)

### Community 20 - "CategoryCard & Icon Mapping"
Cohesion: 0.18
Nodes (10): CategoryCardData, CategoryCardProps, CATEGORY_ICON_COMPONENTS, CategoryIcon(), CategoryIconProps, CATEGORY_ICON_KEYS, CategoryIconKey, CategoryThemeKey (+2 more)

### Community 21 - "Bootstrap Technical Foundation — proposal.md"
Cohesion: 0.14
Nodes (14): app-bootstrap capability, local-docker-environment capability, Bootstrap Technical Foundation — change config, Bootstrap Technical Foundation — proposal.md, Capabilities, Impact, Modified Capabilities, New Capabilities (+6 more)

### Community 22 - "60 Segundos Noticias — Master Specification"
Cohesion: 0.14
Nodes (14): Acceptance Criteria (AC-* normative checklist), Block rendering pipeline (Payload Block → Resolver → View Model → Renderer → Section), Tag-based cache and targeted revalidation, Category color themes and icon keys, Data Access Layer (src/lib/data), 60 Segundos editorial Design System, Docker Compose app+db architecture, Admin/Writer roles and permissions (+6 more)

### Community 23 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Fondo principal editorial, Requirement: Fuente única de tokens de color, Requirement: Radius y sombras restringidos, Requirement: Rojo como accent principal, Requirement: Sin modo oscuro en V1, Requirements, Scenario: Se define una card editorial (+5 more)

### Community 24 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Requirements, Scenario: conexión interna usa el nombre del servicio (+5 more)

### Community 25 - "button.tsx"
Cohesion: 0.20
Nodes (8): class-variance-authority, radix-ui, react, PaginationProps, Container(), ContainerProps, Button(), buttonVariants

### Community 26 - "Page & Gallery Content Blocks"
Cohesion: 0.22
Nodes (6): GalleryBlock, Banner, CTA, FAQ, Hero, ImageText

### Community 27 - "ADDED Requirements"
Cohesion: 0.15
Nodes (13): ADDED Requirements, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Scenario: Build de producción exitoso (+5 more)

### Community 28 - "Editorial Components Spec"
Cohesion: 0.24
Nodes (13): Correct Heading Hierarchy (AC-A11Y-005), --cat-accent / --cat-accent-fg / --cat-soft / --cat-soft-fg / --cat-border, ArticleCard, ArticleMetadata, Breadcrumbs, CategoryBadge, CategoryCard, Editorial Components (capability) (+5 more)

### Community 29 - "Categories & Slug Validation"
Cohesion: 0.23
Nodes (7): isReservedSlug(), RESERVED_SLUGS, Categories, seoFields, slugField(), createNamespaceSlugValidate(), preventDeleteWithPosts()

### Community 30 - "Posts Ownership & Publish Validation"
Cohesion: 0.28
Nodes (9): enforceAuthor(), assignPublishedAt(), hasValue(), publishValidation(), REQUIRED_TO_PUBLISH, resultingStatus(), generateSlugFromTitle(), slugify() (+1 more)

### Community 31 - "Design System Doc — Components"
Cohesion: 0.20
Nodes (12): ArticleCard component, ArticleMetadata component, ArticleCardData contract (frontend-only, not Post), Breadcrumbs component, --cat-strong (darkened accent for non-textual/text contrast fix), CategoryBadge component, CategoryCard component, ResponsiveMedia component (+4 more)

### Community 32 - "env/index.ts"
Cohesion: 0.21
Nodes (8): register(), pg, server-only, checkDatabase(), dynamic, GET(), env, envSchema

### Community 33 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Scenario: conexión interna usa el nombre del servicio, Scenario: eliminación explícita de volúmenes (+4 more)

### Community 34 - "tasks.md"
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

### Community 38 - "AGENTS.md — Agent Instructions"
Cohesion: 0.24
Nodes (11): AGENTS.md — Agent Instructions, .claude/CLAUDE.md (graphify trigger), CLAUDE.md — Claude Code Project Instructions, Graphify-first navigation rule, OpenSpec change workflow, Presentational components do not query Payload directly (rule), skills-lock.json roster, Project skills routing/precedence policy (+3 more)

### Community 39 - "60 Segundos Noticias — Design System (Fase 4)"
Cohesion: 0.18
Nodes (11): 60 Segundos Noticias — Design System (Fase 4), Accesibilidad, Category theme system, Componentes editoriales (`src/components/editorial/`), Contraste verificado (`--cat-accent-fg`), Layout, Motion, shadcn/ui (+3 more)

### Community 40 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos, Requirement: Sin modo oscuro heredado en los primitivos, Requirements, Scenario: Se evalúa añadir un primitivo nuevo, Scenario: Se inspecciona un primitivo shadcn instalado (+2 more)

### Community 41 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Requirements, Scenario: Se define un título de artículo (H1), Scenario: Se renderiza texto de cuerpo (+2 more)

### Community 42 - "proposal.md"
Cohesion: 0.20
Nodes (9): bootstrap-technical-foundation (prior phase), Capabilities, editorial-workflow (prior phase), Impact, Modified Capabilities, New Capabilities, payload-cms-core (prior phase), What Changes (+1 more)

### Community 43 - "Accessibility Foundation Spec"
Cohesion: 0.27
Nodes (10): Accessibility Foundation (capability), Accessible Name on Icon-only Controls (AC-A11Y-002), Required Alt Text on ResponsiveMedia (AC-A11Y-004), Keyboard Navigation on Critical Controls (AC-A11Y-001), Motion Respects prefers-reduced-motion (AC-A11Y-008), 44px Minimum Touch Targets (AC-A11Y-007), Visible Focus State (AC-A11Y-003), Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info) (+2 more)

### Community 44 - "Design Tokens & shadcn Primitives Spec"
Cohesion: 0.22
Nodes (10): Design Tokens (capability), src/app/globals.css, No Dark Mode in V1, Restricted Radius/Shadow Scale, Incremental, Not Mass Installation, No Inherited Dark Mode in Primitives, Retheming Installed Primitives (no generic shadcn look), shadcn/ui as Sole Primitive Base (+2 more)

### Community 45 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Requirements, Scenario: Se consulta un breakpoint del Design System, Scenario: Se usa Container en desktop ancho, Scenario: Se usa Container en mobile (+1 more)

### Community 46 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Requirements, Scenario: Se aplica la textura de papel al canvas, Scenario: Se revisa el contrato de textura expuesto al CMS, Scenario: Se usa la textura en el cuerpo de un artículo (+1 more)

### Community 47 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): Health Check — spec.md, ADDED Requirements, Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles (+1 more)

### Community 48 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos, Requirement: Sin modo oscuro heredado en los primitivos, Scenario: Se evalúa añadir un primitivo nuevo, Scenario: Se inspecciona un primitivo shadcn generado, Scenario: Se renderiza Button tras la retematización (+1 more)

### Community 49 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): ADDED Requirements, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Scenario: Se define un título de artículo (H1), Scenario: Se renderiza texto de cuerpo, Scenario: Se renderiza un encabezado de sección (+1 more)

### Community 50 - "Category Theme & Texture Contracts Spec"
Cohesion: 0.28
Nodes (8): Appropriate Contrast in Category Themes (AC-A11Y-006), CATEGORY_THEME_KEYS, Category Theme System (capability), Only Controlled Keys, No Arbitrary CMS Color, data-cat-theme Attribute Mapping Mechanism, Explicit Per-theme Contrast Requirement, ArticleCardData Contract (decoupled from Payload Post), No Arbitrary CMS Texture Selection

### Community 51 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Requirements, Scenario: secreto no expuesto al cliente, Scenario: un nuevo clon dispone de la plantilla de entorno, Scenario: variable crítica faltante

### Community 52 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Requirements, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles, Scenario: verificación de estado operativo

### Community 54 - "reading-time.ts"
Cohesion: 0.39
Nodes (7): countWords(), extractFromNode(), extractFromValue(), extractLexicalText(), LexicalNode, TEXT_LIKE_BLOCK_FIELD_KEYS, computeReadingTime()

### Community 55 - "Accessibility Foundation Doc & Spec (Archived)"
Cohesion: 0.25
Nodes (8): DESIGN-SYSTEM.md (Fase 4 implementation doc), Motion tokens (--motion-fast/normal/slow + reduced-motion reset), 44px touch target technique (icon ::after 4-way + text min-w-11 + vertical-only ::after), accessibility-foundation spec (archived), AC-A11Y-006: Category theme contrast requirement, AC-A11Y-007: 44px touch target requirement, AC-A11Y-008: prefers-reduced-motion requirement, Purpose

### Community 56 - "ADDED Requirements"
Cohesion: 0.25
Nodes (8): ADDED Requirements, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Scenario: Se aplica la textura de papel al canvas, Scenario: Se revisa el contrato de textura expuesto al CMS, Scenario: Se usa la textura en el cuerpo de un artículo, Scenario: Un componente futuro de Hero necesita la textura decorativa

### Community 57 - "SectionHeader & Category Theme Resolver"
Cohesion: 0.32
Nodes (6): SectionHeader(), SectionHeaderProps, CATEGORY_THEME_KEYS, CATEGORY_THEME_KEY_SET, DEFAULT_CATEGORY_THEME_KEY, resolveCategoryThemeKey()

### Community 58 - "Media Collection Ownership"
Cohesion: 0.32
Nodes (5): isOwnerOrAdmin(), Media, enforceUploader(), preventDeleteReferenced(), Media

### Community 59 - "compose.yaml"
Cohesion: 0.52
Nodes (6): health-check capability, Next.js, Payload CMS, PostgreSQL, AI / SDD Workflow, README.md — 60 Segundos Noticias

### Community 60 - "Texture Foundation Doc & Spec"
Cohesion: 0.29
Nodes (7): .texture-paper-grain / .texture-newspaper-pattern utilities, texture-foundation spec (archived), Purpose, Paper/Off-white Main Background (--paper), newspaper-pattern.webp Utility, paper-grain.webp Utility, Texture Foundation (capability)

### Community 61 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 62 - "OPSX: Apply command"
Cohesion: 0.40
Nodes (6): OPSX: Apply command, OPSX: Archive command, OPSX: Explore command, OPSX: Propose command, OPSX: Sync command, OPSX: Update command

### Community 63 - "Button & Pagination — shadcn Policy (Archived)"
Cohesion: 0.40
Nodes (6): Button (shadcn primitive, re-themed), Pagination component, D5: Incremental shadcn primitive installation, shadcn-primitives capability, shadcn-primitives spec (archived), Purpose

### Community 64 - "Typography System Spec"
Cohesion: 0.33
Nodes (6): D7: Fonts via next/font/google, no font management library, typography-system spec (archived), Purpose, Typographic Scale (Display XL, H1-H3, Section Heading, Body, Lead, Metadata), Typography System (capability), Uppercase Restricted to Nav/Buttons/Section & Category Labels

### Community 65 - "check-environment.sh"
Cohesion: 0.60
Nodes (5): fail(), has(), ok(), check-environment.sh script, warn()

### Community 66 - "(frontend)/layout.tsx"
Cohesion: 0.47
Nodes (3): inter, oswald, metadata

### Community 67 - "D6: publishedAt assignment and restore defense"
Cohesion: 0.40
Nodes (5): D6: publishedAt assignment and restore defense, publishedAt permanece estable (delta), publishedAt se asigna una sola vez (delta), publishedAt permanece estable, publishedAt se asigna una sola vez

### Community 68 - "breadcrumbs.tsx"
Cohesion: 0.40
Nodes (3): lucide-react, BreadcrumbItem, BreadcrumbsProps

### Community 69 - "Payload Env Loader"
Cohesion: 0.40
Nodes (3): zod, payloadEnv, payloadEnvSchema

### Community 70 - "CategoryBadge Component"
Cohesion: 0.67
Nodes (3): CategoryBadge(), CategoryBadgeProps, categoryBadgeVariants

### Community 73 - "Category Icon Key Mapping"
Cohesion: 0.67
Nodes (3): category-icon-keys.ts (framework-neutral constant), category-icon-map.tsx (CategoryIconKey to Lucide mapping), D3: Category icon key to Lucide mapping in dedicated frontend module

## Ambiguous Edges - Review These
- `Motion Respects prefers-reduced-motion (AC-A11Y-008)` → `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`  [AMBIGUOUS]
  openspec/specs/accessibility-foundation/spec.md · relation: conceptually_related_to

## Knowledge Gaps
- **502 isolated node(s):** `Auth`, `BannerBlock`, `BannerBlockSelect`, `CalloutBlock`, `CategoriesSelect` (+497 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 546 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Motion Respects prefers-reduced-motion (AC-A11Y-008)` and `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `payload` connect `Article Content Blocks` to `Media Collection Ownership`, `Payload Config & GraphQL API`, `package.json`, `dev.ts`, `(payload)/layout.tsx`, `CategoryCard & Icon Mapping`, `reading-time.ts`, `Page & Gallery Content Blocks`, `Categories & Slug Validation`, `Posts Ownership & Publish Validation`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Category Theme System (capability)` connect `Category Theme & Texture Contracts Spec` to `Category Theme Token Design Decisions`, `proposal.md`, `tasks.md`, `CategoryCard & Icon Mapping`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `CategoryCard` connect `Editorial Components Spec` to `Category Theme & Texture Contracts Spec`, `Design Tokens & shadcn Primitives Spec`, `CategoryCard & Icon Mapping`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `Auth`, `BannerBlock`, `BannerBlockSelect` to the rest of the system?**
  _502 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Category Theme Token Design Decisions` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._