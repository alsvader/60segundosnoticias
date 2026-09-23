# article-page Specification

## Purpose

Define la ruta pública de un Article, su resolución canónica de categoría, y su composición editorial completa: metadata, autor, contenido relacionado y acciones de compartir.

## Requirements

### Requirement: Resolución canónica de `/<category>/<post>`
El sistema SHALL resolver `/<category>/<post>` comparando la categoría solicitada contra `primaryCategory` del Post. Si coinciden, SHALL renderizar el Article. Si el Post existe pero la categoría solicitada no es su `primaryCategory` (incluyendo cuando la categoría solicitada es solo una `additionalCategory`), SHALL redirigir de forma permanente a la URL canónica (`primaryCategory.slug/post.slug`), sin crear nunca una segunda página pública para el mismo Post.

#### Scenario: Categoría correcta
- **WHEN** la categoría solicitada es la `primaryCategory` del Post
- **THEN** se responde 200 y se renderiza el Article

#### Scenario: Categoría incorrecta con Post existente
- **WHEN** la categoría solicitada no es la `primaryCategory` del Post, pero el Post existe
- **THEN** se redirige de forma permanente a la URL canónica del Post

#### Scenario: Categoría adicional usada en la URL
- **WHEN** la categoría solicitada corresponde únicamente a una `additionalCategory` del Post
- **THEN** se redirige a la URL canónica; nunca se crea una página pública alterna para esa combinación

#### Scenario: Post inexistente
- **WHEN** no existe ningún Post con el slug solicitado
- **THEN** se responde 404

#### Scenario: Post no publicado
- **WHEN** el Post existe pero está en draft o sin publicar
- **THEN** se responde 404, nunca se renderiza el contenido

Referencia: AC-FE-POST-001, AC-FE-POST-002, AC-FE-POST-003

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

### Requirement: Un único H1 en el Article
El encabezado de Article SHALL ser el único elemento dueño del `<h1>` de la página.

#### Scenario: Verificación de jerarquía de encabezados
- **WHEN** se inspecciona el DOM renderizado de un Article
- **THEN** existe exactamente un `<h1>`

Referencia: AC-ARTICLE-002, AC-A11Y-005

### Requirement: Related Posts
La sección de Related Posts SHALL mostrar Posts publicados que compartan la misma `primaryCategory` que el Article actual, excluyendo siempre el Post actual, ordenados por `publishedAt` descendente, con un límite de aproximadamente 4, sin ninguna configuración manual por Post.

#### Scenario: Existen Posts relacionados
- **WHEN** existen 6 Posts publicados con la misma `primaryCategory` que el Article actual
- **THEN** se muestran hasta 4, y el Post actual nunca aparece entre ellos

#### Scenario: Sin Posts relacionados
- **WHEN** no existe ningún otro Post publicado con la misma `primaryCategory`
- **THEN** la sección de Related Posts se omite sin romper la página

Referencia: AC-RELATED-001, AC-RELATED-002, AC-RELATED-003, §34.2 del Master Spec

### Requirement: Sharing con URL canónica
El Article SHALL ofrecer acciones de compartir para Facebook, X, WhatsApp, copiar enlace, y Web Share API/Native Share cuando esté disponible, siempre usando la URL canónica del Article. Instagram SHALL NOT tener un botón de compartir web dedicado.

#### Scenario: Copiar enlace
- **WHEN** el usuario usa la acción "Copiar enlace"
- **THEN** se copia la URL canónica del Article y se muestra retroalimentación visible y accesible

#### Scenario: Web Share API disponible
- **WHEN** el navegador soporta Web Share API
- **THEN** se ofrece como opción de compartir nativa

#### Scenario: Sin botón falso de Instagram
- **WHEN** se renderizan las acciones de compartir
- **THEN** no existe un botón dedicado de "compartir a Instagram" vía web

Referencia: AC-SHARE-001, AC-SHARE-002, AC-SHARE-003, AC-SHARE-004, AC-SHARE-005, §35 del Master Spec

### Requirement: Tags visuales sin ruta pública
Los Tags de un Article SHALL mostrarse como elementos visuales, sin enlazar a una ruta pública de Tag en esta fase.

#### Scenario: Article con Tags asignados
- **WHEN** un Article tiene Tags asignados
- **THEN** se muestran visualmente, sin ser navegables a una página de Tag

Referencia: §34.4 del Master Spec
