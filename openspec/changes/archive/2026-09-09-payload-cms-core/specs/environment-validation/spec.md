## ADDED Requirements

### Requirement: Config cargable desde el CLI de Payload
El módulo de validación de entorno usado por `payload.config.ts` SHALL poder cargarse cuando `payload.config.ts` se carga fuera del bundler de Next.js (por ejemplo, desde el CLI de Payload), sin producir un error de carga de módulo.

#### Scenario: generación de tipos desde el CLI
- **WHEN** se ejecuta un comando del CLI de Payload que carga `payload.config.ts` (generación de tipos o de una migración)
- **THEN** la configuración se carga sin errores de resolución o de carga de módulos

#### Scenario: la validación existente del runtime de la aplicación no cambia
- **WHEN** la aplicación Next.js arranca o hace build
- **THEN** la validación de variables críticas sigue comportándose igual que antes de este change (variable faltante falla explícitamente, secretos no expuestos al cliente)

Referencia: necesario para que `payload generate:types` y `payload migrate:create` funcionen; ver design.md para el mecanismo elegido
