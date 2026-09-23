## ADDED Requirements

### Requirement: Expandir HeaderSearch no desplaza el Header
Al expandirse o colapsarse, `HeaderSearch` SHALL NOT cambiar la posición ni el tamaño del logo ni de la navegación principal del Header. El campo de búsqueda SHALL crecer de derecha a izquierda desde el icono de la lupa, fuera del flujo de layout del Header. En desktop, expandido, SHALL cubrir por completo la zona de la navegación principal con fondo opaco, de modo que ningún item del menú quede parcialmente visible; al colapsar, la navegación SHALL reaparecer en la misma posición.

#### Scenario: Se expande el buscador en desktop
- **WHEN** en un viewport desktop el usuario hace click en la lupa del Header
- **THEN** el campo de búsqueda aparece a la izquierda de la lupa y cubre toda la navegación principal
- **AND** la navegación principal y el logo conservan exactamente la misma posición que antes del click

#### Scenario: La navegación tiene muchos items
- **WHEN** la navegación configurada en el CMS deja poco espacio libre entre la nav y la lupa
- **THEN** el buscador expandido cubre la nav completa, sin items cortados a medias

#### Scenario: Se colapsa el buscador
- **WHEN** el buscador expandido se colapsa (Escape o blur fuera del formulario)
- **THEN** la navegación principal reaparece y, junto con el logo, permanece en la misma posición
