## Why

En `LatestPostsBlock` con `layout: list`, cada `ArticleCard` `compact` ocupa todo el ancho del `Container` (hasta 1400 px) y la imagen queda fija en 112–128 px. Las tarjetas se ven estiradas y la imagen diminuta.

## What Changes

- El layout `list` de `LatestPostsSection` pasa de una columna flex a un grid de 1 columna, y de 2 columnas desde `lg`. Así las tarjetas no se estiran a todo el ancho en desktop.
- En la variante `compact`, el ancho de la imagen depende del ancho de la propia tarjeta (container query `@container`), no del viewport: 112 px (`w-28`) por defecto, 160 px (`@sm:w-40`) desde 384 px de tarjeta y 224 px (`@lg:w-56`) desde 512 px. Las columnas laterales angostas conservan una miniatura; las filas anchas de la lista muestran una imagen más grande.
- Sin cambios: la variante `default`, `ResponsiveMedia` y el resto de los layouts.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `editorial-components`: el ancho de la imagen `compact` de `ArticleCard` se adapta al ancho de la tarjeta.
- `home-sections`: el layout `list` de `LatestPostsSection` limita el ancho de las tarjetas con 2 columnas en desktop.

## Impact

- Código: `src/components/editorial/article-card.tsx`, `src/components/sections/home/latest-posts-section.tsx`.
- Tests: sin cambios en unit tests. Los snapshots visuales (`tests/e2e/visual.spec.ts`) pueden requerir actualización.
