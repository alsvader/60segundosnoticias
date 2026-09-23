## Why

`BannerSection` (`src/components/sections/banner-section.tsx`) es hoy un único `<div>` con borde y esquinas redondeadas, sin `<section>`, sin `Container` y sin padding vertical propio. En Home se renderiza como hijo directo de `<main>`, por lo que la tarjeta se estira de borde a borde del viewport sin los gutters del sitio y su contenido no se alinea con el resto de las secciones. Además su jerarquía visual (título `type-h3`, CTA de 32px, miniatura fija `sm:w-64`) lo hace parecer un aviso genérico y no una pausa editorial con una acción clara, y la variante `editorial` usa el mismo tono que el fondo de la página (`paper-100` = `--background`), así que sin borde desaparece.

El Banner es un CTA promocional **interno** de 60 Segundos (vlogs, experiencias, secciones nuevas, boletín). No es publicidad de terceros: ese será un componente independiente y posterior.

## What Changes

- `BannerSection` adopta el patrón de las demás Home Sections: contenedor exterior `<section>` de ancho completo que lleva el fondo de la variante, y contenedor interior `Container` (mismo `--container-max` y `--container-gutter` que el resto del Home) para título, descripción, CTA e imagen.
- Composición automática según el contenido, sin campo nuevo: sin imagen → composición centrada; con imagen → dos columnas en `lg+` (texto + CTA a la izquierda, imagen a la derecha), apilada en móvil/tablet.
- Nueva jerarquía visual: título `type-h2` en mayúsculas (Oswald) con marca roja decorativa, descripción `type-lead`, CTA principal con el `Button` de shadcn a 44px de alto, etiqueta en mayúsculas e icono de flecha (Lucide).
- Las variantes existentes `editorial | promotional | dark` se conservan con un tratamiento visual nuevo; `editorial` deja de confundirse con el fondo de la página.
- En Pages, `BannerSection` se renderiza en modo `contained` (tarjeta redondeada con el mismo tratamiento visual, sin `Container` propio), porque la ruta de Pages ya envuelve todos los blocks en un `Container`.
- Admin de Payload: solo etiquetas y descripciones de ayuda de los campos existentes (`link` → "Botón (CTA)", ayuda en `image` y `variant`). **Sin cambios de esquema ni migración.**
- El fixture e2e del Home incluye un Banner para que las pruebas visuales, responsive y de accesibilidad lo cubran.

Fuera de alcance:

- Cualquier funcionalidad de publicidad pagada (anunciantes, campañas, métricas, formatos IAB): será un componente separado.
- Nuevos campos en el esquema de `Banner` (eyebrow, selector de composición, imagen decorativa, textura seleccionable).
- Reestructurar la ruta de Pages para que cada sección maneje su propio `Container` (opción C descartada, ver `design.md`).
- Cambios en otros Home Blocks o en `HomeBlockRenderer`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `home-sections`: `BannerSection` en Home pasa a ser una sección de fondo a ancho completo con contenido alineado al `Container` del sitio, composición según presencia de imagen y CTA principal accesible; el contrato compartido con Pages admite la diferencia de ancho del fondo.
- `page-content-rendering`: el Banner de Page sigue usando el mismo `BannerSection`, en modo contenido (tarjeta) dentro del `Container` de la Page.

## Impact

- Código: `src/components/sections/banner-section.tsx` (reescritura presentacional), `src/components/sections/pages/page-block-renderer.tsx` (pasa `layout="contained"`), `src/payload/blocks/shared/Banner.ts` (solo `label`/`admin.description`).
- `resolve-home-blocks.ts` (`resolveBanner()`) solo pasa además `width`/`height` de la imagen para mostrarla con su proporción original. Sin cambios en `home-block-renderer.tsx` ni migraciones; `payload-types.ts` solo recibe los comentarios JSDoc de `admin.description`. `BannerData` gana campos opcionales y el contenido existente sigue siendo compatible.
- Tests: nuevo `src/components/sections/banner-section.test.tsx`; `tests/fixtures/builders.ts` agrega un Banner al Home e2e; se regenera el snapshot `home-desktop` de `tests/e2e/visual.spec.ts`; `responsive.spec.ts` y `a11y.spec.ts` lo cubren sin cambios de lógica.
- Master Spec: §26 (BannerBlock, sin cambio de campos), §49 (texturas), §53 (responsive), §59/§60 (Home/Page Sections, `BannerSection` compartido). Sin cambio al Master Spec. Trazabilidad: AC-HOME-014, AC-RESP-001/002/006, AC-A11Y-003/004/005/007/008.
