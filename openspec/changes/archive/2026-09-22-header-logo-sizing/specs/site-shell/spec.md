## ADDED Requirements

### Requirement: El logo del shell se escala por altura
Cuando Header o Footer renderizan una imagen de logo, esta SHALL dimensionarse por altura dentro de su contenedor, conservando su proporción original (`object-contain`, ancho automático con un máximo), sin recortarse ni deformarse. En móvil, el logo del Header SHALL medir 56px de alto y quedar centrado dentro de la barra de 72px. En desktop SHALL medir 100px, anclado 8px bajo el borde superior de la barra de 88px, y sobresalir por debajo de su borde inferior, quedando por encima del contenido de la página.

#### Scenario: Se configura un logo cuadrado en Navigation
- **WHEN** el Global Navigation tiene un logo con proporción 1:1
- **THEN** en móvil el Header lo muestra a 56px de alto, centrado verticalmente
- **AND** en desktop lo muestra a 100px de alto, con espacio sobre él y sobresaliendo por debajo del borde inferior de la barra

#### Scenario: Se configura un logo horizontal muy ancho
- **WHEN** el logo configurado es mucho más ancho que alto
- **THEN** se limita a su ancho máximo sin deformarse y no desplaza la navegación ni el buscador

#### Scenario: El Footer muestra un logo
- **WHEN** el Footer renderiza un logo (propio o de respaldo de `SiteSettings`)
- **THEN** se muestra a 80px de alto, alineado al inicio de su columna y conservando su proporción
