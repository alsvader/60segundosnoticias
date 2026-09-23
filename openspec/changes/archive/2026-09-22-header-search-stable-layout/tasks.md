## 1. Implementación

- [x] 1.1 En `src/components/site/header.tsx`: `Container` → `logo | grupo flex-1 gap-2`; zona `relative flex flex-1 items-center gap-4` con la nav (`mx-auto`) y `HeaderSearch`; CTA y `MobileNav` después. Verificar que la nav no cambia de posición respecto a `main` (test 2.1).
- [x] 1.2 En `src/components/site/header-search.tsx`: `<form>` sin posicionar; `<input>` `absolute right-12 top-1/2 -translate-y-1/2 z-10`, expandido `left-0` y colapsado `left-[calc(100%-3rem)]`, transición de `left`/padding/opacidad. Verificar que `header-search.test.tsx` pasa sin cambios (`pnpm test:unit`).

## 2. Tests

- [x] 2.1 Añadir en `tests/e2e/responsive.spec.ts` un test en 768px, 1024px y 1440px que mide el `boundingBox()` de `navigation "Principal"` y del link del logo antes y después de `expandHeaderSearch()` (y tras Escape) y exige que no cambien, y que el input expandido cubre horizontalmente la nav sin pisar la lupa. Verificar que pasa en chromium y falla sin el fix.
- [x] 2.2 Regenerar `header-search-expanded-desktop.png` y `header-search-expanded-tablet.png` (`pnpm test:visual --update-snapshots`) y revisar las imágenes: input expandido cubre toda la nav y termina junto a la lupa. (baselines `-darwin`; las `-linux` se regeneran desde el job `visual` de `release.yml`, ver `docs/TESTING.md`).
- [x] 2.3 Correr `pnpm test:a11y` para el estado expandido de HeaderSearch sin nuevas violaciones.

## 3. Verificación

- [x] 3.1 `pnpm test` (typecheck, lint, importmap, unit) pasa.
- [x] 3.2 `graphify update .` refresca el grafo.
