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
La página de Article SHALL incluir, en este orden: breadcrumb, categoría, H1, excerpt/lead, metadata del artículo, acciones de compartir, imagen destacada, contenido del artículo, tags, acciones de compartir, author card y related posts.

#### Scenario: Article publicado con todos los campos
- **WHEN** se renderiza un Article publicado con excerpt, imagen destacada, tags y autor
- **THEN** cada elemento aparece en el orden especificado

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

### Requirement: Author Card con datos públicos, sin ruta de autor
El Author Card SHALL mostrar únicamente datos públicos del autor (`displayName`, `avatar`, `bio`, `socialLinks` cuando existan) y SHALL nunca exponer `email`, `role`, `active` ni ningún dato de autenticación. El nombre/slug del autor SHALL NOT enlazar a una ruta `/autor/[slug]`, ya que esa ruta no existe en esta fase.

#### Scenario: Autor con bio y redes sociales
- **WHEN** el autor de un Post tiene `bio` y `socialLinks` configurados
- **THEN** el Author Card los muestra

#### Scenario: Datos privados nunca expuestos
- **WHEN** se renderiza el Author Card de cualquier Post
- **THEN** el HTML resultante nunca contiene `email`, `role`, `active` ni datos de autenticación del autor

#### Scenario: Sin enlace a ruta de autor
- **WHEN** se renderiza el Author Card
- **THEN** el nombre/slug del autor no es un enlace navegable a una página de autor

Referencia: AC-AUTHOR-001, AC-AUTHOR-002

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
