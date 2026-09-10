## Purpose

Define la política de shadcn/ui como capa de primitivos del proyecto: qué se instala en cada change, cómo se retematiza, y qué no debe ocurrir (instalación masiva, apariencia genérica, segundo framework de UI).

## Requirements

### Requirement: shadcn como única base de primitivos
shadcn/ui SHALL ser la única base de primitivos de componentes del proyecto. El sistema no SHALL introducir Material UI, Chakra, Ant Design, Mantine u otra librería de componentes competidora.

#### Scenario: Se revisan las dependencias del proyecto
- **WHEN** se inspeccionan las dependencias de UI del proyecto
- **THEN** shadcn/ui (vía `radix-ui` y `class-variance-authority`) sigue siendo la única base de primitivos

Referencia: AC-GEN-009, AC-UI-001, AC-UI-005

### Requirement: Instalación incremental, no masiva
El sistema no SHALL ejecutar `shadcn add --all`. Un primitivo shadcn adicional SHALL añadirse únicamente cuando un componente editorial concreto lo consuma realmente; no SHALL añadirse anticipando una necesidad de una fase futura.

#### Scenario: Se evalúa añadir un primitivo nuevo
- **WHEN** se considera instalar un primitivo shadcn adicional
- **THEN** existe un componente concreto que lo consume; si no existe tal consumidor, el primitivo no se instala

### Requirement: Primitivos retematizados, no apariencia genérica de shadcn
Los primitivos shadcn instalados SHALL consumir los tokens del Design System 60 Segundos (color, radius, tipografía) y no SHALL conservar la apariencia neutra por defecto de shadcn.

#### Scenario: Se renderiza Button
- **WHEN** `Button` (variant `default`) se renderiza
- **THEN** su apariencia refleja el rojo de marca y la tipografía Oswald/Inter del Design System, no la paleta neutra `oklch` original de shadcn

Referencia: AC-UI-003, AC-UI-004, AC-DESIGN-007

### Requirement: Sin modo oscuro heredado en los primitivos
Los primitivos shadcn no SHALL exponer variantes o comportamiento de modo oscuro, consistente con la ausencia de dark mode en V1.

#### Scenario: Se inspecciona un primitivo shadcn instalado
- **WHEN** se revisa el código de un primitivo shadcn instalado
- **THEN** no referencia clases o variables de modo oscuro activas
