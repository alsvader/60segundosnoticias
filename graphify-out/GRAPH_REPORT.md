# Graph Report - 60segundosnoticias  (2026-09-13)

## Corpus Check
- 391 files · ~433,729 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2712 nodes · 3932 edges · 209 communities (161 shown, 46 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2977ff5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- payload-types.ts
- ADDED Requirements
- Editorial Workflow Change Proposal
- Payload CMS Core Tasks
- Payload CMS Core — proposal.md
- [post]/page.tsx
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
- category-badge.tsx
- home-block-renderer.tsx
- Bootstrap Technical Foundation — proposal.md
- 60 Segundos Noticias — Master Specification
- Requirements
- Requirements
- [category]/page.tsx
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
- build-search-doc.ts
- category-theme-system spec (archived)
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
- invalidate.ts
- 2026-09-09-design-system-shadcn/proposal.md
- texture-foundation spec (archived)
- ADDED Requirements
- ADDED Requirements
- Requirements
- Requirements
- ADDED Requirements
- OPSX: Apply command
- ADDED Requirements
- 2026-09-10-public-frontend-core/tasks.md
- check-environment.sh
- article-card.tsx
- D6: publishedAt assignment and restore defense
- 60 Segundos Noticias — Frontend Architecture (Fase 5-8)
- canonical.ts
- ADDED Requirements
- resolve-root-slug.ts
- category-icon-map.tsx (CategoryIconKey to Lucide mapping)
- article-header.tsx
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
- react
- mapMediaToMediaData
- embed-block.tsx
- Decisions
- ADDED Requirements
- Requirements
- ADDED Requirements
- Requirements
- environment-validation capability
- references.ts
- Decisions
- Home.ts
- buscar/page.tsx
- ADDED Requirements
- Requirements
- 2026-09-10-public-frontend-core/proposal.md
- Requirement: Utilidad centralizada de formato de fecha
- Requirement: Utilidad centralizada de formato de fecha
- resolve-home-blocks.ts
- ADDED Requirements
- ADDED Requirements
- Button (shadcn primitive, re-themed)
- Decisions
- ADDED Requirements
- Requirements
- ADDED Requirements
- 2026-09-10-dynamic-home-builder/tasks.md
- ADDED Requirements
- Requirements
- Requirements
- ADDED Requirements
- ADDED Requirements
- Requirements
- payload.config.ts
- Requirement: seed:initial pobla solo entidades con schema ya implementado
- video-block.tsx
- 2026-09-10-dynamic-home-builder/proposal.md
- Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL
- lexical-renderer.tsx
- site-search/tasks.md
- Requirements
- page-block-renderer.tsx
- Requirements
- ADDED Requirements
- ADDED Requirements
- faq-section.tsx
- Requirements
- Requirement: Modos de selección de posts
- Requirements
- ADDED Requirements
- author-card.tsx
- ADDED Requirements
- ADDED Requirements
- llms-txt.ts
- Requirements
- ADDED Requirements
- posts.ts
- (frontend)/layout.tsx
- 2026-09-11-category-article-pages/tasks.md
- 2026-09-11-preview-seo-cache-redirects/tasks.md
- draft-documents.ts
- 60 Segundos Noticias — Preview, SEO, Cache y Redirects (Fase 8)
- Requirement: Búsqueda pública de contenido por slug
- Requirements
- ADDED Requirements
- 2026-09-13-add-draft-mode-banner/proposal.md
- 2026-09-11-category-article-pages/design.md
- 2026-09-11-category-article-pages/proposal.md
- Requirements
- ADDED Requirements
- ADDED Requirements
- Requirement: CTA
- Requirements
- ADDED Requirements
- Requirements
- 2026-09-11-preview-seo-cache-redirects/design.md
- 2026-09-11-preview-seo-cache-redirects/proposal.md
- Requirement: Origen de sitio canónico centralizado
- site-search/design.md
- site-search/proposal.md
- REMOVED Requirements
- 2026-09-13-add-draft-mode-banner/design.md
- Design Tokens (capability)
- Requirement: Indicador visible de Draft Mode
- 2026-09-13-add-draft-mode-banner/tasks.md
- eslint.config.mjs
- Texture Foundation (capability)
- 60 Segundos Noticias — Search (Fase 9)
- payload.ts

## God Nodes (most connected - your core abstractions)
1. `payload` - 65 edges
2. `mapMediaToMediaData()` - 29 edges
3. `findPublished()` - 21 edges
4. `getPostUrl()` - 21 edges
5. `server-only` - 20 edges
6. `react` - 19 edges
7. `getCategoryUrl()` - 19 edges
8. `60 Segundos Noticias — Master Specification` - 19 edges
9. `getAbsoluteUrl()` - 18 edges
10. `ArticlePage()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `.claude/CLAUDE.md (graphify trigger)` --semantically_similar_to--> `CLAUDE.md — Claude Code Project Instructions`  [INFERRED] [semantically similar]
  .claude/CLAUDE.md → CLAUDE.md
- `AI / SDD Workflow` --references--> `Payload CMS Core — proposal.md`  [INFERRED]
  docs/AI-WORKFLOW.md → openspec/changes/archive/2026-09-09-payload-cms-core/proposal.md
- `editorial-components spec (archived)` --references--> `Pagination component`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/editorial-components/spec.md → docs/DESIGN-SYSTEM.md
- `category-theme-system spec (archived)` --references--> `CATEGORY_THEME_KEYS (framework-neutral constant)`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/specs/category-theme-system/spec.md → docs/DESIGN-SYSTEM.md
- `D7: Fonts via next/font/google, no font management library` --references--> `DESIGN-SYSTEM.md (Fase 4 implementation doc)`  [EXTRACTED]
  openspec/changes/archive/2026-09-09-design-system-shadcn/design.md → docs/DESIGN-SYSTEM.md

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

## Communities (209 total, 46 thin omitted)

### Community 0 - "payload-types.ts"
Cohesion: 0.03
Nodes (58): ArticleSidebar, ArticleSidebarSelect, Auth, BannerBlock, BannerBlockSelect, CategoriesSelect, CategoryExplorerBlock, CategoryExplorerBlockSelect (+50 more)

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

### Community 5 - "[post]/page.tsx"
Cohesion: 0.17
Nodes (19): ArticlePage(), ArticlePageProps, generateMetadata(), loadPost, ArticleAside(), ArticleAsideProps, RelatedPosts(), RelatedPostsProps (+11 more)

### Community 6 - "Bootstrap Technical Foundation — tasks.md"
Cohesion: 0.20
Nodes (9): Bootstrap Technical Foundation — tasks.md, 1. Verificación de versiones y bootstrap del proyecto, 2. Esqueleto de Next.js (App Router), 3. Integración de Payload CMS + PostgreSQL, 4. Tailwind CSS + shadcn/ui, 5. Validación de variables de entorno, 6. Endpoint `/api/health`, 7. Docker Compose para desarrollo (+1 more)

### Community 7 - "package.json"
Cohesion: 0.08
Nodes (25): engines, node, name, pnpm, onlyBuiltDependencies, private, type, version (+17 more)

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
Cohesion: 0.09
Nodes (22): dependencies, class-variance-authority, cn, graphql, lucide-react, next, payload, @payloadcms/db-postgres (+14 more)

### Community 12 - "(payload)/layout.tsx"
Cohesion: 0.16
Nodes (4): importMap, Args, Args, Args

### Community 13 - "Requirements"
Cohesion: 0.11
Nodes (17): Purpose, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+9 more)

### Community 14 - "ADDED Requirements"
Cohesion: 0.12
Nodes (17): ADDED Requirements, Requirement: Accessible name en controles solo-icono, Requirement: Alt apropiado en imágenes editoriales, Requirement: Contraste apropiado en category themes, Requirement: Foco visible, Requirement: Jerarquía de encabezados correcta, Requirement: Motion respeta reduced motion, Requirement: Navegación por teclado en funciones críticas (+9 more)

### Community 15 - "payload"
Cohesion: 0.11
Nodes (17): payload, @payloadcms/richtext-lexical, isLoggedIn(), CalloutBlock, EmbedBlock, GalleryBlock, ImageBlock, QuoteBlock (+9 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales, Requirement: ResponsiveMedia con contrato de accesibilidad, Requirement: SectionHeader sin acceso a datos (+8 more)

### Community 17 - "layout-primitives spec (archived)"
Cohesion: 0.18
Nodes (11): Container (layout primitive), layout-primitives spec (archived), ADDED Requirements, Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos, Scenario: Se consulta un breakpoint del Design System (+3 more)

### Community 18 - "Requirements"
Cohesion: 0.13
Nodes (14): Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Requirements (+6 more)

### Community 19 - "category-badge.tsx"
Cohesion: 0.13
Nodes (20): CategoryHeader(), CategoryHeaderData, CategoryHeaderProps, CategoryBadge(), CategoryBadgeProps, categoryBadgeVariants, CategoryCard(), CategoryCardProps (+12 more)

### Community 20 - "home-block-renderer.tsx"
Cohesion: 0.11
Nodes (22): ArticleCard(), SectionHeader(), SectionHeaderProps, CategoryExplorerSection(), CategoryExplorerSectionProps, FeaturedPostsSection(), FeaturedPostsSectionProps, HeroNewsSection() (+14 more)

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

### Community 25 - "[category]/page.tsx"
Cohesion: 0.13
Nodes (25): nextConfig, next, generateMetadata(), getResolvedRootSlug, RootSlugPage(), RootSlugPageProps, generateMetadata(), HomePage() (+17 more)

### Community 26 - "ADDED Requirements"
Cohesion: 0.08
Nodes (24): ADDED Requirements, Purpose, Requirement: BannerSection comparte contrato con el Page Banner block, Requirement: Cada Home Section es presentacional y recibe solo props resueltas, Requirement: CategoryExplorerSection usa categorías seleccionadas explícitamente, Requirement: EditorialIntroSection compone un fondo y un primer plano gestionados desde el CMS, Requirement: FeaturedPostsSection usa selección manual explícita únicamente, Requirement: HeroNewsSection soporta selección manual y automática con un contrato unificado (+16 more)

### Community 27 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): app-bootstrap capability, App Bootstrap — spec.md, ADDED Requirements, Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto (+8 more)

### Community 28 - "Editorial Components (capability)"
Cohesion: 0.18
Nodes (17): Appropriate Contrast in Category Themes (AC-A11Y-006), --cat-accent / --cat-accent-fg / --cat-soft / --cat-soft-fg / --cat-border, CATEGORY_THEME_KEYS, Category Theme System (capability), Only Controlled Keys, No Arbitrary CMS Color, data-cat-theme Attribute Mapping Mechanism, Explicit Per-theme Contrast Requirement, ArticleCard (+9 more)

### Community 29 - "Categories.ts"
Cohesion: 0.26
Nodes (9): invalidateCategory(), categoryAffectsNavigation(), isReservedSlug(), RESERVED_SLUGS, createNamespaceSlugValidate(), findAffectedPublishedPostIds(), invalidateCategoryCache(), invalidateCategoryCacheOnDelete() (+1 more)

### Community 30 - "Posts.ts"
Cohesion: 0.18
Nodes (12): isAdminOrWriter(), isOwnerOrAdmin(), Posts, seoFields, enforceAuthor(), assignPublishedAt(), hasValue(), publishValidation() (+4 more)

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
Cohesion: 0.11
Nodes (19): DESIGN-SYSTEM.md (Fase 4 implementation doc), Motion tokens (--motion-fast/normal/slow + reduced-motion reset), 44px touch target technique (icon ::after 4-way + text min-w-11 + vertical-only ::after), accessibility-foundation spec (archived), AC-A11Y-006: Category theme contrast requirement, AC-A11Y-007: 44px touch target requirement, AC-A11Y-008: prefers-reduced-motion requirement, Purpose (+11 more)

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

### Community 42 - "build-search-doc.ts"
Cohesion: 0.09
Nodes (30): anyone(), countWords(), extractFieldBagText(), extractFromNode(), extractFromValue(), extractLexicalText(), LexicalNode, looksLikeFieldBag() (+22 more)

### Community 43 - "category-theme-system spec (archived)"
Cohesion: 0.27
Nodes (10): CATEGORY_THEME_KEYS (framework-neutral constant), resolveCategoryThemeKey() (src/lib/editorial/category-theme.ts), src/app/globals.css (token source of truth), D1: Tokens as CSS variables in @theme, no JS token file, D2: Category theme via data-cat-theme, not dynamic Tailwind classes, D6: Explicit removal of dark mode, category-theme-system spec (archived), Purpose (+2 more)

### Community 44 - "Accessibility Foundation (capability)"
Cohesion: 0.15
Nodes (18): Accessibility Foundation (capability), Accessible Name on Icon-only Controls (AC-A11Y-002), Required Alt Text on ResponsiveMedia (AC-A11Y-004), Correct Heading Hierarchy (AC-A11Y-005), Keyboard Navigation on Critical Controls (AC-A11Y-001), Motion Respects prefers-reduced-motion (AC-A11Y-008), 44px Minimum Touch Targets (AC-A11Y-007), Visible Focus State (AC-A11Y-003) (+10 more)

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
Cohesion: 0.17
Nodes (12): D7: Fonts via next/font/google, no font management library, typography-system spec (archived), ADDED Requirements, Purpose, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter (+4 more)

### Community 50 - "Requirements"
Cohesion: 0.12
Nodes (16): Purpose, Requirement: Footer es administrable, Requirement: Header y Footer son presentacionales, Requirement: La ruta raíz no implementa contenido de Home, Requirement: Navegación móvil como Client Component acotado, Requirement: Navigation es administrable y dirige el Header, Requirement: SiteSettings integrado para identidad de marca, Requirements (+8 more)

### Community 51 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Requirements, Scenario: secreto no expuesto al cliente, Scenario: un nuevo clon dispone de la plantilla de entorno, Scenario: variable crítica faltante

### Community 52 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Requirements, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles, Scenario: verificación de estado operativo

### Community 54 - "invalidate.ts"
Cohesion: 0.16
Nodes (19): invalidateArticleSidebar(), InvalidateCategoryArgs, invalidateFooter(), invalidateHome(), invalidateNavigation(), InvalidatePageArgs, InvalidatePostArgs, invalidateSettings() (+11 more)

### Community 55 - "2026-09-09-design-system-shadcn/proposal.md"
Cohesion: 0.14
Nodes (13): bootstrap-technical-foundation (prior phase), Capabilities, editorial-workflow (prior phase), Impact, Modified Capabilities, New Capabilities, payload-cms-core (prior phase), What Changes (+5 more)

### Community 56 - "texture-foundation spec (archived)"
Cohesion: 0.18
Nodes (11): .texture-paper-grain / .texture-newspaper-pattern utilities, texture-foundation spec (archived), ADDED Requirements, Purpose, Requirement: Sin selección arbitraria de textura desde el CMS, Requirement: Textura de papel sutil sobre el canvas, Requirement: Textura de periódico decorativa de baja opacidad, Scenario: Se aplica la textura de papel al canvas (+3 more)

### Community 57 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: Acceso público seguro por defecto, sin escape hatch genérico, Requirement: DAL centraliza toda lectura pública de Payload, Requirement: Filtrado explícito de _status como defensa adicional, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Requirement: Proyección/profundidad evita sobre-consulta, Scenario: El site shell necesita la configuración de navegación (+6 more)

### Community 58 - "ADDED Requirements"
Cohesion: 0.07
Nodes (26): ADDED Requirements, Purpose, Requirement: Accesibilidad de la interfaz de búsqueda, Requirement: `/buscar` no se trata como destino indexable, Requirement: Búsqueda vacía no consulta todo el contenido, Requirement: Comportamiento responsive, Requirement: Estado vacío, Requirement: Ningún contenido en Draft aparece en los resultados públicos (+18 more)

### Community 59 - "Requirements"
Cohesion: 0.08
Nodes (25): Purpose, Requirement: Acceso público seguro por defecto, sin escape hatch genérico, Requirement: Búsqueda pública de contenido por slug, Requirement: DAL centraliza toda lectura pública de Payload, Requirement: Filtrado explícito de _status como defensa adicional, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Requirement: La consulta de detalle de Article es la única que carga contenido completo, Requirement: Proyección/profundidad evita sobre-consulta (+17 more)

### Community 60 - "Requirements"
Cohesion: 0.07
Nodes (27): article-page Specification, Purpose, Requirement: Author Card con datos públicos, sin ruta de autor, Requirement: Composición editorial del Article, Requirement: Related Posts, Requirement: Resolución canónica de `/<category>/<post>`, Requirement: Sharing con URL canónica, Requirement: Tags visuales sin ruta pública (+19 more)

### Community 61 - "ADDED Requirements"
Cohesion: 0.09
Nodes (22): ADDED Requirements, Purpose, Requirement: Ediciones en Draft de contenido ya publicado no contaminan el índice, Requirement: El contenido existente puede reindexarse bajo demanda, Requirement: El índice de búsqueda no se expone como API de datos sin restricciones, Requirement: Ningún servicio de búsqueda externo es necesario en V1, Requirement: Solo Posts y Pages publicados se indexan, Requirement: Solo se sincroniza texto acotado, nunca el documento completo (+14 more)

### Community 62 - "OPSX: Apply command"
Cohesion: 0.40
Nodes (6): OPSX: Apply command, OPSX: Archive command, OPSX: Explore command, OPSX: Propose command, OPSX: Sync command, OPSX: Update command

### Community 63 - "ADDED Requirements"
Cohesion: 0.07
Nodes (26): ADDED Requirements, Purpose, Requirement: Author Card con datos públicos, sin ruta de autor, Requirement: Composición editorial del Article, Requirement: Related Posts, Requirement: Resolución canónica de `/<category>/<post>`, Requirement: Sharing con URL canónica, Requirement: Tags visuales sin ruta pública (+18 more)

### Community 64 - "2026-09-10-public-frontend-core/tasks.md"
Cohesion: 0.14
Nodes (13): 10. Accesibilidad, 11. Documentación, 12. Validación final, 13. Fixes de la ronda de `/opsx:verify` (WARNING → resuelto), 1. Payload Globals, 2. Acceso centralizado a Payload, 3. Data Access Layer, 4. View Models (+5 more)

### Community 65 - "check-environment.sh"
Cohesion: 0.60
Nodes (5): fail(), has(), ok(), check-environment.sh script, warn()

### Community 66 - "article-card.tsx"
Cohesion: 0.14
Nodes (16): cn, ArticleCardProps, ArticleCardVariant, ArticleMetadata(), ArticleMetadataData, ArticleMetadataProps, formatReadingTime(), ResponsiveMedia() (+8 more)

### Community 67 - "D6: publishedAt assignment and restore defense"
Cohesion: 0.40
Nodes (5): D6: publishedAt assignment and restore defense, publishedAt permanece estable (delta), publishedAt se asigna una sola vez (delta), publishedAt permanece estable, publishedAt se asigna una sola vez

### Community 68 - "60 Segundos Noticias — Frontend Architecture (Fase 5-8)"
Cohesion: 0.12
Nodes (15): 60 Segundos Noticias — Frontend Architecture (Fase 5-8), Article/Category/Page Pipeline (Fase 7), Data Access Layer (`src/lib/data/`), Fechas, Flujo general, Fuera de alcance de Fase 8, Home Block Pipeline (Fase 6), Los cuatro roles de la base de datos en desarrollo (+7 more)

### Community 69 - "canonical.ts"
Cohesion: 0.20
Nodes (16): GET(), createHistoricalRedirect(), CreateHistoricalRedirectArgs, RedirectChainDoc, getPageUrl(), getPostUrl(), normalizePath(), mapSearchDocToResult() (+8 more)

### Community 70 - "ADDED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: AuthorSummary excluye campos privados de Users, Requirement: Category theme/icon permanecen controlados en el mapeo, Requirement: Los componentes presentacionales no reciben documentos Payload completos, Requirement: Selección de tamaño de imagen apropiado, Requirement: Solo view models con consumidor real en esta change, Scenario: Se evalúa crear un nuevo view model (+4 more)

### Community 71 - "resolve-root-slug.ts"
Cohesion: 0.24
Nodes (10): ResolvedRootSlug, resolveRootSlug(), ResolveRootSlugOptions, getCategoryBySlug(), getPageBySlug(), GetPageBySlugArgs, LlmsPageEntry, SitemapPageEntry (+2 more)

### Community 73 - "category-icon-map.tsx (CategoryIconKey to Lucide mapping)"
Cohesion: 0.67
Nodes (3): category-icon-keys.ts (framework-neutral constant), category-icon-map.tsx (CategoryIconKey to Lucide mapping), D3: Category icon key to Lucide mapping in dedicated frontend module

### Community 74 - "article-header.tsx"
Cohesion: 0.32
Nodes (6): ArticleHeader(), ArticleHeaderProps, BreadcrumbItem, Breadcrumbs(), BreadcrumbsProps, ArticleDetailData

### Community 90 - "Requirements"
Cohesion: 0.12
Nodes (16): Purpose, Requirement: AuthorSummary excluye campos privados de Users, Requirement: Category theme/icon permanecen controlados en el mapeo, Requirement: Contrato de detalle de Article, Requirement: Los componentes presentacionales no reciben documentos Payload completos, Requirement: Related Posts reutiliza ArticleCardData, Requirement: Selección de tamaño de imagen apropiado, Requirement: Solo view models con consumidor real (+8 more)

### Community 119 - "react"
Cohesion: 0.08
Nodes (27): class-variance-authority, lucide-react, radix-ui, react, ErrorBoundaryProps, Container(), ContainerProps, EditorialIntroSection() (+19 more)

### Community 120 - "mapMediaToMediaData"
Cohesion: 0.17
Nodes (18): formatLongDate(), formatShortDate(), LONG_DATE_FORMATTER, SHORT_DATE_FORMATTER, BreadcrumbItem, NewsArticleInput, OrganizationInput, PublisherInput (+10 more)

### Community 121 - "embed-block.tsx"
Cohesion: 0.11
Nodes (22): react-social-media-embed, ALIGNMENT_CLASSES, EmbedBlockClient(), EmbedBlockClientProps, EmbedBlockView(), EmbedBlockViewProps, EmbedBlockLoader, EmbedLinkCard() (+14 more)

### Community 122 - "Decisions"
Cohesion: 0.11
Nodes (18): Context, D10. Validación de proveedor de video externo: módulo nuevo, sin acoplar a Article, D11. `EditorialIntro`: dos capas de Media independientes, sin nueva query ni nuevo DAL, D12. CTA de `HeroNews`/`Banner`/`EditorialIntro` unificado sobre `linkFields`, no un par de campos de texto plano, D13. Migración del cambio de CTA dividida en dos pasos (aditivo, luego remoción), D1. Ubicación de archivos sigue literalmente el árbol del Master Spec (§75), D2. Resolver como capa propia, separada del DAL, D3. Ubicación de las nuevas funciones del DAL (+10 more)

### Community 123 - "ADDED Requirements"
Cohesion: 0.20
Nodes (9): ADDED Requirements, Purpose, Requirement: Helpers de URL canónica centralizados, Requirement: No implementa las rutas dinámicas correspondientes, Requirement: Resolución de enlaces de Navigation/Footer, Scenario: Se busca la ruta dinámica de artículo, Scenario: Se necesita el enlace de un Post en una tarjeta, Scenario: Un item de Navigation es de tipo category (+1 more)

### Community 124 - "Requirements"
Cohesion: 0.15
Nodes (12): Purpose, Requirement: Helpers de URL canónica centralizados, Requirement: No implementa las rutas dinámicas correspondientes, Requirement: Origen de sitio canónico centralizado, Requirement: Resolución de enlaces de Navigation/Footer, Requirements, Scenario: El origen del sitio falta o es inválido en producción, Scenario: Se busca la ruta dinámica de artículo (+4 more)

### Community 125 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): Health Check — spec.md, ADDED Requirements, Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles (+1 more)

### Community 126 - "Requirements"
Cohesion: 0.09
Nodes (22): article-content-rendering Specification, Purpose, Requirement: Bloque no reconocido no rompe la página, Requirement: EmbedBlock con providers controlados, Requirement: GalleryBlock, Requirement: ImageBlock, Requirement: QuoteBlock y CalloutBlock, Requirement: Renderizado seguro de Lexical (+14 more)

### Community 127 - "environment-validation capability"
Cohesion: 0.20
Nodes (11): environment-validation capability, Environment Validation (bootstrap) — spec.md, ADDED Requirements, Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Scenario: secreto no expuesto al cliente (+3 more)

### Community 128 - "references.ts"
Cohesion: 0.20
Nodes (18): invalidatePage(), invalidatePost(), blockReferencesPost(), extractId(), HomeBlock, LinkLike, linksReferenceCategory(), linksReferencePage() (+10 more)

### Community 129 - "Decisions"
Cohesion: 0.14
Nodes (14): Bootstrap Technical Foundation — design.md, Context, D1. Baseline de versiones fijado explícitamente, D2. Alcance de Docker: dev ahora, hardening en Phase 10, D3. Validación de entorno con Zod, fallo temprano, D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía, D5. `payload-types.ts` como efecto natural, no como entregable, D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario (+6 more)

### Community 130 - "Home.ts"
Cohesion: 0.12
Nodes (16): buildPreviewUrl(), generateHomePreviewURL(), generatePagePreviewURL(), generatePostPreviewURL(), CategoryExplorer, EditorialIntro, FeaturedPosts, HeroNews (+8 more)

### Community 131 - "buscar/page.tsx"
Cohesion: 0.19
Nodes (10): buildResultHref(), BuscarPage(), BuscarPageProps, Pagination(), PaginationProps, SearchForm(), SearchFormProps, searchContent() (+2 more)

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
Cohesion: 0.14
Nodes (26): CategoryCardData, getPostsByCategory(), ExternalVideo, ExternalVideoProvider, extractVimeoId(), extractYoutubeId(), resolveExternalVideoUrl(), VIMEO_HOSTS (+18 more)

### Community 138 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Purpose, Requirement: Bloque no reconocido no rompe la página, Requirement: EmbedBlock con providers controlados, Requirement: GalleryBlock, Requirement: ImageBlock, Requirement: QuoteBlock y CalloutBlock, Requirement: Renderizado seguro de Lexical (+13 more)

### Community 139 - "ADDED Requirements"
Cohesion: 0.20
Nodes (10): ADDED Requirements, Requirement: Constantes de Payload permanecen framework-neutral, Requirement: Contraste explícito por tema, Requirement: Mapeo de category theme mediante atributo de datos, Requirement: Solo keys controladas, sin color arbitrario del CMS, Scenario: Se audita el código por clases Tailwind dinámicas de categoría, Scenario: Se inspecciona category-theme-keys.ts tras el cambio, Scenario: Se usa el theme yellow (+2 more)

### Community 140 - "Button (shadcn primitive, re-themed)"
Cohesion: 0.14
Nodes (15): Button (shadcn primitive, re-themed), Pagination component, D5: Incremental shadcn primitive installation, shadcn-primitives capability, shadcn-primitives spec (archived), ADDED Requirements, Purpose, Requirement: Instalación incremental, no masiva (+7 more)

### Community 141 - "Decisions"
Cohesion: 0.15
Nodes (12): Context, D1: Tokens como variables CSS en `@theme`, sin archivo de tokens en JS, D2: Category theme via `data-cat-theme`, no clases Tailwind dinámicas, D3: Mapeo de category icon key → Lucide en un módulo frontend dedicado, D4: `ArticleCard` contra un contrato `ArticleCardData`, no contra `Post`, D5: Instalación incremental de primitivos shadcn, D6: Eliminación explícita del modo oscuro, D7: Fuentes vía `next/font/google`, sin librería de gestión de fuentes (+4 more)

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

### Community 146 - "ADDED Requirements"
Cohesion: 0.09
Nodes (21): ADDED Requirements, Purpose, Requirement: Aplanado de cadenas de redirect, Requirement: Generación automática por cambio de Category, Requirement: Generación automática por cambio de Page, Requirement: Generación automática por cambio de Post, Requirement: Lookup interno acotado, fuera del boundary público del DAL, Requirement: Prevención de auto-redirect y ciclos (+13 more)

### Community 147 - "Requirements"
Cohesion: 0.09
Nodes (21): Purpose, Requirement: Aplanado de cadenas de redirect, Requirement: Generación automática por cambio de Category, Requirement: Generación automática por cambio de Page, Requirement: Generación automática por cambio de Post, Requirement: Lookup interno acotado, fuera del boundary público del DAL, Requirement: Prevención de auto-redirect y ciclos, Requirement: Resolución de redirect solo tras un miss de ruta válida (+13 more)

### Community 148 - "Requirements"
Cohesion: 0.12
Nodes (15): Purpose, Requirement: Home administrable exclusivamente por Admin, Requirement: Home publicado refleja exactamente el orden guardado, Requirement: Home restringe layout a bloques predefinidos, sin CSS/HTML arbitrario, Requirement: Home soporta versionado sin exponer estado no publicado públicamente, Requirement: Lectura pública de Home, Requirement: SEO override opcional en Home, Requirements (+7 more)

### Community 149 - "ADDED Requirements"
Cohesion: 0.10
Nodes (20): ADDED Requirements, Purpose, Requirement: Endpoint público de llms.txt, Requirement: Estructura llms.txt v2, Requirement: Listado de Posts recientes acotado, Requirement: Revalidación ante cambios de contenido representado, Requirement: Sin alternativas Markdown de página completa, Requirement: Solo contenido publicado (+12 more)

### Community 150 - "ADDED Requirements"
Cohesion: 0.18
Nodes (10): ADDED Requirements, Purpose, Requirement: Bloque desconocido o malformado no rompe la página, Requirement: Home mantiene un único encabezado H1 principal, Requirement: Home sin bloques configurados degrada de forma segura, Requirement: Renderizado exhaustivo de los tipos de bloque soportados, Scenario: Admin reordena HeroNews fuera de la primera posición, Scenario: Home con los 8 tipos de bloque configurados (+2 more)

### Community 151 - "Requirements"
Cohesion: 0.18
Nodes (10): Purpose, Requirement: Bloque desconocido o malformado no rompe la página, Requirement: Home mantiene un único encabezado H1 principal, Requirement: Home sin bloques configurados degrada de forma segura, Requirement: Renderizado exhaustivo de los tipos de bloque soportados, Requirements, Scenario: Admin reordena HeroNews fuera de la primera posición, Scenario: Home con los 8 tipos de bloque configurados (+2 more)

### Community 152 - "payload.config.ts"
Cohesion: 0.09
Nodes (23): GET, OPTIONS, POST, DELETE, GET, OPTIONS, PATCH, POST (+15 more)

### Community 153 - "Requirement: seed:initial pobla solo entidades con schema ya implementado"
Cohesion: 0.25
Nodes (7): ADDED Requirements, MODIFIED Requirements, Requirement: seed:dev puede configurar bloques de Home representativos, Requirement: seed:initial pobla solo entidades con schema ya implementado, Scenario: ejecutar seed:initial en esta fase, Scenario: seed:dev configura Home con contenido de desarrollo, Scenario: seed:initial no sobrescribe una Home ya configurada por un administrador

### Community 154 - "video-block.tsx"
Cohesion: 0.24
Nodes (8): @vidstack/react, VideoBlockView(), VideoBlockViewProps, VideoPlayer(), VideoPlayerProps, VideoSection(), VideoSectionProps, VideoBlock

### Community 155 - "2026-09-10-dynamic-home-builder/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 156 - "Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL, Scenario: El site shell necesita la configuración de navegación, Scenario: La página de inicio necesita el layout de Home, Scenario: Se busca el Global Home

### Community 157 - "lexical-renderer.tsx"
Cohesion: 0.12
Nodes (16): CalloutBlockView(), CalloutBlockViewProps, VARIANT_STYLES, ImageBlockView(), ImageBlockViewProps, SIZE_CLASSES, QuoteBlockView(), QuoteBlockViewProps (+8 more)

### Community 158 - "site-search/tasks.md"
Cohesion: 0.18
Nodes (10): 10. Entrada de búsqueda en Header/MobileNav (refinamiento de UX aprobado post-implementación), 1. Extracción de texto buscable, 2. Configuración del Payload Search Plugin, 3. Migración, 4. Indexación inicial, 5. DAL y view model público, 6. Ruta pública `/buscar`, 7. Accesibilidad y responsive (+2 more)

### Community 159 - "Requirements"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: Endpoint público de llms.txt, Requirement: Estructura llms.txt v2, Requirement: Listado de Posts recientes acotado, Requirement: Revalidación ante cambios de contenido representado, Requirement: Sin alternativas Markdown de página completa, Requirement: Solo contenido publicado, Requirement: Terminología sin promesas de posicionamiento (+12 more)

### Community 160 - "page-block-renderer.tsx"
Cohesion: 0.12
Nodes (15): GalleryBlockView(), GalleryBlockViewProps, CTASection(), CTASectionProps, GallerySection(), GallerySectionProps, ImageTextSection(), ImageTextSectionProps (+7 more)

### Community 161 - "Requirements"
Cohesion: 0.11
Nodes (18): page-content-rendering Specification, Purpose, Requirement: Banner de Page reutiliza el componente ya compartido, Requirement: Bloque no reconocido no rompe la página, Requirement: FAQ accesible, Requirement: Gallery y Video de Page reutilizan la infraestructura de Article, Requirement: Page en draft nunca se renderiza públicamente, Requirement: Renderizado de los 8 Page Blocks (+10 more)

### Community 162 - "ADDED Requirements"
Cohesion: 0.11
Nodes (17): ADDED Requirements, Purpose, Requirement: Banner de Page reutiliza el componente ya compartido, Requirement: Bloque no reconocido no rompe la página, Requirement: FAQ accesible, Requirement: Gallery y Video de Page reutilizan la infraestructura de Article, Requirement: Page en draft nunca se renderiza públicamente, Requirement: Renderizado de los 8 Page Blocks (+9 more)

### Community 163 - "ADDED Requirements"
Cohesion: 0.10
Nodes (19): ADDED Requirements, Purpose, Requirement: Cache pública con invalidación por tags de dependencia, Requirement: Draft Mode nunca sirve ni contamina cache pública, Requirement: Fallo de invalidación no corrompe una publicación, Requirement: Invalidación de Home, Requirement: Invalidación específica de Navigation/Footer/SiteSettings/ArticleSidebar, Requirement: Invalidación por cambio de Category (+11 more)

### Community 164 - "faq-section.tsx"
Cohesion: 0.33
Nodes (7): FAQSection(), FAQSectionProps, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), FAQBlock

### Community 165 - "Requirements"
Cohesion: 0.10
Nodes (19): Purpose, Requirement: Cache pública con invalidación por tags de dependencia, Requirement: Draft Mode nunca sirve ni contamina cache pública, Requirement: Fallo de invalidación no corrompe una publicación, Requirement: Invalidación de Home, Requirement: Invalidación específica de Navigation/Footer/SiteSettings/ArticleSidebar, Requirement: Invalidación por cambio de Category, Requirement: Invalidación por publicación/actualización de Post (+11 more)

### Community 166 - "Requirement: Modos de selección de posts"
Cohesion: 0.12
Nodes (16): article-sidebar Specification, Purpose, Requirement: Control global vía Payload Global, Requirement: El post actual nunca aparece en su propio aside, Requirement: Layout de 2 columnas sticky, mobile-first, Requirement: Modos de selección de posts, Requirements, Scenario: Aside deshabilitado o sin posts (+8 more)

### Community 167 - "Requirements"
Cohesion: 0.12
Nodes (16): category-page Specification, Purpose, Requirement: Composición visual de la Category Page, Requirement: Membership inclusivo del listado, Requirement: Paginación server-side, Requirement: Un único H1 en la Category Page, Requirements, Scenario: Category con descripción configurada (+8 more)

### Community 168 - "ADDED Requirements"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Purpose, Requirement: Control global vía Payload Global, Requirement: El post actual nunca aparece en su propio aside, Requirement: Layout de 2 columnas sticky, mobile-first, Requirement: Modos de selección de posts, Scenario: Aside deshabilitado o sin posts, Scenario: Cambio de configuración afecta todos los Articles (+7 more)

### Community 169 - "author-card.tsx"
Cohesion: 0.18
Nodes (12): AuthorCard(), AuthorCardProps, PLATFORM_ICONS, ShareActions(), ShareActionsProps, FacebookLogo(), IconProps, InstagramLogo() (+4 more)

### Community 170 - "ADDED Requirements"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Purpose, Requirement: Composición visual de la Category Page, Requirement: Membership inclusivo del listado, Requirement: Paginación server-side, Requirement: Un único H1 en la Category Page, Scenario: Category con descripción configurada, Scenario: Category sin descripción (+7 more)

### Community 171 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): ADDED Requirements, Purpose, Requirement: Autorización de Preview delegada al control de acceso existente, Requirement: Categories sin flujo de Preview, Requirement: Destino de Preview derivado del documento, nunca de la URL de la solicitud, Requirement: Draft Mode no sirve ni contamina cache pública, Requirement: Entrada de Preview protegida por secreto, Requirement: Habilitación y salida de Draft Mode (+8 more)

### Community 172 - "llms-txt.ts"
Cohesion: 0.42
Nodes (7): GET(), getPublishedPagesForLlms(), getPublishedPostsForLlms(), buildLlmsTxtContent(), escapeMarkdownInline(), formatLink(), getLlmsTxtContent

### Community 173 - "Requirements"
Cohesion: 0.12
Nodes (15): Purpose, Requirement: 404 con identidad de marca, Requirement: Error boundary con identidad de marca para fallas inesperadas, Requirement: Resolución de `/<slug>`, Requirement: Rutas reservadas no colisionan con `/<slug>`, Requirements, root-content-routing Specification, Scenario: Contenido en draft accedido públicamente (+7 more)

### Community 174 - "ADDED Requirements"
Cohesion: 0.13
Nodes (14): ADDED Requirements, Purpose, Requirement: 404 con identidad de marca, Requirement: Error boundary con identidad de marca para fallas inesperadas, Requirement: Resolución de `/<slug>`, Requirement: Rutas reservadas no colisionan con `/<slug>`, Scenario: Contenido en draft accedido públicamente, Scenario: Contenido inexistente no activa el error boundary (+6 more)

### Community 175 - "posts.ts"
Cohesion: 0.14
Nodes (22): getSitemapEntries, sitemap(), getArticleSidebarPosts(), GetArticleSidebarPostsArgs, MODE_LABELS, getAllCategories(), getCategoriesForNavigation(), getPublishedPagesForSitemap() (+14 more)

### Community 176 - "(frontend)/layout.tsx"
Cohesion: 0.14
Nodes (21): server-only, inter, oswald, FrontendLayout(), metadata, PageBlockRenderer(), DraftModeBanner(), CACHE_TAGS (+13 more)

### Community 177 - "2026-09-11-category-article-pages/tasks.md"
Cohesion: 0.14
Nodes (13): 10. Graphify, 11. Validación estática y de build, 12. Verificación end-to-end (datos reales), 13. Article Sidebar (post-implementación, tras revisión manual), 1. CTA Page Block — migración a `linkFields` (prerequisito), 2. Root slug resolver y boundaries públicos, 3. Data Access Layer nuevo, 4. View models nuevos (+5 more)

### Community 178 - "2026-09-11-preview-seo-cache-redirects/tasks.md"
Cohesion: 0.12
Nodes (16): 10. Preview / Draft Mode, 11. `/llms.txt`, 12. Actualización narrow del Master Spec, 13. Documentación, 14. Graphify, 15. Validación estática y de build, 16. Verificación end-to-end (datos reales), 1. Origen de sitio canónico (+8 more)

### Community 179 - "draft-documents.ts"
Cohesion: 0.22
Nodes (12): ActiveRedirect, getPayload(), canViewDraftRevision(), extractUserId(), PreviewUser, currentPreviewUser(), findDraftHome(), findDraftPostBySlug() (+4 more)

### Community 180 - "60 Segundos Noticias — Preview, SEO, Cache y Redirects (Fase 8)"
Cohesion: 0.17
Nodes (11): 60 Segundos Noticias — Preview, SEO, Cache y Redirects (Fase 8), Cache y revalidación, `/llms.txt`, Matriz de invalidación, Metadata (`src/lib/seo/metadata.ts`), Origen canónico, Preview / Draft Mode, Redirects (+3 more)

### Community 181 - "Requirement: Búsqueda pública de contenido por slug"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Requirement: Búsqueda pública de contenido por slug, Requirement: La consulta de detalle de Article es la única que carga contenido completo, Requirement: Related Posts vía DAL, Scenario: Auditoría de consultas de listado, Scenario: Auditoría de la consulta de detalle, Scenario: Page en draft por slug, Scenario: Page publicada por slug (+3 more)

### Community 182 - "Requirements"
Cohesion: 0.10
Nodes (20): Purpose, Requirement: Autorización de Preview delegada al control de acceso existente, Requirement: Categories sin flujo de Preview, Requirement: Destino de Preview derivado del documento, nunca de la URL de la solicitud, Requirement: Draft Mode no sirve ni contamina cache pública, Requirement: Entrada de Preview protegida por secreto, Requirement: Habilitación y salida de Draft Mode, Requirement: Indicador visible de Draft Mode (+12 more)

### Community 183 - "ADDED Requirements"
Cohesion: 0.12
Nodes (15): ADDED Requirements, Purpose, Requirement: Cadena de fallback de metadata, Requirement: Metadata de Category con fallback definido, Requirement: Metadata de Home, Requirement: Origen único para toda URL absoluta de metadata, Requirement: Sin doble consulta entre metadata y render, Scenario: Article accedido por una categoría adicional nunca genera un canonical alterno (+7 more)

### Community 184 - "2026-09-13-add-draft-mode-banner/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 185 - "2026-09-11-category-article-pages/design.md"
Cohesion: 0.29
Nodes (6): Context, Decisions, Goals / Non-Goals, Migration Plan, Open Questions, Risks / Trade-offs

### Community 186 - "2026-09-11-category-article-pages/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 187 - "Requirements"
Cohesion: 0.12
Nodes (15): Purpose, Requirement: Cadena de fallback de metadata, Requirement: Metadata de Category con fallback definido, Requirement: Metadata de Home, Requirement: Origen único para toda URL absoluta de metadata, Requirement: Sin doble consulta entre metadata y render, Requirements, Scenario: Article accedido por una categoría adicional nunca genera un canonical alterno (+7 more)

### Community 188 - "ADDED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, Purpose, Requirement: Contenido del sitemap, Requirement: Política neutral respecto a crawlers de IA, Requirement: robots por entorno, Requirement: robots.txt no sustituye control de acceso, Scenario: Entorno de producción, Scenario: Entorno de staging/pruebas (+4 more)

### Community 189 - "ADDED Requirements"
Cohesion: 0.33
Nodes (5): ADDED Requirements, Requirement: Contrato de detalle de Article, Requirement: Related Posts reutiliza ArticleCardData, Scenario: Se renderiza la sección de Related Posts, Scenario: Se renderiza un Article real

### Community 190 - "Requirement: CTA"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: CTA, Scenario: CTA con enlace, Scenario: Migración de datos existentes

### Community 191 - "Requirements"
Cohesion: 0.15
Nodes (12): Purpose, Requirement: Contenido del sitemap, Requirement: Política neutral respecto a crawlers de IA, Requirement: robots por entorno, Requirement: robots.txt no sustituye control de acceso, Requirements, Scenario: Entorno de producción, Scenario: Entorno de staging/pruebas (+4 more)

### Community 192 - "ADDED Requirements"
Cohesion: 0.17
Nodes (11): ADDED Requirements, Purpose, Requirement: Autor en JSON-LD limitado al allowlist público existente, Requirement: JSON-LD por tipo de página, Requirement: Publisher/Organization centralizado, Requirement: Serialización segura de JSON-LD, Scenario: Se audita el JSON-LD de dos páginas distintas, Scenario: Se audita el JSON-LD de un Article con autor (+3 more)

### Community 193 - "Requirements"
Cohesion: 0.17
Nodes (11): Purpose, Requirement: Autor en JSON-LD limitado al allowlist público existente, Requirement: JSON-LD por tipo de página, Requirement: Publisher/Organization centralizado, Requirement: Serialización segura de JSON-LD, Requirements, Scenario: Se audita el JSON-LD de dos páginas distintas, Scenario: Se audita el JSON-LD de un Article con autor (+3 more)

### Community 195 - "2026-09-11-preview-seo-cache-redirects/design.md"
Cohesion: 0.29
Nodes (6): Context, Decisions, Goals / Non-Goals, Migration Plan, Open Questions, Risks / Trade-offs

### Community 196 - "2026-09-11-preview-seo-cache-redirects/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 197 - "Requirement: Origen de sitio canónico centralizado"
Cohesion: 0.40
Nodes (4): ADDED Requirements, Requirement: Origen de sitio canónico centralizado, Scenario: El origen del sitio falta o es inválido en producción, Scenario: Se necesita la URL absoluta de un Article para compartir

### Community 198 - "site-search/design.md"
Cohesion: 0.29
Nodes (6): Context, Decisions, Goals / Non-Goals, Migration Plan, Open Questions, Risks / Trade-offs

### Community 199 - "site-search/proposal.md"
Cohesion: 0.29
Nodes (6): Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 201 - "2026-09-13-add-draft-mode-banner/design.md"
Cohesion: 0.33
Nodes (5): Context, Decisions, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 202 - "Design Tokens (capability)"
Cohesion: 0.25
Nodes (8): Design Tokens (capability), src/app/globals.css, No Dark Mode in V1, Restricted Radius/Shadow Scale, Incremental, Not Mass Installation, No Inherited Dark Mode in Primitives, shadcn/ui as Sole Primitive Base, shadcn Primitives Policy (capability)

### Community 203 - "Requirement: Indicador visible de Draft Mode"
Cohesion: 0.33
Nodes (5): ADDED Requirements, Requirement: Indicador visible de Draft Mode, Scenario: Página pública con Draft Mode deshabilitado, Scenario: Página pública con Draft Mode habilitado, Scenario: Salida desde el indicador

### Community 204 - "2026-09-13-add-draft-mode-banner/tasks.md"
Cohesion: 0.40
Nodes (4): 1. Componente del indicador, 2. Integración en el layout público, 3. Accesibilidad, 4. Validación y documentación

### Community 206 - "Texture Foundation (capability)"
Cohesion: 0.40
Nodes (5): Paper/Off-white Main Background (--paper), newspaper-pattern.webp Utility, paper-grain.webp Utility, No Arbitrary CMS Texture Selection, Texture Foundation (capability)

### Community 207 - "60 Segundos Noticias — Search (Fase 9)"
Cohesion: 0.17
Nodes (11): 60 Segundos Noticias — Search (Fase 9), Acceso de la Collection `search`, Arquitectura, Cache, Collections indexadas, Extracción de texto buscable (`beforeSync`), Forma del documento de Search, Política de Drafts (+3 more)

### Community 209 - "payload.ts"
Cohesion: 0.40
Nodes (3): zod, payloadEnv, payloadEnvSchema

## Ambiguous Edges - Review These
- `Motion Respects prefers-reduced-motion (AC-A11Y-008)` → `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`  [AMBIGUOUS]
  openspec/specs/accessibility-foundation/spec.md · relation: conceptually_related_to

## Knowledge Gaps
- **1293 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1288 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1381 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Motion Respects prefers-reduced-motion (AC-A11Y-008)` and `Brand/Semantic Color Tokens (brand-red, ink, paper, border, success/warning/error/info)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Category Theme System (capability)` connect `Editorial Components (capability)` to `category-badge.tsx`, `2026-09-09-design-system-shadcn/tasks.md`, `category-theme-system spec (archived)`, `2026-09-09-design-system-shadcn/proposal.md`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `payload` connect `payload` to `references.ts`, `Home.ts`, `canonical.ts`, `package.json`, `build-search-doc.ts`, `(payload)/layout.tsx`, `posts.ts`, `(frontend)/layout.tsx`, `draft-documents.ts`, `category-badge.tsx`, `invalidate.ts`, `payload.config.ts`, `Categories.ts`, `Posts.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `payload.config.ts`, `package.json`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1293 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Editorial Workflow Change Proposal` be split into smaller, more focused modules?**
  _Cohesion score 0.06585365853658537 - nodes in this community are weakly interconnected._