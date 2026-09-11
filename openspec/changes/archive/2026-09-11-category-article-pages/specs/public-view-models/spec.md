## ADDED Requirements

### Requirement: Contrato de detalle de Article
El sistema SHALL definir un view model de detalle de Article, distinto de `ArticleCardData`, que normaliza `content`, categoría primaria, tags, autor (`AuthorSummary`), imagen destacada, `source`, `photoCredits`, fechas y reading time — sin exponer la forma interna de `Post` de Payload a los componentes de presentación. No SHALL incluir `additionalCategories`: la composición de Article (§34) no las muestra, y la regla existente de este mismo spec ("Solo view models con consumidor real") prohíbe un campo sin consumidor real.

#### Scenario: Se renderiza un Article real
- **WHEN** la página de un Article compone su contenido con un Post real
- **THEN** recibe el view model de detalle de Article producido por un mapper, no el `Post` original de Payload

### Requirement: Related Posts reutiliza ArticleCardData
El listado de Related Posts SHALL normalizarse con el mismo `ArticleCardData` ya usado por otros listados (Home, Category), sin crear un contrato paralelo.

#### Scenario: Se renderiza la sección de Related Posts
- **WHEN** se renderiza la sección de Related Posts de un Article
- **THEN** cada elemento es un `ArticleCardData`, igual que en Category o Home
