# Claude Code — 60 Segundos Noticias

Read `AGENTS.md` first and follow it as the repository-wide instruction set.

Primary references:

- Target product specification: `docs/60-segundos-spec.md`
- Design System implementation reference: `docs/DESIGN-SYSTEM.md`
- Frontend architecture reference: `docs/FRONTEND-ARCHITECTURE.md`
- AI/SDD workflow: `docs/AI-WORKFLOW.md`
- Project skill registry: `docs/AI-SKILLS.md`
- Current planned work: `openspec/changes/`
- Implemented OpenSpec behavior: `openspec/specs/`
- Repository knowledge graph: `graphify-out/graph.json` when present

Use OpenSpec for product implementation changes from Phase 0 onward. Query Graphify before broad codebase exploration, then inspect the actual relevant source files before editing.

Do not duplicate the Master Spec into this file. Tool-generated Claude/Graphify instructions may extend this file or project configuration; preserve the repository rules above when updating integrations.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
