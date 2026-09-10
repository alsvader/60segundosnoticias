## Why

Las Fases 0-3 (`bootstrap-technical-foundation`, `payload-cms-core`, `editorial-workflow`) dejaron operativo el núcleo técnico y el CMS, pero el frontend público (`src/app/(frontend)/`) sigue siendo el boilerplate de Next.js/shadcn sin personalizar: `globals.css` conserva la paleta neutra `oklch` genérica de shadcn (incluyendo un modo oscuro no deseado), no existen tokens de marca, tipografía editorial, primitivos de layout ni componentes reutilizables. Antes de construir Home/Categoría/Artículo (Fase 5+) se necesita el lenguaje visual y la base de componentes de la Fase 4 — `docs/60-segundos-spec.md` §43-52 y §82 (Fase 4).

## What Changes

- Sustituir los tokens shadcn genéricos en `src/app/globals.css` por los Design Tokens del Master Spec (`brand-red`, `ink`, `paper`, `border`, semánticos) vía `@theme`, como única fuente de verdad (sin duplicar valores en JS/componentes).
- **BREAKING** (solo visual, sin consumidores actuales): remapear los slots semánticos de shadcn (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, etc.) al sistema editorial y **eliminar el bloque `.dark` / `@custom-variant dark`** — no hay modo oscuro en V1.
- Integrar Oswald (display/editorial) e Inter (body/UI) vía `next/font/google`, expuestas como variables de fuente consumidas por `@theme`.
- Introducir el sistema de category theme basado en `data-cat-theme="<key>"` (no clases Tailwind interpoladas dinámicamente), mapeando las 10 keys ya existentes en `CATEGORY_THEME_KEYS` a `--cat-accent`, `--cat-accent-fg`, `--cat-soft`, `--cat-soft-fg`, `--cat-border`, con foreground de contraste explícito por tema (no asumir blanco).
- Exponer `paper-grain.webp` y `newspaper-pattern.webp` como utilidades/clases reutilizables de fondo (sin construir Hero ni secciones de Home).
- Re-tematizar `Button` (ya existente) con los nuevos tokens; añadir únicamente los primitivos shadcn con consumidor real dentro de esta change.
- Crear primitivos de layout (`Container`) y componentes editoriales presentacionales: `CategoryBadge`, `CategoryCard`, `ArticleCard` (contrato `ArticleCardData`, sin Payload), `ArticleMetadata`, `SectionHeader`, `Breadcrumbs`, `Pagination`, `ResponsiveMedia`.
- Establecer fundamentos de accesibilidad (focus visible, touch target 44px, contraste por category theme, `prefers-reduced-motion`) y tokens de motion (`fast/normal/slow`) usando `tw-animate-css` ya instalado.
- Documentar el sistema en `docs/DESIGN-SYSTEM.md`.

## Capabilities

### New Capabilities

- `design-tokens`: tokens de color (brand/ink/paper/border/semantic), radius y spacing como `@theme` en `globals.css`; remapeo de slots shadcn; eliminación del modo oscuro.
- `typography-system`: carga de Oswald/Inter vía `next/font`, escala tipográfica y reglas de uso mayúsculas/minúsculas del Master Spec.
- `layout-primitives`: `Container` y fundamentos responsivos (breakpoints, gutters, ancho de artículo/canvas).
- `category-theme-system`: mapeo `data-cat-theme` → variables CSS por las 10 keys, con foreground de contraste explícito por tema.
- `texture-foundation`: utilidades reutilizables para `paper-grain.webp` y `newspaper-pattern.webp` sin construir secciones de página.
- `shadcn-primitives`: política de instalación incremental de shadcn, re-tematización de `Button`, prohibición de `shadcn add --all`.
- `editorial-components`: `CategoryBadge`, `CategoryCard`, `ArticleCard` (foundation), `ArticleMetadata`, `SectionHeader`, `Breadcrumbs`, `Pagination`, `ResponsiveMedia` — todos presentacionales, sin acceso a Payload.
- `accessibility-foundation`: foco visible, touch target, contraste por tema, reduced motion, alt contract de `ResponsiveMedia`.

### Modified Capabilities

Ninguna. `categories-collection` (CMS) ya expone `colorTheme`/`icon` como keys controladas desde Fase 2; esta change solo agrega consumo frontend, sin cambiar el comportamiento del CMS.

## Impact

- `src/app/globals.css`: reescritura completa de tokens (brand/ink/paper/border/semantic, fuentes, remapeo de slots shadcn, eliminación de `.dark`).
- `components.json`: sin cambios estructurales (mantiene `style`, `baseColor`, `cssVariables`); posibles primitivos nuevos generados bajo `src/components/ui/`.
- `src/components/ui/button.tsx`: sin reescritura, solo efecto de retematización vía variables CSS. Otros primitivos shadcn solo si un componente de esta change los consume realmente.
- Nuevos: `src/components/layout/Container.tsx`, `src/components/editorial/*.tsx`, módulo de mapeo de category theme (fuera de `src/payload/`), módulo de mapeo icon-key → Lucide.
- `src/lib/constants/category-theme-keys.ts` y `category-icon-keys.ts`: sin cambios (permanecen framework-neutral, consumidos por Payload y por el nuevo módulo frontend).
- `docs/DESIGN-SYSTEM.md`: nuevo documento.
- Sin nuevas dependencias de runtime (usa Tailwind v4, CVA, Lucide, radix-ui, shadcn y `tw-animate-css` ya instalados).
- Fuera de alcance: Header/Footer/Navigation reales, Home y sus bloques, páginas de Categoría/Artículo/Page, DAL/View Models (Fase 5), Draft Mode/SEO/cache (Fase 8), búsqueda (Fase 9). No se implementa código de aplicación en este documento — solo se planifica.
