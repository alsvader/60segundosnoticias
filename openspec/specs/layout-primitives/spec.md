## Purpose

Provee el primitivo de contenedor y los fundamentos responsivos (breakpoints, gutters, anchos legibles) que consumirán las páginas y secciones de fases futuras, sin implementar dichas páginas.

## Requirements

### Requirement: Container con canvas y gutters responsivos
El sistema SHALL proveer un componente `Container` con un ancho máximo aproximado de 1360-1440px, centrado, y gutters responsivos (16-20px mobile, 24-32px tablet, 40-48px desktop).

#### Scenario: Se usa Container en mobile
- **WHEN** `Container` se renderiza en un viewport mobile
- **THEN** el contenido no genera scroll horizontal accidental y respeta el gutter mobile definido

#### Scenario: Se usa Container en desktop ancho
- **WHEN** `Container` se renderiza en un viewport desktop ancho
- **THEN** el ancho del contenido no excede el máximo definido (~1360-1440px) y permanece centrado

Referencia: AC-RESP-001, AC-RESP-002

### Requirement: Breakpoints alineados al Master Spec
El sistema SHALL usar los breakpoints `sm 640, md 768, lg 1024, xl 1280, 2xl 1536` como fundamento responsivo, consistentes con los breakpoints por defecto de Tailwind.

#### Scenario: Se consulta un breakpoint del Design System
- **WHEN** un componente necesita un breakpoint responsivo
- **THEN** usa uno de los breakpoints estándar definidos, sin introducir un valor arbitrario distinto

### Requirement: Anchos legibles de contenido editorial
El sistema SHALL exponer un ancho de artículo (~680-760px) y un ancho de media ancha (~1000-1120px) como helpers de layout reutilizables, sin implementar la página de artículo.

#### Scenario: Un futuro componente de artículo necesita el ancho legible
- **WHEN** un componente de contenido largo requiere el ancho de lectura editorial
- **THEN** existe un helper/token de ancho de artículo definido por este Design System
