## Context

Ver proposal.md (Why). `Header` (`src/components/site/header.tsx`) es un Server Component con `Container` `flex items-center justify-between gap-4` y tres hijos: logo, nav y grupo derecho (`HeaderSearch`, CTA, `MobileNav`, `gap-2`). `HeaderSearch` (`src/components/site/header-search.tsx`) es el Client Component aislado; su `<input>` alterna ancho/padding/margen/opacidad con una transición CSS.

## Goals / Non-Goals

**Goals:** el layout de logo y nav es idéntico en ambos estados del buscador; expandido, el input cubre la nav completa.

**Non-Goals:** cambiar el comportamiento de teclado/foco, `MobileNav` o la estructura de datos del Header.

## Decisions

- **Zona compartida nav + búsqueda.** `Container` queda como `logo | grupo flex-1 (gap-2)`; dentro del grupo, una zona `relative flex flex-1 items-center gap-4` contiene la nav (`mx-auto`) y `HeaderSearch`, seguida de CTA y `MobileNav`. La nav conserva su posición: antes el espacio libre se repartía igual entre logo→nav y nav→lupa (`justify-between` + `gap-4`), y `mx-auto` + `gap-4` reproduce exactamente ese reparto. La separación lupa→CTA/MobileNav sigue siendo `gap-2`. El form lleva `ml-auto md:ml-0`: en móvil (nav oculta) empuja la lupa al extremo derecho; en desktop se anula, porque un segundo margen automático repartiría el espacio libre en tres y descentraría la nav (detectado al revisar snapshots; el test e2e comprueba que los huecos logo→nav y nav→lupa son iguales).
- **Input `absolute` contra la zona, no contra el form.** El `<form>` no es posicionado, así que el bloque contenedor del input es la zona. Expandido: `left-0` y `right-12` (botón `size-8` = 32px + `gap-4` = 16px), centrado vertical, `z-10`, fondo `--paper-50` opaco. Colapsado: `left-[calc(100%-3rem)]` (ancho 0 pegado a la lupa). Se transiciona `left` para conservar el crecimiento derecha→izquierda.
  - *Alternativa:* overlay parcial anclado a la lupa (`right-full`, ancho `clamp(120px,22vw,280px)`). Implementada primero y descartada al revisar los snapshots: en 1280px dejaba "PÁGINA DE FIXTUR…" cortado y en 768px tapaba solo parte del menú.
  - *Alternativa:* grid `1fr auto 1fr`. Solo mantiene la nav quieta mientras haya holgura y no resuelve el traslape. Descartada.
  - *Alternativa:* reservar siempre el ancho máximo del input. Desplaza la nav permanentemente. Descartada.
- **Sin cambios en el orden del DOM de `HeaderSearch`.** El input sigue antes del botón: orden de tabulación y `aria-*` intactos.

## Risks / Trade-offs

- [`right-12` acopla el input al tamaño del botón y al `gap-4` de la zona] → Comentario en código junto a la clase; el test e2e falla si el input pisa la lupa o no cubre la nav.
- [Foco oculto bajo el input (WCAG 2.4.11)] → Tabular fuera del input hacia la nav dispara el blur del form, que colapsa el buscador antes de que el foco llegue a un link tapado.
- [Móvil: el input ahora ocupa el espacio entre logo y lupa, más ancho que los 120px actuales] → Mejora la usabilidad; se valida con el test de no-scroll horizontal existente en 375px.
