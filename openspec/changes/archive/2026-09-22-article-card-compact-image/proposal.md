## Why

En la variante `compact` de `ArticleCard` (listas de la home y aside del artículo), la imagen mide unos 112×63 px, va centrada y con padding, y se ve diminuta junto al badge, el título y la metadata. La imagen debe ocupar todo el alto de la tarjeta.

## What Changes

- En la variante `compact`, la imagen queda a sangre en el lado izquierdo y se estira al alto completo de la tarjeta (`self-stretch`), con ancho fijo (`w-28`, `sm:w-32`) y recorte `object-cover` sin deformación. El `aspect-ratio` 16:9 solo actúa como alto mínimo.
- El padding pasa de la tarjeta al bloque de texto para conservar el respiro visual. Sin imagen, el texto mantiene padding en los cuatro lados.
- Sin cambios: la variante `default` y `ResponsiveMedia`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `editorial-components`: la imagen de la variante `compact` de `ArticleCard` ocupa todo el alto de la tarjeta.

## Impact

- Código: `src/components/editorial/article-card.tsx`.
- Tests: sin cambios en unit tests. Los snapshots visuales de la home y del Article (`tests/e2e/visual.spec.ts`) pueden requerir actualización.
