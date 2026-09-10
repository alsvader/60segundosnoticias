## Purpose

Define cómo las 10 category theme keys ya almacenadas por el CMS (`red, blue, orange, green, pink, purple, cyan, yellow, teal, indigo`) se traducen en variables visuales consumibles por los componentes editoriales, sin depender de clases Tailwind interpoladas dinámicamente ni de colores arbitrarios provenientes del CMS.

## Requirements

### Requirement: Mapeo de category theme mediante atributo de datos
El frontend SHALL mapear cada category theme key a un conjunto de variables CSS (`--cat-accent`, `--cat-accent-fg`, `--cat-soft`, `--cat-soft-fg`, `--cat-border`) usando un selector de atributo de datos (`[data-cat-theme="<key>"]`). El sistema no SHALL construir nombres de clase Tailwind interpolando el valor de la key en tiempo de ejecución.

#### Scenario: Un componente recibe una category theme key válida
- **WHEN** un componente editorial recibe `colorTheme="blue"`
- **THEN** el elemento se marca con `data-cat-theme="blue"` y consume `--cat-accent`/`--cat-soft`/etc. resueltos por ese selector

#### Scenario: Se audita el código por clases Tailwind dinámicas de categoría
- **WHEN** se revisa el código de los componentes editoriales
- **THEN** no existe ninguna construcción de clase Tailwind de color que interpole directamente la category theme key en tiempo de ejecución

### Requirement: Contraste explícito por tema
Cada category theme key SHALL definir explícitamente su color de foreground de acento (`--cat-accent-fg`) y de foreground suave (`--cat-soft-fg`); el sistema no SHALL asumir blanco como foreground válido para todas las keys. Los temas con accent claro (por ejemplo `yellow`, `green`, `cyan`) SHALL usar un foreground oscuro cuando sea necesario para cumplir contraste.

#### Scenario: Se usa el theme yellow
- **WHEN** un componente usa `data-cat-theme="yellow"`
- **THEN** el foreground de acento resultante cumple contraste legible (no es blanco sobre un accent claro)

Referencia: AC-A11Y-006

### Requirement: Solo keys controladas, sin color arbitrario del CMS
El sistema SHALL renderizar únicamente las category theme keys reconocidas por `CATEGORY_THEME_KEYS`. Un valor no reconocido no SHALL producir un color arbitrario; SHALL recibir un theme por defecto definido por el Design System.

#### Scenario: Una categoría no define colorTheme
- **WHEN** un componente editorial recibe una categoría sin `colorTheme` o con un valor no reconocido
- **THEN** se aplica el theme por defecto del Design System, no un color arbitrario

### Requirement: Constantes de Payload permanecen framework-neutral
El módulo que mapea category theme keys a variables CSS/componentes Lucide SHALL vivir fuera de `src/payload/` y de los archivos de constantes consumidos por la configuración de Payload (`category-theme-keys.ts`, `category-icon-keys.ts`). Estos últimos no SHALL importar React, Tailwind ni Lucide.

#### Scenario: Se inspecciona category-theme-keys.ts tras el cambio
- **WHEN** se revisa `src/lib/constants/category-theme-keys.ts`
- **THEN** el archivo sigue sin importar React, Tailwind ni Lucide, y el mapeo visual vive en un módulo frontend separado
