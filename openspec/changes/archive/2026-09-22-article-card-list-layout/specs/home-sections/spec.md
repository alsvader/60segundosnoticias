## MODIFIED Requirements

### Requirement: LatestPostsSection consulta automáticamente por fecha de publicación
`LatestPostsBlock` SHALL ser siempre de resolución automática, configurable con `title`, `limit` (por defecto aproximadamente 6), `category` (opcional) y `layout: grid | list | mixed`. Cuando `category` no está configurada, SHALL mostrar los Posts publicados más recientes de cualquier categoría, ordenados por `publishedAt` descendente.

#### Scenario: LatestPosts sin categoría configurada
- **WHEN** `LatestPostsBlock` no tiene `category` configurada
- **THEN** `LatestPostsSection` muestra los Posts publicados más recientes de cualquier categoría, hasta `limit`

#### Scenario: LatestPosts con categoría configurada
- **WHEN** `LatestPostsBlock` tiene `category` configurada
- **THEN** `LatestPostsSection` solo muestra Posts publicados que pertenecen a esa categoría

#### Scenario: LatestPosts con layout list en desktop
- **WHEN** `LatestPostsBlock` usa `layout: list` y el viewport es de desktop (`lg` o mayor)
- **THEN** `LatestPostsSection` distribuye las tarjetas `compact` en 2 columnas, sin estirar cada tarjeta a todo el ancho del contenedor; en viewports menores usa 1 columna

Referencia: AC-HOME-010, §22 del Master Spec
