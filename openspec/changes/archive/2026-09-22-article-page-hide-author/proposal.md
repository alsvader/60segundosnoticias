## Why

En la página de una noticia, la fila de metadata bajo el título y el excerpt muestra el avatar del autor, "Por {autor}", la fecha de publicación y el tiempo de lectura, y al final del artículo aparece además el Author Card. Editorialmente se decidió no mostrar la autoría en la página de la noticia: la fila de metadata debe quedar solo con la fecha de publicación y el tiempo estimado de lectura, y el Author Card no debe mostrarse.

## What Changes

- La variante `detailed` de `ArticleMetadata` (solo la usa la página de Article) muestra únicamente "Publicado {fecha}" y "{n} min de lectura". Se quitan el avatar y el nombre del autor, y `authorAvatar` sale de `ArticleMetadataData`.
- La página de Article deja de renderizar el `AuthorCard`. El componente `src/components/content/author-card.tsx` se conserva sin cambios para uso futuro.
- Sin cambios: la variante `inline` de `ArticleMetadata` (cards y hero siguen mostrando "autor · fecha · lectura") y el autor en el JSON-LD `NewsArticle`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `article-page`: la composición ya no incluye el Author Card; la metadata del artículo muestra solo fecha de publicación y tiempo de lectura. Se retira el requirement del Author Card.

## Impact

- Código: `src/components/editorial/article-metadata.tsx`, `src/app/(frontend)/[category]/[post]/page.tsx`.
- Tests: sin cambios en unit tests. Los snapshots visuales de la página de Article (`tests/e2e/visual.spec.ts`) pueden requerir actualización.
- Master Spec: §34 (composición del Article). Desviación intencional: no se muestra autoría en la página de la noticia.
