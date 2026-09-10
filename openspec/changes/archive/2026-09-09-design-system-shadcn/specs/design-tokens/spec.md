## Purpose

Define la fuente única de tokens visuales (color, radius, sombra) del sistema editorial 60 Segundos como variables CSS en `globals.css`, reemplazando la paleta neutra genérica de shadcn y eliminando el modo oscuro no requerido en V1.

## ADDED Requirements

### Requirement: Fuente única de tokens de color
El sistema SHALL definir los tokens de marca (`brand-red` y su escala), `ink`, `paper`, `border` y semánticos (`success`, `warning`, `error`, `info`) exclusivamente como variables CSS en `src/app/globals.css`. Ningún componente SHALL redeclarar estos valores hexadecimales de forma local.

#### Scenario: Un componente necesita el color de marca
- **WHEN** un componente presentacional necesita el rojo de marca
- **THEN** consume la variable CSS/slot semántico existente y no declara el valor hexadecimal directamente

### Requirement: Fondo principal editorial
El fondo principal de la aplicación SHALL usar el tono paper/off-white definido (`--paper`), no el blanco/gris neutro por defecto de shadcn. (Ref. AC-DESIGN-001)

#### Scenario: Se renderiza el body
- **WHEN** se carga cualquier página del frontend público
- **THEN** el color de fondo aplicado corresponde al token `--paper` (o su slot semántico `--background`), no a un blanco puro genérico

### Requirement: Rojo como accent principal
El slot semántico de acento primario (`--primary` y equivalentes consumidos por shadcn) SHALL mapear al token `--brand-red`, no a un neutro genérico. (Ref. AC-DESIGN-002)

#### Scenario: Un primitivo shadcn usa el color primario
- **WHEN** `Button` u otro primitivo referencia `--primary`
- **THEN** el color resultante es el rojo de marca definido en el Design System, no el neutro por defecto de shadcn

### Requirement: Sin modo oscuro en V1
El sistema SHALL eliminar el bloque `.dark`, la variante `@custom-variant dark` y cualquier alternancia de paleta oscura generada por la inicialización de shadcn. No SHALL introducirse un theme provider, un selector de tema ni una librería de manejo de temas.

#### Scenario: Se inspecciona globals.css tras el cambio
- **WHEN** se revisa `src/app/globals.css`
- **THEN** no existe ningún selector `.dark` ni variante `dark:` activa que redefina la paleta

#### Scenario: Se inspeccionan las dependencias del proyecto
- **WHEN** se revisan las dependencias de runtime tras este change
- **THEN** no se ha añadido `next-themes` ni ninguna librería de gestión de temas

### Requirement: Radius y sombras restringidos
La escala de radius SHALL limitarse a `4, 8, 12, 16, 999`, con cards usando 12-16px. Las sombras SHALL reservarse para menús, overlays, dropdowns y floating UI; las cards no SHALL usar sombras pronunciadas de estilo SaaS. (Ref. AC-DESIGN-006, AC-DESIGN-007)

#### Scenario: Se define una card editorial
- **WHEN** un componente tipo card (por ejemplo `CategoryCard`) usa el token de radius por defecto
- **THEN** el radius aplicado está entre 12px y 16px y no lleva una sombra elevada de tipo SaaS
