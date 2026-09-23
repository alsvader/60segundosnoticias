## MODIFIED Requirements

### Requirement: Composición editorial del Article
La página de Article SHALL incluir, en este orden: breadcrumb, categoría, H1, excerpt/lead, metadata del artículo, acciones de compartir, imagen destacada, contenido del artículo, tags, acciones de compartir y related posts. La metadata del artículo SHALL mostrar únicamente la fecha de publicación y el tiempo estimado de lectura, y SHALL NOT mostrar el nombre ni el avatar del autor. La página SHALL NOT renderizar un Author Card.

#### Scenario: Article publicado con todos los campos
- **WHEN** se renderiza un Article publicado con excerpt, imagen destacada, tags y autor
- **THEN** cada elemento aparece en el orden especificado

#### Scenario: Metadata sin autoría
- **WHEN** se renderiza un Article publicado que tiene autor, `publishedAt` y tiempo de lectura
- **THEN** la metadata bajo el excerpt muestra solo "Publicado {fecha}" y "{n} min de lectura", sin nombre ni avatar del autor

#### Scenario: Sin Author Card
- **WHEN** se renderiza un Article publicado que tiene autor
- **THEN** la página no muestra un Author Card

#### Scenario: Fecha de actualización
- **WHEN** `updatedAt` de un Post no aporta información distinta de `publishedAt`
- **THEN** no se muestra por separado en la metadata

Referencia: §34, §34.1 del Master Spec

## REMOVED Requirements

### Requirement: Author Card con datos públicos, sin ruta de autor
**Reason**: La página de Article ya no renderiza el Author Card. El componente se conserva para uso futuro; la protección de datos privados del autor sigue cubierta por `public-view-models` y `structured-data`.
**Migration**: Ninguna. Si el Author Card vuelve a usarse en una página, reintroducir este requirement en la capability correspondiente.
