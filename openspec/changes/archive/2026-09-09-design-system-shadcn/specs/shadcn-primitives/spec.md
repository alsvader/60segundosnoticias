## Purpose

Define la política de shadcn/ui como capa de primitivos del proyecto: qué se instala en esta change, cómo se retematiza, y qué no debe ocurrir (instalación masiva, apariencia genérica, segundo framework de UI).

## ADDED Requirements

### Requirement: shadcn como única base de primitivos
shadcn/ui SHALL ser la única base de primitivos de componentes del proyecto. El sistema no SHALL introducir Material UI, Chakra, Ant Design, Mantine u otra librería de componentes competidora. (Ref. AC-GEN-009, AC-UI-001, AC-UI-005)

#### Scenario: Se revisan las dependencias tras este change
- **WHEN** se inspeccionan las dependencias de UI del proyecto
- **THEN** shadcn/ui (vía `radix-ui` y `class-variance-authority`) sigue siendo la única base de primitivos

### Requirement: Instalación incremental, no masiva
El sistema no SHALL ejecutar `shadcn add --all`. Un primitivo shadcn adicional a `Button` SHALL añadirse en esta change únicamente cuando un componente editorial definido en esta misma change lo consuma realmente; no SHALL añadirse anticipando una necesidad de una fase futura.

#### Scenario: Se evalúa añadir un primitivo nuevo
- **WHEN** se considera instalar un primitivo shadcn adicional durante esta change
- **THEN** existe un componente concreto de esta change que lo consume; si no existe tal consumidor, el primitivo no se instala

### Requirement: Primitivos retematizados, no apariencia genérica de shadcn
Los primitivos shadcn instalados SHALL consumir los tokens del Design System 60 Segundos (color, radius, tipografía) y no SHALL conservar la apariencia neutra por defecto de shadcn. (Ref. AC-UI-003, AC-UI-004, AC-DESIGN-007)

#### Scenario: Se renderiza Button tras la retematización
- **WHEN** `Button` (variant `default`) se renderiza tras este change
- **THEN** su apariencia refleja el rojo de marca y la tipografía Oswald/Inter del Design System, no la paleta neutra `oklch` original

### Requirement: Sin modo oscuro heredado en los primitivos
Los primitivos shadcn no SHALL exponer variantes o comportamiento de modo oscuro tras este change, consistente con la ausencia de dark mode en V1.

#### Scenario: Se inspecciona un primitivo shadcn generado
- **WHEN** se revisa el código de un primitivo shadcn instalado en esta change
- **THEN** no referencia clases o variables de modo oscuro activas
