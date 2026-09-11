# article-sidebar Specification

## Purpose

Muestra un aside con un listado de posts en formato `compact` junto al contenido del Article, en vez de dejar espacio vacío a los lados de la columna de lectura en pantallas anchas. Controlado globalmente (no por Post) para que un administrador no tenga que configurarlo en cada artículo, y pensado como el mismo espacio donde una fase futura (fuera de este alcance) agregará una opción de anuncios.

## Requirements

### Requirement: Control global vía Payload Global
El sistema SHALL exponer un Payload Global (`ArticleSidebar`) que controla el aside para todos los Articles a la vez — nunca un campo por Post.

#### Scenario: Cambio de configuración afecta todos los Articles
- **WHEN** un administrador cambia la configuración del Global `ArticleSidebar`
- **THEN** el cambio se refleja en todas las páginas de Article, sin necesidad de editar cada Post

Referencia: AC-ASIDE-001

### Requirement: Modos de selección de posts
El sistema SHALL soportar tres modos configurables para el listado del aside: `latest` (últimos posts del sitio), `newest-per-category` (un post, el más reciente, por cada categoría) y `featured` (posts marcados con el campo `featured` de Posts). El heading del aside SHALL tener un texto automático según el modo elegido, sobreescribible por un campo de texto opcional. El número de posts mostrados SHALL ser configurable dentro de un rango razonable.

#### Scenario: Modo latest
- **WHEN** el Global tiene `postsPanel.mode: latest`
- **THEN** el aside muestra los posts más recientes del sitio, sin filtrar por categoría

#### Scenario: Modo newest-per-category
- **WHEN** el Global tiene `postsPanel.mode: newest-per-category`
- **THEN** el aside muestra como máximo un post por categoría, el más reciente de cada una

#### Scenario: Modo featured
- **WHEN** el Global tiene `postsPanel.mode: featured`
- **THEN** el aside muestra únicamente Posts con `featured: true`

#### Scenario: Heading personalizado
- **WHEN** el Global tiene un `postsPanel.heading` no vacío
- **THEN** el aside usa ese texto en vez del título automático del modo

Referencia: AC-ASIDE-002

### Requirement: El post actual nunca aparece en su propio aside
El listado del aside SHALL excluir siempre el Post que se está viendo, para cualquier modo.

#### Scenario: Post actual excluido
- **WHEN** el Post que se está viendo también calificaría para el modo configurado (p. ej. es uno de los más recientes)
- **THEN** no aparece en el listado del aside de su propia página

Referencia: AC-ASIDE-004

### Requirement: Layout de 2 columnas sticky, mobile-first
Cuando el aside tiene posts para mostrar, el contenido del Article y el aside SHALL desplegarse en 2 columnas (contenido con la mayoría del ancho, aside el resto) a partir del breakpoint `lg`, y SHALL apilarse en una sola columna (contenido primero) por debajo de ese breakpoint. Desde `lg` en adelante, el aside SHALL quedar fijo (`sticky`) en pantalla mientras el contenido continúa el scroll, liberándose de forma natural al terminar el contenido. Cuando el aside está deshabilitado o no tiene posts, el contenido SHALL volver a su columna centrada de ancho de lectura (`70ch`), sin dejar una columna vacía.

#### Scenario: Desktop con aside habilitado
- **WHEN** se visita un Article en una pantalla `lg` o más ancha, con el aside habilitado y con posts
- **THEN** el contenido y el aside se muestran en 2 columnas, y el aside permanece fijo en pantalla mientras se hace scroll por el contenido

#### Scenario: Mobile
- **WHEN** se visita un Article en una pantalla angosta (por debajo de `lg`)
- **THEN** el aside se muestra apilado debajo del contenido, sin ningún comportamiento sticky

#### Scenario: Aside deshabilitado o sin posts
- **WHEN** el Global tiene `postsPanel.enabled: false`, o el modo configurado no produce ningún post
- **THEN** el contenido del Article vuelve a su columna centrada de `70ch`, sin espacio vacío donde habría estado el aside

Referencia: AC-ASIDE-003
