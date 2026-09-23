## 1. Implementación

- [x] 1.1 En `src/components/site/header.tsx`: logo con `width/height` 100×100 y `h-14 w-auto max-w-[260px] object-contain md:h-[100px] md:drop-shadow-md`; `<Link>` con `shrink-0 relative z-10` y, solo con logo, `md:mt-2 md:self-start`; barra `h-[72px] md:h-[88px]`.
- [x] 1.2 En `src/components/site/footer.tsx`: logo con `width/height` 80×80 y `h-20 w-auto max-w-[240px] self-start object-contain`.
- [x] 1.3 En `src/components/content/article-aside.tsx`: offset sticky `lg:top-28`.

## 2. Verificación

- [x] 2.1 `pnpm test` (typecheck, lint, importmap, unit) pasa.
- [x] 2.2 `graphify update .` refresca el grafo.
