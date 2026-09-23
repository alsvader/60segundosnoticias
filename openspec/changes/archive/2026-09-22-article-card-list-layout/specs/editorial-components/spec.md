## MODIFIED Requirements

### Requirement: ArticleCard como fundación reutilizable
El sistema SHALL proveer un componente `ArticleCard` único y reutilizable, sin duplicar una variante de componente por cada variante visual. `ArticleCard` SHALL definirse contra un contrato de datos propio del frontend (por ejemplo `ArticleCardData`), no contra el tipo `Post` generado por Payload. En la variante `compact`, la imagen SHALL ocupar todo el alto de la tarjeta, a sangre, recortada sin deformarse, y su ancho SHALL adaptarse al ancho de la propia tarjeta (miniatura en tarjetas angostas, imagen más grande en tarjetas anchas). El título de `ArticleCard` SHALL truncarse visualmente con elipsis a un máximo de 3 líneas en la variante `default` y 2 líneas en la variante `compact`, conservando el texto completo en el DOM.

#### Scenario: Se necesita otra variante visual de ArticleCard
- **WHEN** una fase futura necesita una variante visual adicional de `ArticleCard`
- **THEN** se implementa como variante del mismo componente (por ejemplo vía prop `variant`), no como un componente `ArticleCard` distinto

#### Scenario: Se provee data de Payload a ArticleCard
- **WHEN** una página de fase futura renderiza `ArticleCard`
- **THEN** le pasa un objeto que cumple `ArticleCardData`, transformado previamente por la capa de datos, no el tipo `Post` de Payload directamente

#### Scenario: Imagen de la variante compact a alto completo
- **WHEN** se renderiza `ArticleCard` con `variant="compact"` y una imagen
- **THEN** la imagen ocupa todo el alto de la tarjeta, sin padding alrededor, con recorte `object-cover`

#### Scenario: Ancho de la imagen compact según el ancho de la tarjeta
- **WHEN** se renderiza `ArticleCard` con `variant="compact"` y una imagen en contenedores de distinto ancho
- **THEN** la imagen mide 112 px en tarjetas angostas, 160 px desde 384 px de ancho de tarjeta y 224 px desde 512 px, sin depender del ancho del viewport

#### Scenario: Título largo en ArticleCard
- **WHEN** se renderiza `ArticleCard` con un título que ocupa más líneas que el máximo de su variante
- **THEN** el título se corta con elipsis en la línea 3 (`default`) o 2 (`compact`), la tarjeta no crece más allá de ese alto y el título completo sigue disponible para tecnologías asistivas

#### Scenario: Imagen compact con título largo
- **WHEN** se renderiza `ArticleCard` con `variant="compact"`, una imagen y un título largo
- **THEN** la imagen sigue ocupando todo el alto de la tarjeta, pero no se estira más allá del alto correspondiente a 2 líneas de título

Referencia: AC-COMP-001, AC-COMP-002, AC-COMP-003, AC-COMP-004
