## Purpose

Centraliza la generación de metadata pública (título, descripción, canonical, OpenGraph) para Home, Category, Article y Page con una cadena de fallback consistente y un único origen canónico absoluto.

## ADDED Requirements

### Requirement: Cadena de fallback de metadata
El sistema SHALL resolver la metadata de cada documento público en este orden: SEO propio del documento (`seo.metaTitle`/`metaDescription`/`metaImage`/`canonicalURL`/`noIndex`) → contenido del documento → defaults de `SiteSettings.seo`. Un campo ausente en un nivel SHALL caer al siguiente nivel, nunca inventarse.

#### Scenario: Article con SEO override
- **WHEN** un Article tiene `seo.metaTitle` configurado
- **THEN** la metadata usa ese valor en vez del título del Article

#### Scenario: Article sin SEO override
- **WHEN** un Article no tiene `seo.metaTitle` configurado
- **THEN** la metadata usa el título del Article

#### Scenario: Page sin SEO ni imagen propia
- **WHEN** una Page no tiene `seo.metaImage` ni ninguna imagen en su contenido
- **THEN** la metadata cae al `SiteSettings.seo.defaultMetaImage` sin inventar una imagen

Referencia: §41.1-§41.4 del Master Spec, AC-SEO-001, AC-SEO-002

### Requirement: Metadata de Category con fallback definido
Category SHALL generar metadata desde su SEO propio, y en su ausencia SHALL usar el fallback `"{Category.name} | 60 Segundos"` como título y `Category.description` como descripción.

#### Scenario: Category sin SEO configurado
- **WHEN** una Category no tiene `seo.metaTitle`/`seo.metaDescription`
- **THEN** el título generado es `"{name} | 60 Segundos"` y la descripción es `Category.description`

Referencia: §41.2 del Master Spec, AC-SEO-003

### Requirement: Metadata de Home
Home SHALL generar su metadata desde los defaults de `SiteSettings`, con un override opcional definido en el propio Global Home.

#### Scenario: Home sin override propio
- **WHEN** Home no tiene su SEO propio configurado
- **THEN** la metadata usa los defaults de `SiteSettings.seo`

Referencia: §41.4 del Master Spec, AC-SEO-005

### Requirement: Origen único para toda URL absoluta de metadata
Toda URL absoluta usada en metadata (canonical, `alternates`, OpenGraph `url`) SHALL derivarse del origen de sitio canónico centralizado (capability `public-url-system`), nunca de una construcción local independiente.

#### Scenario: Canonical de Article coincide con la URL de compartir
- **WHEN** se genera el canonical de un Article y la URL usada por `ShareActions` para ese mismo Article
- **THEN** ambas son idénticas y provienen de la misma función de origen absoluto

#### Scenario: Article accedido por una categoría adicional nunca genera un canonical alterno
- **WHEN** se solicita un Article usando una `additionalCategory` en la URL
- **THEN** esa ruta nunca renderiza (ya redirige a la canónica en Fase 7) y por lo tanto nunca genera su propia metadata

Referencia: §41 del Master Spec, AC-SEO-001

### Requirement: Sin doble consulta entre metadata y render
La generación de metadata y el render de la página para el mismo documento SHALL compartir la misma llamada de datos por solicitud, sin duplicar la consulta a Payload para el mismo documento.

#### Scenario: Se genera metadata y se renderiza un Article en la misma solicitud
- **WHEN** Next.js invoca la generación de metadata y el componente de página para el mismo Article
- **THEN** la consulta del documento a Payload se ejecuta una sola vez por solicitud
