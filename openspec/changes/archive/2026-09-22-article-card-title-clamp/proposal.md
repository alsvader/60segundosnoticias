## Why

Las noticias con títulos muy largos hacen que `ArticleCard` crezca sin límite: el `<h3>` no tiene truncado (el excerpt sí usa `line-clamp-2`). En la variante `compact` el efecto es peor, porque la imagen ocupa todo el alto de la tarjeta (`self-stretch`) y cada línea extra del título la estira verticalmente. Se nota sobre todo en el aside de la página de noticia y en las listas de la home.

## What Changes

- El título de `ArticleCard` se trunca visualmente con elipsis: máximo 3 líneas en `default` y 2 líneas en `compact` (`line-clamp`).
- El bloque de texto recibe `min-w-0` y el título `break-words`, para que palabras o URLs largas no desborden horizontalmente.
- El título completo permanece en el DOM (lectores de pantalla, SEO).
- Sin cambios: `ResponsiveMedia`, `ArticleAside` ni los consumidores; todos heredan el ajuste.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `editorial-components`: el título de `ArticleCard` tiene un máximo de líneas por variante.

## Impact

- Código: `src/components/editorial/article-card.tsx`.
- Tests: sin cambios en unit tests. Los snapshots visuales (`tests/e2e/visual.spec.ts`) pueden requerir actualización si los fixtures tienen títulos largos.
