# Graph Report - 60segundosnoticias  (2026-09-09)

## Corpus Check
- 170 files · ~108,600 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 902 nodes · 1134 edges · 105 communities (54 shown, 50 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `645ca360`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Editorial Components capability
- payload-types.ts
- article-card.tsx
- Editorial Workflow Change Proposal
- Payload CMS Core Tasks
- Payload CMS Core — proposal.md
- components.json
- package.json
- compilerOptions
- ADDED Requirements
- dependencies
- (payload)/layout.tsx
- ADDED Requirements
- env/index.ts
- payload.config.ts
- payload
- ADDED Requirements
- Requirements
- shadcn Primitives policy
- 60 Segundos Noticias — Master Specification
- ADDED Requirements
- Requirements
- roles.ts
- Pages.ts
- ADDED Requirements
- Posts.ts
- ADDED Requirements
- ADDED Requirements
- devDependencies
- scripts
- AGENTS.md — Agent Instructions
- Bootstrap Technical Foundation — proposal.md
- 60 Segundos Noticias — Design System (Fase 4)
- ADDED Requirements
- design-system-shadcn tasks.md
- button.tsx
- Categories.ts
- Bootstrap Technical Foundation — tasks.md
- Decisions
- ADDED Requirements
- Requirements
- Requirements
- @payloadcms/db-postgres
- reading-time.ts
- design-system-shadcn proposal.md
- Decisions
- compose.yaml
- [...slug]/route.ts
- OPSX: Apply command
- design-system-shadcn design.md
- check-environment.sh
- Bootstrap Technical Foundation — design.md
- D6: publishedAt assignment and restore defense
- breadcrumbs.tsx
- Tags.ts
- eslint.config.mjs
- postcss.config.mjs
- enforce-uploader.ts
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
- engines
- pnpm
- Config
- CATEGORY_THEME_KEYS (10 category theme keys)
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
2. `60 Segundos Noticias — Master Specification` - 21 edges
3. `compilerOptions` - 17 edges
4. `Payload CMS Core Tasks` - 17 edges
5. `Payload CMS Core — proposal.md` - 16 edges
6. `design-system-shadcn proposal.md` - 16 edges
7. `design-system-shadcn tasks.md` - 15 edges
8. `Bootstrap Technical Foundation — proposal.md` - 13 edges
9. `scripts` - 12 edges
10. `Bootstrap Technical Foundation — tasks.md` - 11 edges

## Surprising Connections (you probably didn't know these)
- `components.json (shadcn CLI config)` --references--> `Button()`  [EXTRACTED]
  openspec/changes/design-system-shadcn/design.md → src/components/ui/button.tsx
- `resolveCategoryThemeKey()` --references--> `CATEGORY_THEME_KEYS (src/lib/constants/category-theme-keys.ts)`  [EXTRACTED]
  src/lib/editorial/category-theme.ts → docs/DESIGN-SYSTEM.md
- `.claude/CLAUDE.md (graphify trigger)` --semantically_similar_to--> `CLAUDE.md — Claude Code Project Instructions`  [INFERRED] [semantically similar]
  .claude/CLAUDE.md → CLAUDE.md
- `Button (shadcn primitive, retheemed)` --implements--> `Button()`  [EXTRACTED]
  openspec/changes/design-system-shadcn/specs/shadcn-primitives/spec.md → src/components/ui/button.tsx
- `Editorial Components capability` --implements--> `Presentational components do not query Payload directly (rule)`  [INFERRED]
  openspec/changes/design-system-shadcn/specs/editorial-components/spec.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OPSX experimental 'actions on a change' command set** — claude_commands_opsx_apply_command, claude_commands_opsx_archive_command, claude_commands_opsx_explore_command, claude_commands_opsx_propose_command, claude_commands_opsx_sync_command, claude_commands_opsx_update_command [EXTRACTED 0.95]
- **Posts beforeChange hook order: enforceAuthor -> publishValidation -> computeReadingTime** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d3_hook_order_beforechange, openspec_changes_archive_2026_09_09_editorial_workflow_design_d4_enforceauthor, openspec_changes_archive_2026_09_09_editorial_workflow_design_d5_publishvalidation, openspec_changes_archive_2026_09_09_editorial_workflow_design_d7_computereadingtime [EXTRACTED 1.00]
- **Bootstrap Technical Foundation New Capabilities** — capability_app_bootstrap, capability_environment_validation, capability_health_check, capability_local_docker_environment [EXTRACTED 1.00]
- **beforeDelete reference-check pattern shared by Categories and Users (D9)** — openspec_changes_archive_2026_09_09_editorial_workflow_design_d9_deletion_protection_categories_users, openspec_specs_categories_collection_spec_eliminacion_de_categories_bloqueada_mientras_existan_posts_que_las_referencian, openspec_specs_users_collection_spec_eliminacion_de_users_bloqueada_mientras_existan_posts_que_los_referencian [EXTRACTED 1.00]
- **Phase 4 Design System capabilities (design-system-shadcn change)** — concept_design_tokens, concept_typography_system, concept_layout_primitives, concept_category_theme_system, concept_texture_foundation, concept_shadcn_primitives, concept_editorial_components, concept_accessibility_foundation, openspec_changes_design_system_shadcn_proposal_doc [EXTRACTED 1.00]
- **Presentational editorial component set (no Payload access)** — concept_articlecard, concept_categorybadge, concept_categorycard, concept_articlemetadata, concept_sectionheader, concept_breadcrumbs, concept_pagination, concept_responsivemedia, concept_presentational_components_rule [EXTRACTED 1.00]
- **OPSX Experimental Artifact Workflow Commands** — claude_commands_opsx_new, claude_commands_opsx_continue, claude_commands_opsx_ff, claude_commands_opsx_verify [EXTRACTED 1.00]
- **Payload CMS Core V1 Collections** — capability_users_collection, capability_media_collection, capability_categories_collection, capability_tags_collection, capability_posts_collection, capability_pages_collection, capability_redirects_collection [EXTRACTED 1.00]
- **Local Development Infrastructure Bootstrap** — openspec_specs_app_bootstrap_spec_appbootstrapspec, openspec_specs_environment_validation_spec_environmentvalidationspec, openspec_specs_health_check_spec_healthcheckspec, openspec_specs_local_docker_environment_spec_localdockerenvironmentspec [INFERRED 0.80]
- **Server always overrides client-submitted value (author, publishedAt, readingTimeMinutes)** — openspec_specs_post_ownership_spec_writer_no_puede_reasignar_el_autor, openspec_specs_publishing_workflow_spec_publishedat_permanece_estable, openspec_specs_reading_time_spec_readingtimeminutes_no_es_editable_manualmente [INFERRED 0.80]
- **Category theme contrast verification (AC-A11Y-006)** — concept_category_theme_keys, concept_category_theme_system, concept_accessibility_foundation, docs_design_system_doc [INFERRED 0.85]
- **Controlled Content Block System (Payload-managed, no arbitrary HTML/CSS)** — openspec_specs_article_content_blocks_spec_articlecontentblocksspec, openspec_specs_page_blocks_spec_pageblocksspec, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages [INFERRED 0.85]
- **Payload CMS Core Collections** — openspec_specs_tags_collection_spec_tags, openspec_specs_posts_collection_spec_posts, openspec_specs_pages_collection_spec_pages, openspec_specs_redirects_collection_spec_redirects [INFERRED 0.85]
- **Documents independently restating the Master Spec > OpenSpec > implementation > tooling priority order** — docs_60_segundos_spec_doc, concept_source_of_truth_priority [INFERRED 0.85]

## Communities (105 total, 50 thin omitted)

### Community 0 - "Editorial Components capability"
Cohesion: 0.05
Nodes (46): Accessibility Foundation capability, ArticleCard component, ArticleCardData contract, ArticleMetadata component, Breadcrumbs component, Button (shadcn primitive, retheemed), Category icon keys (6 keys), Category Theme System capability (+38 more)

### Community 1 - "payload-types.ts"
Cohesion: 0.04
Nodes (45): Auth, BannerBlock, BannerBlockSelect, CalloutBlock, CategoriesSelect, Category, CollectionsWidget, CTABlock (+37 more)

### Community 2 - "article-card.tsx"
Cohesion: 0.08
Nodes (31): react, ArticleCardData, ArticleCardProps, ArticleCardVariant, ArticleMetadata(), ArticleMetadataData, ArticleMetadataProps, formatReadingTime() (+23 more)

### Community 3 - "Editorial Workflow Change Proposal"
Cohesion: 0.07
Nodes (41): Editorial Workflow Change Metadata, D10: Media/Tag deletion behavior verification, D11: Seeds via payload run, D12: Hooks directory layout, D1: isOwnerOrAdmin access function, D2: Posts.access.read query-constraint, D3: beforeChange hook order (enforceAuthor -> publishValidation -> computeReadingTime), D4: enforceAuthor hook (+33 more)

### Community 4 - "Payload CMS Core Tasks"
Cohesion: 0.09
Nodes (30): Page Blocks Spec (Archived Change), Pages Collection Spec (Archived Change), Reserved Slugs Constant (Archived Change), Slug Namespace Integrity Spec (Archived Change), Payload CLI Module Resolution Fix, src/lib/env/payload.ts Module, ESM Required for Payload CLI Load (ERR_REQUIRE_ASYNC_MODULE fix), Initial PostgreSQL Migration (+22 more)

### Community 5 - "Payload CMS Core — proposal.md"
Cohesion: 0.08
Nodes (29): article-content-blocks capability, categories-collection capability, cms-access-control capability, environment-validation capability, media-collection capability, page-blocks capability, pages-collection capability, posts-collection capability (+21 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "package.json"
Cohesion: 0.10
Nodes (20): name, private, type, version, eslint, graphql, @payloadcms/next, postcss (+12 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 9 - "ADDED Requirements"
Cohesion: 0.11
Nodes (19): ADDED Requirements, Spec: accessibility-foundation, Purpose, Requirement: Accessible name en controles solo-icono, Requirement: Alt apropiado en imágenes editoriales, Requirement: Contraste apropiado en category themes, Requirement: Foco visible, Requirement: Jerarquía de encabezados correcta (+11 more)

### Community 10 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, class-variance-authority, cn, graphql, lucide-react, next, payload, @payloadcms/db-postgres (+11 more)

### Community 11 - "(payload)/layout.tsx"
Cohesion: 0.14
Nodes (6): nextConfig, next, importMap, Args, Args, Args

### Community 12 - "ADDED Requirements"
Cohesion: 0.11
Nodes (18): ADDED Requirements, Spec: editorial-components, Purpose, Requirement: ArticleCard como fundación reutilizable, Requirement: Breadcrumbs y Pagination presentacionales, Requirement: CategoryBadge con variantes controladas, Requirement: CategoryCard muestra icon/name/description/theme autorizado, Requirement: Componentes editoriales son presentacionales (+10 more)

### Community 13 - "env/index.ts"
Cohesion: 0.14
Nodes (11): register(), pg, server-only, zod, checkDatabase(), dynamic, GET(), env (+3 more)

### Community 14 - "payload.config.ts"
Cohesion: 0.13
Nodes (8): GET, OPTIONS, POST, isOwnerOrAdmin(), Media, Pages, Posts, preventDeleteReferenced()

### Community 15 - "payload"
Cohesion: 0.21
Nodes (9): payload, @payloadcms/richtext-lexical, CalloutBlock, EmbedBlock, GalleryBlock, ImageBlock, QuoteBlock, RichText (+1 more)

### Community 16 - "ADDED Requirements"
Cohesion: 0.12
Nodes (16): app-bootstrap capability, App Bootstrap — spec.md, ADDED Requirements, Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto (+8 more)

### Community 17 - "Requirements"
Cohesion: 0.13
Nodes (14): Purpose, Requirement: Build y tipado sin errores, Requirement: Next.js y Payload como una sola aplicación, Requirement: Persistencia de Payload en PostgreSQL, Requirement: Server Components por defecto, Requirement: shadcn/ui como única base de primitivos de UI, Requirement: Sin Collections ni Globals de Payload en esta fase, Requirements (+6 more)

### Community 18 - "shadcn Primitives policy"
Cohesion: 0.14
Nodes (14): components.json (shadcn CLI config), shadcn Primitives policy, ADDED Requirements, Spec: shadcn-primitives, Purpose, Requirement: Instalación incremental, no masiva, Requirement: Primitivos retematizados, no apariencia genérica de shadcn, Requirement: shadcn como única base de primitivos (+6 more)

### Community 19 - "60 Segundos Noticias — Master Specification"
Cohesion: 0.14
Nodes (14): Acceptance Criteria (AC-* normative checklist), Block rendering pipeline (Payload Block → Resolver → View Model → Renderer → Section), Tag-based cache and targeted revalidation, Category color themes and icon keys, Data Access Layer (src/lib/data), 60 Segundos editorial Design System, Docker Compose app+db architecture, Admin/Writer roles and permissions (+6 more)

### Community 20 - "ADDED Requirements"
Cohesion: 0.14
Nodes (14): ADDED Requirements, Spec: design-tokens, Purpose, Requirement: Fondo principal editorial, Requirement: Fuente única de tokens de color, Requirement: Radius y sombras restringidos, Requirement: Rojo como accent principal, Requirement: Sin modo oscuro en V1 (+6 more)

### Community 21 - "Requirements"
Cohesion: 0.14
Nodes (13): Purpose, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Requirements, Scenario: conexión interna usa el nombre del servicio (+5 more)

### Community 22 - "roles.ts"
Cohesion: 0.21
Nodes (8): isAdmin(), isAdminFieldAccess(), isAdminOrWriter(), isLoggedInFieldAccess(), Redirects, Users, socialLinksField, preventDeleteWithPosts()

### Community 23 - "Pages.ts"
Cohesion: 0.22
Nodes (6): VideoBlock, Banner, CTA, FAQ, Hero, ImageText

### Community 24 - "ADDED Requirements"
Cohesion: 0.15
Nodes (13): Container layout primitive, Layout Primitives capability, ADDED Requirements, Spec: layout-primitives, Purpose, Requirement: Anchos legibles de contenido editorial, Requirement: Breakpoints alineados al Master Spec, Requirement: Container con canvas y gutters responsivos (+5 more)

### Community 25 - "Posts.ts"
Cohesion: 0.28
Nodes (9): enforceAuthor(), assignPublishedAt(), hasValue(), publishValidation(), REQUIRED_TO_PUBLISH, resultingStatus(), generateSlugFromTitle(), slugify() (+1 more)

### Community 26 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Requirement: Comunicación interna `app` → `db` por nombre de servicio, Requirement: Desarrollo con Fast Refresh mediante montaje de fuente, Requirement: Healthchecks para ambos servicios, Requirement: Persistencia de datos de PostgreSQL entre reinicios, Requirement: Servicios `app` y `db`, Scenario: conexión interna usa el nombre del servicio, Scenario: eliminación explícita de volúmenes (+4 more)

### Community 27 - "ADDED Requirements"
Cohesion: 0.17
Nodes (12): ADDED Requirements, Spec: category-theme-system, Purpose, Requirement: Constantes de Payload permanecen framework-neutral, Requirement: Contraste explícito por tema, Requirement: Mapeo de category theme mediante atributo de datos, Requirement: Solo keys controladas, sin color arbitrario del CMS, Scenario: Se audita el código por clases Tailwind dinámicas de categoría (+4 more)

### Community 28 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, postcss, sass, tailwindcss, @tailwindcss/postcss, @types/node (+4 more)

### Community 29 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, generate:types, lint, migrate, migrate:create, payload (+4 more)

### Community 30 - "AGENTS.md — Agent Instructions"
Cohesion: 0.25
Nodes (11): AGENTS.md — Agent Instructions, .claude/CLAUDE.md (graphify trigger), CLAUDE.md — Claude Code Project Instructions, Graphify-first navigation rule, Presentational components do not query Payload directly (rule), skills-lock.json roster, Project skills routing/precedence policy, Project AI Skills Registry (+3 more)

### Community 31 - "Bootstrap Technical Foundation — proposal.md"
Cohesion: 0.18
Nodes (11): local-docker-environment capability, Bootstrap Technical Foundation — change config, Bootstrap Technical Foundation — proposal.md, Capabilities, Impact, Modified Capabilities, New Capabilities, What Changes (+3 more)

### Community 32 - "60 Segundos Noticias — Design System (Fase 4)"
Cohesion: 0.18
Nodes (11): 60 Segundos Noticias — Design System (Fase 4), Accesibilidad, Category theme system, Componentes editoriales (`src/components/editorial/`), Contraste verificado (`--cat-accent-fg`), Layout, Motion, shadcn/ui (+3 more)

### Community 33 - "ADDED Requirements"
Cohesion: 0.18
Nodes (11): ADDED Requirements, Spec: typography-system, Purpose, Requirement: Escala tipográfica del Design System, Requirement: Restricción de uppercase, Requirement: Tipografía display usa Oswald, Requirement: Tipografía long-form usa Inter, Scenario: Se define un título de artículo (H1) (+3 more)

### Community 34 - "design-system-shadcn tasks.md"
Cohesion: 0.18
Nodes (11): 10. Validación final, 1. Tokens de color y eliminación de dark mode, 2. Tipografía, 3. Category theme system, 4. Layout primitives, 5. Texturas, 6. Primitivos shadcn, 7. Componentes editoriales presentacionales (+3 more)

### Community 35 - "button.tsx"
Cohesion: 0.24
Nodes (6): class-variance-authority, cn, radix-ui, PaginationProps, Button(), buttonVariants

### Community 36 - "Categories.ts"
Cohesion: 0.27
Nodes (6): isReservedSlug(), RESERVED_SLUGS, Categories, seoFields, createNamespaceSlugValidate(), preventDeleteWithPosts()

### Community 37 - "Bootstrap Technical Foundation — tasks.md"
Cohesion: 0.20
Nodes (9): Bootstrap Technical Foundation — tasks.md, 1. Verificación de versiones y bootstrap del proyecto, 2. Esqueleto de Next.js (App Router), 3. Integración de Payload CMS + PostgreSQL, 4. Tailwind CSS + shadcn/ui, 5. Validación de variables de entorno, 6. Endpoint `/api/health`, 7. Docker Compose para desarrollo (+1 more)

### Community 38 - "Decisions"
Cohesion: 0.22
Nodes (9): D1. Baseline de versiones fijado explícitamente, D2. Alcance de Docker: dev ahora, hardening en Phase 10, D3. Validación de entorno con Zod, fallo temprano, D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía, D5. `payload-types.ts` como efecto natural, no como entregable, D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario, D7. `/api/health` incluye una verificación ligera de PostgreSQL, D8. `node_modules` en un volumen propio dentro del contenedor de desarrollo (+1 more)

### Community 39 - "ADDED Requirements"
Cohesion: 0.22
Nodes (9): Health Check — spec.md, ADDED Requirements, Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles (+1 more)

### Community 40 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Plantilla de variables de entorno versionada, Requirement: Separación entre variables públicas y privadas, Requirement: Validación de variables críticas al arrancar/build, Requirements, Scenario: secreto no expuesto al cliente, Scenario: un nuevo clon dispone de la plantilla de entorno, Scenario: variable crítica faltante

### Community 41 - "Requirements"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Endpoint `/api/health` disponible, Requirement: Sin exposición de información sensible, Requirement: Utilizable como healthcheck de Docker Compose, Requirements, Scenario: healthcheck de Docker Compose consulta el endpoint, Scenario: respuesta sin datos sensibles, Scenario: verificación de estado operativo

### Community 43 - "reading-time.ts"
Cohesion: 0.39
Nodes (7): countWords(), extractFromNode(), extractFromValue(), extractLexicalText(), LexicalNode, TEXT_LIKE_BLOCK_FIELD_KEYS, computeReadingTime()

### Community 44 - "design-system-shadcn proposal.md"
Cohesion: 0.25
Nodes (8): OpenSpec change workflow, Capabilities, design-system-shadcn proposal.md, Impact, Modified Capabilities, New Capabilities, What Changes, Why

### Community 45 - "Decisions"
Cohesion: 0.25
Nodes (8): D1: Tokens como variables CSS en `@theme`, sin archivo de tokens en JS, D2: Category theme via `data-cat-theme`, no clases Tailwind dinámicas, D3: Mapeo de category icon key → Lucide en un módulo frontend dedicado, D4: `ArticleCard` contra un contrato `ArticleCardData`, no contra `Post`, D5: Instalación incremental de primitivos shadcn, D6: Eliminación explícita del modo oscuro, D7: Fuentes vía `next/font/google`, sin librería de gestión de fuentes, Decisions

### Community 46 - "compose.yaml"
Cohesion: 0.52
Nodes (6): health-check capability, Next.js, Payload CMS, PostgreSQL, AI / SDD Workflow, README.md — 60 Segundos Noticias

### Community 47 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 48 - "OPSX: Apply command"
Cohesion: 0.40
Nodes (6): OPSX: Apply command, OPSX: Archive command, OPSX: Explore command, OPSX: Propose command, OPSX: Sync command, OPSX: Update command

### Community 49 - "design-system-shadcn design.md"
Cohesion: 0.33
Nodes (6): .openspec.yaml (design-system-shadcn schema config), Context, design-system-shadcn design.md, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 50 - "check-environment.sh"
Cohesion: 0.60
Nodes (5): fail(), has(), ok(), check-environment.sh script, warn()

### Community 51 - "Bootstrap Technical Foundation — design.md"
Cohesion: 0.40
Nodes (5): Bootstrap Technical Foundation — design.md, Context, Goals / Non-Goals, Migration Plan, Risks / Trade-offs

### Community 52 - "D6: publishedAt assignment and restore defense"
Cohesion: 0.40
Nodes (5): D6: publishedAt assignment and restore defense, publishedAt permanece estable (delta), publishedAt se asigna una sola vez (delta), publishedAt permanece estable, publishedAt se asigna una sola vez

### Community 53 - "breadcrumbs.tsx"
Cohesion: 0.40
Nodes (3): lucide-react, BreadcrumbItem, BreadcrumbsProps

### Community 54 - "Tags.ts"
Cohesion: 0.50
Nodes (3): isLoggedIn(), Tags, slugField()

## Ambiguous Edges - Review These
- `Payload generated Post type (payload-types.ts)` → `D4: ArticleCard against ArticleCardData, not Payload Post`  [AMBIGUOUS]
  openspec/changes/design-system-shadcn/design.md · relation: conceptually_related_to

## Knowledge Gaps
- **440 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+435 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 482 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Payload generated Post type (payload-types.ts)` and `D4: ArticleCard against ArticleCardData, not Payload Post`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `design-system-shadcn proposal.md` connect `design-system-shadcn proposal.md` to `Editorial Components capability`, `design-system-shadcn design.md`, `shadcn Primitives policy`, `60 Segundos Noticias — Master Specification`, `ADDED Requirements`?**
  _High betweenness centrality (0.245) - this node is a cross-community bridge._
- **Why does `Category Theme System capability` connect `Editorial Components capability` to `article-card.tsx`, `ADDED Requirements`, `design-system-shadcn proposal.md`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `60 Segundos Noticias — Master Specification` connect `60 Segundos Noticias — Master Specification` to `compose.yaml`, `design-system-shadcn proposal.md`, `AGENTS.md — Agent Instructions`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _440 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Editorial Components capability` be split into smaller, more focused modules?**
  _Cohesion score 0.05187074829931973 - nodes in this community are weakly interconnected._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._