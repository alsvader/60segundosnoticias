## Purpose

Extiende los fundamentos de accesibilidad de Fase 4 hacia el site shell público (Header, navegación móvil, landmarks), sin posponerlos a la auditoría de Fase 11.

## Requirements

### Requirement: Landmarks semánticos en el shell público
El layout público SHALL exponer landmarks semánticos (`header`, `nav`, `main`, `footer`) y un skip link hacia el contenido principal.

#### Scenario: Un usuario de lector de pantalla navega el shell
- **WHEN** un usuario navega la página con un lector de pantalla
- **THEN** puede identificar header, navegación principal, contenido y footer como landmarks distintos, y usar el skip link para saltar al contenido principal

### Requirement: Navegación móvil operable por teclado
La navegación móvil (Sheet) SHALL ser operable completamente por teclado: apertura/cierre, `Escape` para cerrar, gestión de foco al abrir/cerrar, y bloqueo de scroll del fondo mientras está abierta.

#### Scenario: Se abre la navegación móvil con teclado
- **WHEN** un usuario activa el trigger del menú móvil con teclado y luego presiona `Escape`
- **THEN** el menú se cierra y el foco regresa al trigger

### Requirement: Continuidad de foco visible y touch targets
Los elementos interactivos del Header (trigger de menú móvil, items de navegación, enlaces del Footer) SHALL usar el mismo tratamiento de foco visible (`--ring`) y el mismo mínimo de touch target de 44px establecidos en Fase 4, sin un tratamiento de foco independiente o inconsistente.

#### Scenario: Se enfoca el trigger del menú móvil por teclado
- **WHEN** el trigger del menú móvil recibe foco por teclado
- **THEN** muestra el mismo anillo de foco que los demás controles interactivos del Design System
