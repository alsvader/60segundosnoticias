## Purpose

Expone `paper-grain.webp` y `newspaper-pattern.webp` como utilidades/componentes de fondo reutilizables y controlados, sin construir el Hero de Home ni otras secciones de página que los consuman.

## ADDED Requirements

### Requirement: Textura de papel sutil sobre el canvas
El sistema SHALL exponer una utilidad reutilizable para aplicar `paper-grain.webp` de forma muy sutil sobre el fondo `paper`, sin comprometer la legibilidad del texto. (Ref. AC-DESIGN-005)

#### Scenario: Se aplica la textura de papel al canvas
- **WHEN** un contenedor usa la utilidad de textura de papel
- **THEN** el contraste de texto sobre ese fondo permanece legible según los criterios de accesibilidad del Design System

### Requirement: Textura de periódico decorativa de baja opacidad
El sistema SHALL exponer una utilidad reutilizable para `newspaper-pattern.webp` pensada para Hero/secciones decorativas, con opacidad aproximada 3-7%, sin usarla por defecto en el cuerpo de artículo. Esta capability no SHALL implementar el Hero de Home ni ninguna sección de página.

#### Scenario: Un componente futuro de Hero necesita la textura decorativa
- **WHEN** un componente de fases posteriores requiere la textura de periódico
- **THEN** consume la utilidad expuesta por este Design System con la opacidad definida, sin que este change haya construido el Hero

#### Scenario: Se usa la textura en el cuerpo de un artículo
- **WHEN** se evalúa el uso de `newspaper-pattern` en contenido de lectura larga
- **THEN** la utilidad no se aplica por defecto en esa zona

### Requirement: Sin selección arbitraria de textura desde el CMS
El sistema no SHALL permitir que el CMS seleccione texturas arbitrarias; solo las variantes de textura previamente diseñadas y expuestas por este Design System SHALL estar disponibles.

#### Scenario: Se revisa el contrato de textura expuesto al CMS
- **WHEN** se audita qué puede seleccionar el editor de contenido respecto a texturas
- **THEN** únicamente puede elegir entre las variantes predefinidas del Design System, no una URL o valor arbitrario
