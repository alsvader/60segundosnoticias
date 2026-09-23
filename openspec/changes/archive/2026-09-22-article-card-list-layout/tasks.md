## 1. Implementación

- [x] 1.1 En `src/components/editorial/article-card.tsx`, variante `compact`: `@container` en la tarjeta e imagen `w-28 @sm:w-40 @lg:w-56 shrink-0 self-stretch`.
- [x] 1.2 En `src/components/sections/home/latest-posts-section.tsx`, layout `list`: `grid grid-cols-1 gap-4 lg:grid-cols-2`.

## 2. Verificación

- [x] 2.1 `pnpm test` (typecheck, lint, importmap, unit) pasa.
- [x] 2.2 `graphify update .` refresca el grafo.
