## Why

En desktop, al hacer click en la lupa del Header para expandir `HeaderSearch`, la navegación principal (`<nav aria-label="Principal">`) se desplaza hacia la izquierda. El Header es `flex justify-between` con tres hijos (logo · nav · grupo derecho) y el `<input>` de búsqueda vive dentro del flujo del grupo derecho: al expandirse pasa de `w-0` a `w-[clamp(120px,22vw,280px)]` más `mr-2`, el grupo derecho crece y `justify-between` redistribuye el espacio libre moviendo la nav. Es un layout shift visible en cada uso del buscador.

## What Changes

- En `Header`, la nav principal y `HeaderSearch` comparten una zona `relative flex-1`; la nav queda centrada en ella (`mx-auto`) en la misma posición que hoy. CTA y `MobileNav` siguen a la derecha.
- El `<input>` de `HeaderSearch` sale del flujo flex y se posiciona `absolute` sobre esa zona: expandido, cubre toda la navegación principal con fondo opaco ("modo búsqueda"), desde el inicio de la zona hasta la lupa; al colapsar, la nav reaparece intacta. Nunca quedan items del menú cortados a medias.
- La expansión se conserva: crece de derecha a izquierda desde el icono, con la misma duración (`--motion-normal`), placeholder y estilos.
- Sin cambios de comportamiento: el primer click solo revela, Escape limpia y devuelve el foco a la lupa, blur colapsa sin limpiar, submit vacío bloqueado, `aria-hidden`/`tabIndex` según estado.
- Fuera de alcance: rediseño del Header, `MobileNav`, la página `/buscar` y la lógica de búsqueda (Master Spec §36).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `site-shell`: expandir `HeaderSearch` no debe alterar la posición del logo ni de la navegación principal.

## Impact

- Código: `src/components/site/header.tsx` (estructura de la zona nav + búsqueda) y `src/components/site/header-search.tsx` (posicionamiento del input). Solo layout; `Header` sigue siendo Server Component.
- Tests: nuevo assertion e2e de estabilidad de la nav y de cobertura del input (Playwright, desktop); los snapshots `header-search-expanded-desktop.png` / `header-search-expanded-tablet.png` de `tests/e2e/visual.spec.ts` se regeneran. Unit tests de `header-search.test.tsx` sin cambios.
- Master Spec §54 (Header desktop: logo + search + menú); sin cambio al Master Spec.
