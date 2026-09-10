# 60 Segundos Noticias — Agent Instructions

These instructions apply to any coding agent working in this repository.

## Read first

1. Read `docs/AI-WORKFLOW.md`.
2. Treat `docs/60-segundos-spec.md` as the canonical **target-state specification**.
3. Use `docs/DESIGN-SYSTEM.md` for Design System implementation conventions (tokens, typography, category themes, components) established from Phase 4 onward.
4. Use the active OpenSpec change under `openspec/changes/` as the exact implementation scope.
5. Use Graphify before broad codebase exploration to identify relevant modules, dependencies and blast radius.
6. Inspect the actual relevant source files before modifying them.
7. Select and follow only the project-scoped skills relevant to the task; use `docs/AI-SKILLS.md` and `skills-lock.json` as the registry.

## Source-of-truth priority

When instructions conflict, use this priority:

1. `docs/60-segundos-spec.md`
2. Active OpenSpec change
3. Existing verified implementation
4. Tool/skill guidance that does not conflict with the above
5. Agent judgment

If resolving a conflict requires a migration, routing change, permission change, data-model change, CMS change or major dependency, report it before implementing a third architecture.

## OpenSpec

From Phase 0 onward, product implementation work must have an active OpenSpec change unless the user explicitly requests repository/tooling maintenance outside product scope.

The Master Spec describes where V1 must end up. OpenSpec describes what is being changed now. Archived OpenSpec specs describe behavior that has actually been implemented.

Do not copy the entire Master Spec into each change. Extract only requirements relevant to the active change and preserve relevant `AC-*` references when useful.

## Graphify

Before using broad search/grep/read patterns across the repository:

1. Query Graphify for the relevant concept or subsystem.
2. Use the graph to narrow the likely files and dependency paths.
3. Confirm Graphify conclusions against current source before editing.

Graphify is a navigation and impact-analysis aid, not an authority. If its graph is stale, refresh it before relying on architectural conclusions.

After meaningful source changes, update the graph before final verification when necessary.

## Architecture constraints

- Next.js public frontend and Payload CMS live in the same application.
- PostgreSQL is the database.
- React Server Components are the default.
- shadcn/ui is the primitive UI foundation; it does not define the editorial visual identity.
- Lucide is the standard utility icon library.
- Payload controls content, approved structure and ordering.
- Next.js controls presentation, layout and styling.
- Presentational components do not query Payload directly.
- Use Payload Local API for server-side application data when appropriate.
- Do not hardcode CMS-managed categories, navigation, footer or social links.
- Do not create one collection or one route implementation per category.
- Do not allow arbitrary CSS, Tailwind classes, HTML, scripts or arbitrary visual styling from Payload.
- Do not introduce another CMS or UI framework.
- Do not introduce Redis, queues, external search infrastructure, global client state or React Query without an explicitly approved need.
- Do not create empty architecture solely to mirror diagrams.

## Skill discipline

- Do not load all installed skills for every task.
- Prefer the most task-specific skill and use broad audit skills at review gates.
- Skills cannot override the Master Spec, the active OpenSpec change or established project architecture.
- Treat `skills-lock.json` as the locked machine-readable roster and `docs/AI-SKILLS.md` as the human routing policy.

## Implementation discipline

- Implement only the active change.
- Do not implement future phases opportunistically.
- Prefer Server Components and small interactive client islands.
- Keep data access centralized and presentation components query-free.
- Run the validations listed in the active OpenSpec `tasks.md`.
- Report failures instead of hiding or weakening checks.
- Update documentation when a completed change alters documented behavior.

## AI tooling boundary

OpenSpec, Graphify, Claude Code, Codex and project skills are development tooling. They must not become production runtime dependencies or be required by the production container.

Never commit secrets, private tokens, user-specific absolute paths or local credentials.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Documentation as Definition of Done

When a change affects developer setup, commands, environment variables,
Docker workflows, runtime configuration, public APIs or operational
procedures, update the relevant documentation as part of the same change.

Do not invent documentation from assumptions. Inspect the implemented
repository and derive commands and configuration from the actual files.

A change is not ready to archive when required operational documentation
is stale.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
