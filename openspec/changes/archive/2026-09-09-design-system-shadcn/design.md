## Context

Ver `proposal.md` - Why. Estado actual confirmado por inspección directa (Graphify + lectura de archivos), Fases 0-3 ya archivadas:

- `src/app/globals.css` es el output sin modificar del CLI de shadcn: paleta `oklch` neutra, bloque `.dark` completo, `@theme inline` que solo mapea los slots semánticos de shadcn (`--color-primary`, `--color-border`, etc.) a variables `oklch` genéricas. Cero tokens de marca, cero fuentes declaradas (`--font-sans` cae al default del sistema).
- `globals.css` **solo se importa desde `src/app/(frontend)/layout.tsx`**; el layout de Payload Admin (`src/app/(payload)/layout.tsx`) no lo importa. Retematizar `globals.css` no tiene blast radius sobre el panel de administración de Payload.
- `components.json`: `style: "radix-nova"`, `baseColor: "neutral"`, `cssVariables: true`, `prefix: ""`, `iconLibrary: "lucide"`. Único primitivo generado: `Button` (`src/components/ui/button.tsx`), ya construido sobre `radix-ui` (`Slot.Root`) y `class-variance-authority`, y ya consumiendo slots semánticos (`--primary`, `--border`, `--radius`) en vez de valores hardcodeados — retematizar `globals.css` re-tematiza `Button` sin tocar su código.
- `src/lib/constants/category-theme-keys.ts` (10 keys) y `category-icon-keys.ts` (6 keys: `newspaper, video, plane, star, popcorn, dots`) ya existen, son framework-neutral (sin imports de React/Tailwind), y ya son consumidos por `Categories.ts` con imports relativos y extensión `.ts` explícita — disciplina de compatibilidad con el CLI de Payload documentada en `editorial-workflow/design.md` (Fase 3, archivada). Este change reutiliza ambos archivos tal cual; no los modifica.
- No existe `tailwind.config.*` — Tailwind v4 se configura 100% vía CSS (`@theme` en `globals.css`). No hay una segunda fuente de tokens que reconciliar.
- Dependencias ya instaladas y suficientes para este change: `tailwindcss@4`, `class-variance-authority`, `radix-ui`, `lucide-react`, `tw-animate-css`, `shadcn` CLI. No hay librería de fuentes, `next-themes`, Framer Motion ni GSAP.
- `docs/references/home-reference.jpeg` confirma visualmente el patrón de `CategoryCard` (icono plano grande por categoría, superficie paper/blanca, nombre en mayúsculas, línea de acento del color de la categoría, sin card saturada de color) y el patrón de navegación/CTA (uppercase, rojo de marca, subrayado rojo en el item activo).

## Goals / Non-Goals

**Goals:**
- Una sola fuente de tokens visuales (`globals.css`), sin valores duplicados en componentes o en un archivo JS de tokens paralelo.
- Un mecanismo de category theme compatible con el escaneo estático de clases de Tailwind v4 (que no puede resolver `` `bg-${theme}-500` `` en runtime).
- Componentes editoriales 100% presentacionales, verificables como tales por inspección (sin import de Payload, sin `fetch`).
- Cero dependencias nuevas de runtime.
- Eliminar el modo oscuro heredado de la inicialización de shadcn, no solo dejarlo sin usar.

**Non-Goals:**
- No se implementa Header/Footer/Navigation reales, Home, páginas de Categoría/Artículo/Page (Fase 5+).
- No se implementa la Data Access Layer ni los View Models (Fase 5); `ArticleCard` se diseña contra un contrato propio (`ArticleCardData`) que Fase 5 deberá poblar, pero ese poblamiento no ocurre en este change.
- No se decide aquí la solución final de Header/Nav que consumirá primitivos interactivos de shadcn (`Sheet`, `NavigationMenu`, etc.) — quedan fuera por falta de consumidor real en este change.
- No se re-vectoriza el logo ni se sustituyen los assets de `public/branding/`.

## Decisions

### D1: Tokens como variables CSS en `@theme`, sin archivo de tokens en JS
Se define `--brand-red*`, `--ink*`, `--paper*`, `--border-*`, `--success/warning/error/info`, `--font-display` (Oswald), `--font-body` (Inter) directamente en `src/app/globals.css`, y se remapean los slots semánticos de shadcn (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--radius`, etc.) a estos tokens dentro del mismo `@theme inline` ya existente.

Alternativa considerada: un módulo TypeScript (`design-tokens.ts`) exportando los valores y generando las variables CSS en build time. Rechazada — Tailwind v4 ya está diseñado para configuración 100% CSS-first (no existe `tailwind.config.*` en el proyecto); introducir una fuente JS duplicaría el sistema de tokens y complicaría el import framework-neutral que Payload requiere en `category-theme-keys.ts`.

### D2: Category theme via `data-cat-theme`, no clases Tailwind dinámicas
Cada category theme key define un bloque de variables CSS bajo un selector de atributo:

```css
[data-cat-theme="red"]    { --cat-accent: var(--brand-red-500); --cat-accent-fg: white; --cat-soft: var(--brand-red-50); --cat-soft-fg: var(--brand-red-700); --cat-border: var(--brand-red-100); }
[data-cat-theme="yellow"] { --cat-accent: ...; --cat-accent-fg: var(--ink-950); --cat-soft: ...; --cat-soft-fg: ...; --cat-border: ...; }
/* ...resto de las 10 keys */
```

Los componentes consumen `var(--cat-accent)` vía la sintaxis de valor arbitrario de Tailwind (`bg-[var(--cat-accent)]`) o `style` inline, y marcan el elemento raíz con `data-cat-theme={theme}`. Un módulo TS pequeño (fuera de `src/payload/`) mapea `CategoryThemeKey` → foreground esperado, usado solo para tests/documentación de contraste, no para generar las reglas CSS en runtime.

Alternativa considerada: safelist de Tailwind (`safelist: [...]` listando todas las clases `bg-red-500`, `bg-blue-500`, etc.). Rechazada — Tailwind v4 ya no usa `tailwind.config.js`/safelist de la misma forma, y mantener una lista de 10 categorías × 5 slots de color en un safelist es más frágil y menos legible que 10 bloques CSS explícitos con foreground documentado por key.

Alternativa considerada: color inline vía prop (`style={{ '--cat-accent': hexValue }}`) resuelto en un objeto JS de mapeo consumido directamente por los componentes. Rechazada por el usuario — el mapeo debe vivir en CSS, no en un objeto de estilos inline generado en cada componente, para mantener una sola fuente de verdad visual y permitir auditar contraste por selector.

### D3: Mapeo de category icon key → Lucide en un módulo frontend dedicado
`category-icon-keys.ts` (consumido por Payload) permanece framework-neutral. Un módulo nuevo, por ejemplo `src/components/editorial/category-icon-map.tsx`, mapea cada `CategoryIconKey` (`newspaper, video, plane, star, popcorn, dots`) a su componente Lucide (`Newspaper`, `Video`, `Plane`, `Star`, `PartyPopper`/ícono equivalente disponible en la versión instalada de `lucide-react`, `MoreHorizontal` para `dots`). Este módulo es el único punto que importa simultáneamente la constante de Payload y Lucide.

Alternativa considerada: guardar el nombre del icono Lucide directamente en el campo `icon` de Payload. Rechazada — acoplaría el schema del CMS a nombres de componente de una librería de UI, violando la regla de mantener las constantes de Payload framework-neutral.

### D4: `ArticleCard` contra un contrato `ArticleCardData`, no contra `Post`
Se define una interfaz `ArticleCardData` (título, excerpt, imagen + alt, categoría con `name`/`colorTheme`/`icon`, fecha, reading time, href) en una ubicación puramente frontend (por ejemplo `src/components/editorial/article-card.tsx` o un archivo de tipos hermano). `ArticleCard` solo importa este contrato. La transformación real de un `Post` de Payload hacia `ArticleCardData` es responsabilidad de la Data Access Layer/View Models de Fase 5 y no se implementa en este change.

Alternativa considerada: tipar `ArticleCard` directamente con `Post` de `payload-types.ts`. Rechazada — acoplaría un componente presentacional de Fase 4 al schema generado del CMS, y contradice explícitamente "presentational components do not query/depend on Payload" (`AGENTS.md`) y la resolución del usuario sobre el límite de `ArticleCard`.

### D5: Instalación incremental de primitivos shadcn
Se re-tematiza `Button` (sin tocar su código, solo vía tokens). No se instala ningún primitivo shadcn adicional salvo que un componente editorial de este mismo change lo consuma de forma demostrable. En la exploración previa se había propuesto instalar `Input/Textarea/Label/Skeleton/Avatar` de forma anticipada; el usuario resolvió diferir esos primitivos hasta que el diseño final de un componente de esta change los requiera realmente. Si, durante la implementación, ningún componente de esta lista termina necesitando un primitivo nuevo, esta change no instala ninguno adicional a `Button`.

### D6: Eliminación explícita del modo oscuro
Se elimina el bloque `.dark` y el `@custom-variant dark` de `globals.css`. No se instala `next-themes` ni se crea un theme provider. Si el CLI de shadcn regenera un primitivo con clases `dark:`, esas clases se eliminan al integrarlo, no se dejan inertes.

### D7: Fuentes vía `next/font/google`, sin librería de gestión de fuentes
Oswald e Inter se cargan con `next/font/google` en `src/app/(frontend)/layout.tsx` (o un módulo `fonts.ts` hermano), exponiendo `variable: '--font-display'` y `variable: '--font-body'` respectivamente, consumidos por `@theme` en `globals.css`. No se añade `next-google-fonts` ni ninguna librería equivalente.

## Risks / Trade-offs

- **[Riesgo] Purga de Tailwind v4 sobre clases de color dinámicas** → Mitigado por D2 (variables CSS + `data-cat-theme`, ninguna clase de color se interpola en runtime).
- **[Riesgo] Contraste insuficiente en themes claros (yellow/green/cyan)** → Mitigado por definir `--cat-accent-fg`/`--cat-soft-fg` explícitos por key (no default blanco) y por el requisito de accessibility-foundation que exige verificar contraste para esos tres themes específicamente.
- **[Riesgo] Acoplar componentes presentacionales al schema de Payload por conveniencia** → Mitigado por D4 (`ArticleCardData` propio) y por el requisito explícito en `editorial-components` de que ningún componente importe Payload.
- **[Riesgo] Que un futuro primitivo shadcn reintroduzca clases `dark:`** → Mitigado por D6 (eliminación activa, no solo ausencia de uso) y por el requisito en `shadcn-primitives` que exige auditar cada primitivo instalado.
- **[Trade-off] No instalar `Input/Textarea/Label/Skeleton/Avatar` ahora** → Si Fase 5 los necesita antes de lo previsto, esa fase los instala bajo la misma disciplina incremental; se acepta el costo de una instalación adicional más adelante a cambio de no anticipar dependencias sin consumidor.
- **[Trade-off] `ArticleCard` sin datos reales en este change** → No es demostrable con contenido real hasta Fase 5; se acepta validar `ArticleCard` con datos de ejemplo/fixtures locales en desarrollo, no con Payload.

## Migration Plan

1. Reescribir `src/app/globals.css` (tokens, remapeo de slots, eliminación de `.dark`, bloque `data-cat-theme`) en un solo paso — no hay componentes de producción consumiendo la paleta anterior fuera de `Button`, que ya es compatible con el remapeo.
2. Añadir carga de fuentes (`next/font/google`) en el layout del frontend.
3. Crear `Container` y verificar visualmente en los tres breakpoints clave (mobile/tablet/desktop) usando la página de inicio actual (boilerplate) como superficie de prueba temporal, sin convertirla en la Home real.
4. Crear los componentes editoriales uno por uno (`CategoryBadge` → `CategoryCard` → `ArticleCard` → `ArticleMetadata` → `SectionHeader` → `Breadcrumbs`/`Pagination` → `ResponsiveMedia`), validando cada uno con datos de ejemplo locales.
5. Documentar en `docs/DESIGN-SYSTEM.md`.
6. No hay rollback especial: el cambio es aditivo sobre un frontend que hoy es boilerplate; revertir es descartar el commit/PR de esta change.
