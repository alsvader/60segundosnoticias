## ADDED Requirements

### Requirement: Indicador visible de Draft Mode
El sistema SHALL mostrar, en toda página pública servida con Draft Mode habilitado, un indicador visible que informe al usuario que está viendo contenido sin publicar, y SHALL incluir en ese indicador un enlace directo a `/api/preview-exit`.

#### Scenario: Página pública con Draft Mode habilitado
- **WHEN** una página del frontend público se renderiza con `draftMode().isEnabled` en `true`
- **THEN** la página muestra un indicador visible de Draft Mode con un enlace a `/api/preview-exit`

#### Scenario: Página pública con Draft Mode deshabilitado
- **WHEN** una página del frontend público se renderiza con `draftMode().isEnabled` en `false`
- **THEN** la página no muestra ningún indicador de Draft Mode

#### Scenario: Salida desde el indicador
- **WHEN** el usuario sigue el enlace del indicador de Draft Mode
- **THEN** se invoca `/api/preview-exit`, Draft Mode se deshabilita y el usuario vuelve a la experiencia pública normal

Referencia: §31 del Master Spec, AC-PREVIEW-006 (extiende el mecanismo de salida ya existente con un punto de descubrimiento visible; no reemplaza `/api/preview-exit`).
