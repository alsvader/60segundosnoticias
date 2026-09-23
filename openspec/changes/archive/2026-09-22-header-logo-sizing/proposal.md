## Why

Al configurar un logo en el Global `Navigation`, el Header lo muestra enorme y pegado a la barra superior. `Header` renderizaba `next/image` con `width={140} height={32}` y sin clases; el logo aprobado (`public/branding/logo.svg`) es un badge circular 1:1 (1254×1254), y el preflight de Tailwind (`img { height: auto }`) respeta el ancho y calcula la altura por proporción → ~140×140px dentro de una barra de 64px (móvil) / 80px (desktop). El Footer tenía el mismo defecto (~120×120px).

## What Changes

- La barra del Header sube a 72px en móvil (`h-[72px]`) y 88px en desktop (`md:h-[88px]`), dentro del rango del Master Spec §54.
- El logo del Header se dimensiona por **altura**: `h-14` (56px) en móvil y `md:h-[100px]` (100px) en desktop, `w-auto`, `max-w-[260px]` y `object-contain`. En móvil queda centrado dentro de la barra. En desktop el badge se ancla arriba (`md:mt-2 md:self-start`) y **sobresale ~20px por debajo del borde inferior**, como un sello, con `md:drop-shadow-md` y `z-10` para quedar sobre el contenido. Si no hay logo, el texto de `siteName` sigue centrado.
- `ArticleAside` ajusta su offset sticky a `lg:top-28` para no quedar bajo el Header más alto.
- `width`/`height` intrínsecos pasan a 100×100 en el Header y 80×80 en el Footer (proporción real del asset) para reservar espacio sin CLS. El `<Link>` del logo recibe `shrink-0`.
- El logo del Footer sigue el mismo patrón: `h-20`, `w-auto`, `max-w-[240px]`, `object-contain`, `self-start`.
- Sin cambios: el logo en sí (`docs/ASSETS.md`), la data del layout.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `site-shell`: el logo de Header y Footer se escala por altura dentro de su contenedor, conservando su proporción.

## Impact

- Código: `src/components/site/header.tsx`, `src/components/site/footer.tsx`, `src/components/content/article-aside.tsx`.
- Tests: sin cambios en unit tests. Los snapshots visuales (`tests/e2e/visual.spec.ts`) pueden requerir actualización si los fixtures incluyen logo.
