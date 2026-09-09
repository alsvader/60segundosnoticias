# 60 Segundos Noticias

Portal editorial y multimedia construido con Next.js + Payload CMS + PostgreSQL.

> El repositorio se encuentra inicialmente en **Phase -1 / repository bootstrap**. Las instrucciones de ejecución de la aplicación se completarán durante Phase 0 y Phase 1, cuando exista el bootstrap real de Next.js/Payload.

## Source of truth

- `docs/60-segundos-spec.md` — Master Specification y estado objetivo de V1.
- `docs/ASSETS.md` — inventario y reglas de assets.
- `docs/AI-WORKFLOW.md` — workflow de desarrollo asistido por IA / SDD.
- `docs/AI-SKILLS.md` — routing/registro humano de skills.
- `skills-lock.json` — roster bloqueado de skills (source/path/hash).
- `AGENTS.md` — reglas vendor-neutral para agentes.

## Visual references

- `docs/references/home-reference.jpeg` — North Star visual; no es un asset de producción.
- `public/branding/` — identidad visual pública.
- `public/textures/` — texturas de producción.

## AI-assisted development

El workflow recomendado utiliza:

- OpenSpec — Spec-Driven Development para los cambios de Phase 0 en adelante.
- Graphify — knowledge graph del repositorio para reducir exploraciones amplias de código.
- Claude Code y/o Codex — agentes soportados por el workflow.
- Project skills — registrados en `docs/AI-SKILLS.md`.

Estas herramientas son **solo de desarrollo**. No forman parte del runtime ni del container de producción.

### Comprobar el entorno

```bash
./scripts/ai/check-environment.sh
```

Después sigue `docs/AI-WORKFLOW.md` para instalar/inicializar OpenSpec, skills y Graphify.

## Graphify

Cuando Phase -1 esté inicializada, `graphify-out/` se versiona para compartir el mapa del repositorio con el equipo. Debe actualizarse cuando cambios relevantes hagan que el grafo quede desactualizado.

## OpenSpec

`openspec/config.yaml` contiene el contexto y las reglas del proyecto. No conviertas todo el Master Spec en un único change. Cada change debe representar una unidad coherente de trabajo.

## Standard development

La aplicación debe poder desarrollarse y ejecutarse sin herramientas de IA. Los comandos definitivos (`pnpm install`, Docker Compose, migraciones, tests y build) se documentarán aquí al completar Phase 0/1, basados en la implementación real en lugar de anticiparlos incorrectamente.
