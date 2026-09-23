## 1. Implementación

- [x] 1.1 En `src/components/editorial/article-metadata.tsx`, dejar la variante `detailed` solo con "Publicado {fecha}" y "{n} min de lectura"; quitar avatar, nombre del autor, `authorAvatar` e imports sin uso.
- [x] 1.2 En `src/app/(frontend)/[category]/[post]/page.tsx`, pasar solo `publishedAtLabel` y `readingTimeMinutes` a `ArticleMetadata` y quitar el render e import de `AuthorCard` (sin borrar el componente).

## 2. Verificación

- [x] 2.1 `pnpm test` (typecheck, lint, importmap, unit) pasa.
- [x] 2.2 `graphify update .` refresca el grafo.
