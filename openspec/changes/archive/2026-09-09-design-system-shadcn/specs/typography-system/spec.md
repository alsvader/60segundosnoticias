## Purpose

Establece la carga e integración de las dos familias tipográficas del sistema editorial (Oswald para display, Inter para cuerpo/UI) y la escala/reglas de uso derivadas del Master Spec, sin implementar plantillas de página completas.

## ADDED Requirements

### Requirement: Tipografía display usa Oswald
La navegación, encabezados, títulos de sección, labels de categoría, botones y texto de display SHALL usar la familia Oswald, cargada mediante `next/font/google` y expuesta como variable de fuente del Design System. (Ref. AC-DESIGN-003)

#### Scenario: Se renderiza un encabezado de sección
- **WHEN** `SectionHeader` u otro elemento de tipografía display se renderiza
- **THEN** la fuente aplicada es Oswald a través de la variable de fuente del Design System

### Requirement: Tipografía long-form usa Inter
El cuerpo de artículo, excerpt, metadata, captions, descripciones y formularios SHALL usar la familia Inter, cargada mediante `next/font/google`. (Ref. AC-DESIGN-004)

#### Scenario: Se renderiza texto de cuerpo
- **WHEN** un componente de texto de cuerpo/UI se renderiza
- **THEN** la fuente aplicada es Inter

### Requirement: Escala tipográfica del Design System
El sistema SHALL exponer utilidades o tokens para las escalas definidas en el Master Spec (Display XL, Article H1, H2, H3, Section Heading, Body, Lead, Metadata) con sus rangos responsivos (desktop/tablet/mobile), sin construir plantillas de página completas.

#### Scenario: Un componente necesita el tamaño H2
- **WHEN** un componente del Design System requiere el tamaño tipográfico H2
- **THEN** existe una utilidad/token de escala H2 que respeta los rangos desktop/mobile del Master Spec

### Requirement: Restricción de uppercase
El uppercase SHALL aplicarse únicamente a navegación, botones, labels de sección y labels de categoría. El uppercase no SHALL aplicarse a títulos largos de artículo ni a cuerpo de texto.

#### Scenario: Se define un título de artículo (H1)
- **WHEN** se usa la utilidad tipográfica de Article H1
- **THEN** dicha utilidad no fuerza uppercase
