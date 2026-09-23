## MODIFIED Requirements

### Requirement: Banner de Page reutiliza el componente ya compartido
El block `Banner` de Page SHALL renderizarse con el mismo componente ya compartido con Home desde Fase 6, sin una segunda implementación visual. Dentro de una Page, el Banner SHALL presentarse contenido dentro del contenedor de la Page (sin fondo a ancho completo ni gutter horizontal duplicado), conservando las mismas variantes, tipografía, composición según imagen y CTA que en Home.

#### Scenario: Banner configurado en una Page
- **WHEN** una Page tiene un block `Banner` en su `layout`
- **THEN** se renderiza con el mismo componente `BannerSection` que usa Home
- **AND** su borde izquierdo coincide con el de los demás blocks de la Page y la página no tiene scroll horizontal

Referencia: Fase 6 — reubicación de `Banner` a `blocks/shared/`; AC-RESP-002
