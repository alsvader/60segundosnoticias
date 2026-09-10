## Purpose

Establece los fundamentos de accesibilidad (foco, touch targets, contraste, reduced motion) que deben construirse dentro de los primitivos y componentes de la Fase 4, en lugar de posponerse a la auditoría de la Fase 11.

## Requirements

### Requirement: Navegación por teclado en funciones críticas
Todo primitivo o componente editorial interactivo SHALL ser operable mediante teclado (tab order lógico, activación con Enter/Space donde aplique).

#### Scenario: Se navega Button solo con teclado
- **WHEN** un usuario navega con Tab hasta `Button`
- **THEN** puede activarlo con Enter o Espacio sin usar el mouse

Referencia: AC-A11Y-001

### Requirement: Accessible name en controles solo-icono
Cualquier control interactivo que se renderice solo con un icono (sin texto visible) SHALL exponer un nombre accesible (`aria-label` o equivalente).

#### Scenario: Se renderiza un botón icon-only
- **WHEN** `Button` se usa con `size="icon"` y sin texto visible
- **THEN** expone un `aria-label` descriptivo

Referencia: AC-A11Y-002

### Requirement: Foco visible
Todo elemento interactivo del Design System SHALL mostrar un estado de foco visible al navegar por teclado, consistente con el token de foco definido.

#### Scenario: Se enfoca un elemento interactivo por teclado
- **WHEN** un elemento interactivo del Design System recibe foco por teclado
- **THEN** se muestra un anillo/indicador de foco visible

Referencia: AC-A11Y-003

### Requirement: Alt apropiado en imágenes editoriales
`ResponsiveMedia` SHALL requerir `alt` como prop obligatoria y no SHALL aceptar una cadena vacía como valor por defecto silencioso para contenido editorial.

#### Scenario: Se intenta omitir alt en ResponsiveMedia
- **WHEN** se usa `ResponsiveMedia` sin `alt`
- **THEN** el tipo del componente lo rechaza en tiempo de compilación

Referencia: AC-A11Y-004

### Requirement: Jerarquía de encabezados correcta
`SectionHeader` SHALL permitir especificar el nivel de encabezado semántico apropiado para el contexto de la página que lo use, evitando saltos de jerarquía.

#### Scenario: SectionHeader se usa dentro de una página con H1 ya definido
- **WHEN** una página futura ya definió su H1 y usa `SectionHeader` para una subsección
- **THEN** `SectionHeader` puede renderizar un nivel de encabezado (por ejemplo H2) apropiado, no forzado siempre a H1

Referencia: AC-A11Y-005

### Requirement: Contraste apropiado en category themes
Todas las category theme keys SHALL cumplir contraste de texto legible en su combinación accent/foreground y soft/foreground, verificado explícitamente para los temas de accent claro (`yellow`, `green`, `cyan`).

#### Scenario: Se audita el contraste de un theme claro
- **WHEN** se mide el contraste de `--cat-accent-fg` sobre `--cat-accent` para `data-cat-theme="green"`
- **THEN** el contraste cumple el mínimo legible definido por el Design System

Referencia: AC-A11Y-006

### Requirement: Touch targets apropiados
Los elementos interactivos SHALL soportar un área táctil mínima de 44px donde sea relevante (botones, controles de navegación, badges interactivos).

#### Scenario: Se usa Button en tamaño pequeño en mobile
- **WHEN** `Button` se renderiza en un tamaño compacto en un viewport táctil
- **THEN** su área interactiva efectiva cumple el mínimo de 44px definido

Referencia: AC-A11Y-007

### Requirement: Motion respeta reduced motion
Toda animación/transición definida por los tokens de motion SHALL respetar `prefers-reduced-motion: reduce`, desactivando o reduciendo el efecto cuando el usuario lo solicita.

#### Scenario: El usuario tiene reduced motion activado
- **WHEN** el sistema operativo del usuario tiene `prefers-reduced-motion: reduce`
- **THEN** las transiciones de hover/scale definidas por los tokens de motion se omiten o se reducen a un cambio instantáneo

Referencia: AC-A11Y-008
