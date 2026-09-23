## MODIFIED Requirements

### Requirement: ArticleCard como fundación reutilizable
El sistema SHALL proveer un componente `ArticleCard` único y reutilizable, sin duplicar una variante de componente por cada variante visual. `ArticleCard` SHALL definirse contra un contrato de datos propio del frontend (por ejemplo `ArticleCardData`), no contra el tipo `Post` generado por Payload. En la variante `compact`, la imagen SHALL ocupar todo el alto de la tarjeta, a sangre, recortada sin deformarse.

#### Scenario: Se necesita otra variante visual de ArticleCard
- **WHEN** una fase futura necesita una variante visual adicional de `ArticleCard`
- **THEN** se implementa como variante del mismo componente (por ejemplo vía prop `variant`), no como un componente `ArticleCard` distinto

#### Scenario: Se provee data de Payload a ArticleCard
- **WHEN** una página de fase futura renderiza `ArticleCard`
- **THEN** le pasa un objeto que cumple `ArticleCardData`, transformado previamente por la capa de datos, no el tipo `Post` de Payload directamente

#### Scenario: Imagen de la variante compact a alto completo
- **WHEN** se renderiza `ArticleCard` con `variant="compact"` y una imagen
- **THEN** la imagen ocupa todo el alto de la tarjeta, sin padding alrededor, con ancho fijo y recorte `object-cover`

Referencia: AC-COMP-001, AC-COMP-002, AC-COMP-003, AC-COMP-004
