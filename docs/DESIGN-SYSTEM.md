# 60 Segundos Noticias — Design System (Fase 4)

Este documento describe cómo se implementó el Design System (`openspec/changes/design-system-shadcn/`). Los requisitos de producto viven en `docs/60-segundos-spec.md` §43-52; este archivo documenta convenciones de implementación, no requisitos.

## Tokens

Fuente única: `src/app/globals.css` (`:root` + `@theme inline`). No existe un archivo de tokens en JS/TS paralelo.

- Brand/ink/paper/border/semantic: variables CSS planas (`--brand-red-500`, `--ink-950`, `--paper-100`, `--border-default`, `--success`, etc.), tomadas literalmente de `docs/60-segundos-spec.md` §44.
- Slots semánticos de shadcn (`--background`, `--primary`, `--border`, `--radius`, ...) se remapean a estos tokens dentro de `@theme inline`. Un primitivo shadcn nuevo no necesita retematizarse manualmente: hereda el sistema con solo consumir esos slots.
- No hay modo oscuro en V1: el bloque `.dark` y las clases `dark:` generadas por el CLI de shadcn se eliminaron activamente (ver `src/components/ui/button.tsx`), no se dejaron inertes.

## Tipografía

- Oswald (`--font-display`) e Inter (`--font-body`) se cargan con `next/font/google` en `src/app/(frontend)/fonts.ts` y se aplican como variables de fuente en `src/app/(frontend)/layout.tsx`.
- Escala tipográfica como clases utilitarias en `globals.css` (`@layer components`): `.type-display-xl`, `.type-h1-article`, `.type-h2`, `.type-h3`, `.type-section-heading`, `.type-body`, `.type-lead`, `.type-metadata`, `.type-label-uppercase`. Todas usan `clamp()` para interpolar entre los rangos mobile/desktop de §46, en vez de fijar breakpoints exactos.
- `.type-label-uppercase` es la única utilidad con `text-transform: uppercase`; nunca se aplica a `.type-h1-article` ni a `.type-body`.

## Layout

- `Container` (`src/components/layout/container.tsx`): canvas centrado a `--container-max` (1400px) con gutter responsivo (`--container-gutter`: 16px mobile / 28px ≥640px / 44px ≥1024px).
- `.measure-article` (`--measure-article`, 45rem/~720px) y `.measure-wide` (`--measure-wide`, 66rem/~1056px): utilidades de ancho legible para contenido editorial, dentro de los rangos de §47. Consumirlas directamente como clase en el contenedor de texto/media cuando Fase 5+ construya la página de Artículo.

## Category theme system

Las 10 keys de `CATEGORY_THEME_KEYS` (`src/lib/constants/category-theme-keys.ts`, sin cambios, framework-neutral) se resuelven a variables CSS mediante el atributo `data-cat-theme` en `globals.css`:

```css
[data-cat-theme="blue"] { --cat-accent: #129BE8; --cat-accent-fg: var(--ink-950); }
```

`--cat-strong`, `--cat-soft`, `--cat-soft-fg`, `--cat-border` y `--cat-overlay-bg` se derivan genéricamente de `--cat-accent` vía `color-mix()` en el selector compartido `[data-cat-theme]`, evitando repetir 10×5 valores a mano. `--cat-strong` es la pieza clave: una versión deliberadamente oscurecida del accent (`color-mix(in oklch, var(--cat-accent) 55%, var(--ink-950) 45%)`) que se usa **en vez de** `--cat-accent` en cualquier icono/texto que se dibuja directamente sobre una superficie clara (`paper`), porque el accent puro falla el mínimo de contraste no-textual (3:1) para `blue`/`orange`/`green`/`yellow` — ver tabla abajo. `--cat-soft-fg` y `--cat-overlay-bg` son alias de `--cat-strong` (mismo valor, nombrados por su rol de uso).

**No se interpola ninguna clase Tailwind con la key en runtime** (`bg-${theme}-500` no existe en el código). Los componentes marcan el elemento con `data-cat-theme={theme}` y consumen `var(--cat-accent)` vía sintaxis de valor arbitrario (`bg-[var(--cat-accent)]`).

`src/lib/editorial/category-theme.ts` expone `resolveCategoryThemeKey()`, que cae a `purple` (el theme "otras categorías" de §45) ante un valor ausente o no reconocido — nunca a un color arbitrario.

### Contraste verificado

**1. `--cat-accent-fg` (texto sobre el accent saturado, usado directamente por `CategoryBadge` `overlay` — ver más abajo — antes del fix; ya no se usa en `default`/`compact`).** Calculado (WCAG 2.x, luminancia relativa):

| Theme | Accent | vs. blanco (`paper-50`) | vs. `ink-950` | `--cat-accent-fg` elegido |
|---|---|---|---|---|
| red | `#D71920` | 4.97:1 | 3.64:1 | `paper-50` (AA texto normal) |
| blue | `#129BE8` | 2.93:1 | 6.19:1 | `ink-950` (AA texto normal) |
| orange | `#FF7A00` | 2.51:1 | 7.23:1 | `ink-950` (AA texto normal) |
| green | `#74BD00` | 2.23:1 | 8.11:1 | `ink-950` (AA texto normal) |
| pink | `#E6008D` | 4.24:1 | 4.27:1 | `ink-950` (**solo AA texto grande, ≥3:1** — ninguna opción alcanza 4.5:1) |
| purple | `#8500E8` | 6.37:1 | 2.84:1 | `paper-50` (AA texto normal) |
| cyan | `#0BA0B0` | 3.02:1 | 6.00:1 | `ink-950` (AA texto normal) |
| yellow | `#E8B000` | 1.89:1 | 9.57:1 | `ink-950` (AA texto normal) |
| teal | `#0E8F7A` | 3.85:1 | 4.70:1 | `ink-950` (AA texto normal, margen ajustado) |
| indigo | `#4A48D6` | 6.32:1 | 2.87:1 | `paper-50` (AA texto normal) |

**Restricción vigente (sin cambios): el hex de `pink` (`#E6008D`) es el aprobado por el Master Spec y no se modifica.** Ninguna opción de `--cat-accent-fg` alcanza 4.5:1 para texto normal/pequeño — por eso ningún componente de esta change usa `--cat-accent`/`--cat-accent-fg` en texto pequeño (ver el fix de `CategoryBadge` abajo). Si una fase futura necesita pintar texto pequeño directamente sobre el accent saturado, debe usar `--cat-strong` (ver punto 3) o `ink-950`/`paper-50` según contraste, nunca asumir `--cat-accent-fg` es seguro para ese contexto.

**2. `CategoryCard` icon sobre `paper-50` (no-textual, mínimo WCAG 1.4.11 = 3:1).** El accent saturado por sí solo **falla** este mínimo para 4 de los 10 themes:

| Theme | Accent vs. `paper-50` | Resultado |
|---|---|---|
| red | 4.97:1 | OK |
| blue | 2.93:1 | **FALLA** (<3:1) |
| orange | 2.51:1 | **FALLA** (<3:1) |
| green | 2.23:1 | **FALLA** (<3:1) |
| pink | 4.24:1 | OK |
| purple | 6.37:1 | OK |
| cyan | 3.02:1 | OK |
| yellow | 1.89:1 | **FALLA** (<3:1) |
| teal | 3.85:1 | OK |
| indigo | 6.32:1 | OK |

**Fix:** `CategoryCard` (`category-card.tsx`) pinta el icono con `--cat-strong`, no `--cat-accent`. La barra decorativa de acento bajo el nombre sigue usando `--cat-accent` puro — es puramente decorativa (no requerida para identificar/operar la card), por lo que 1.4.11 no le aplica.

**3. `--cat-strong` vs. `paper-50`/blanco (usado por `CategoryCard` icon, `CategoryBadge` `default`/`compact` texto vía `--cat-soft-fg`, y `CategoryBadge` `overlay` fondo vía `--cat-overlay-bg`, con texto `paper-50` fijo):**

| Theme | `--cat-strong` (aprox.) | vs. `paper-50` |
|---|---|---|
| red | `#7E1519` | 10.02:1 |
| blue | `#125D87` | 6.86:1 |
| orange | `#944B08` | 6.18:1 |
| green | `#477008` | 5.64:1 |
| pink | `#860855` | 9.24:1 |
| purple | `#510887` | 11.63:1 |
| cyan | `#0E6068` | 6.99:1 |
| yellow | `#876808` (peor caso) | **4.99:1** |
| teal | `#0F564B` | 8.18:1 |
| indigo | `#302F7D` | 10.97:1 |

Las 10 keys, incluida `pink`, superan holgadamente 4.5:1 — `--cat-strong` es seguro para texto normal/pequeño y para gráficos no-textuales en cualquier theme, sin excepciones por key. (Valores aproximados calculados con mezcla lineal sRGB como proxy directo de la fórmula `color-mix` en OKLCH; direccionalmente confiables, no una reproducción exacta píxel a píxel del render OKLCH del navegador.)

`--cat-soft-fg` (alias de `--cat-strong`, texto sobre `--cat-soft`, un tinte ~12% del accent sobre paper) hereda esta misma garantía.

## shadcn/ui

Política: instalación incremental, nunca `shadcn add --all`. En este change:

- `Button` (ya existente) se re-tematiza únicamente vía tokens — su código no cambió salvo eliminar las clases `dark:` heredadas del CLI y el fix de touch target descrito abajo.

### Touch target — 44px real, sin riesgo de solapamiento

Los tamaños `icon`/`icon-xs`/`icon-sm`/`icon-lg` (cuadrados) usan un `::after` invisible expandido en las 4 direcciones (`inset: -Npx`) hasta alcanzar 44×44px — seguro porque en todos los consumidores actuales (`Pagination`) estos botones están aislados por un `<span>` de texto entre ellos, nunca adyacentes entre sí.

Los tamaños de texto `xs`/`sm`/`default` (24/28/32px de alto) reciben un tratamiento distinto, elegido específicamente para evitar el riesgo que un `::after` en las 4 direcciones sí tendría en un `button-group` horizontal (`in-data-[slot=button-group]`, donde los botones se tocan borde a borde, gap=0):

- **Ancho:** `min-w-11` (44px) real — participa normalmente en el layout flex/gap, sin ningún riesgo de solapamiento (es una caja real, no un pseudo-elemento que escapa de sus límites).
- **Alto:** `::after` invisible expandido **solo verticalmente** (`inset-x-0` + `-inset-y-Npx`) — al no expandirse nunca en el eje horizontal, dos botones de texto uno junto a otro (con cualquier gap, incluido gap=0 en un button-group) nunca pueden generar una zona de click ambigua entre ellos. El único escenario donde esta técnica podría solaparse es un apilado **vertical** de botones pequeños con gap insuficiente — un patrón que no existe hoy en este proyecto (confirmado por inspección de todos los usos actuales de `Button`).
- `lg` (36px) no estaba en el alcance solicitado para este fix y permanece sin cambios.

Verificado: `pnpm build` genera las clases Tailwind esperadas (`min-w-11 → min-width: calc(var(--spacing) * 11)` = 44px; `after:inset-x-0 → inset-inline: calc(var(--spacing) * 0)` = 0, confirmando cero expansión horizontal).
- **No se instaló ningún primitivo adicional.** Se evaluó cada componente editorial de esta change (`CategoryBadge`, `CategoryCard`, `ArticleCard`, `ArticleMetadata`, `SectionHeader`, `Breadcrumbs`, `Pagination`, `ResponsiveMedia`) y ninguno requirió un primitivo shadcn nuevo: `Pagination` reutiliza `Button`; el resto son composiciones de HTML semántico + Lucide + `next/link`/`next/image`. `Input`, `Textarea`, `Label`, `Skeleton` y `Avatar` quedan diferidos hasta que un componente de una fase futura los consuma realmente.

## Componentes editoriales (`src/components/editorial/`)

Todos son presentacionales: reciben datos por props, no importan Payload ni hacen `fetch`.

- `CategoryBadge` — variantes `default`/`compact`/`overlay`. `default`/`compact` usan `--cat-soft`/`--cat-soft-fg` (nunca el accent saturado) para que las 10 keys, incluida `pink`, cumplan contraste en texto pequeño sin excepción. `overlay` usa `--cat-overlay-bg` (oscurecido, seguro sobre cualquier fondo) con texto `paper-50` fijo, no `--cat-accent-fg`.
- `CategoryCard` — icon (pintado con `--cat-strong`, no `--cat-accent` — ver contraste no-textual abajo) + nombre uppercase + descripción + barra de acento decorativa (`--cat-accent` puro, permitido por ser decorativa); hover `translateY` restringido a -3px; foco visible explícito (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`).
- `ArticleCard` — variantes `default`/`compact` en un único componente; contrato propio `ArticleCardData` (no `Post` de `payload-types.ts`). La Fase 5 (DAL/View Models) es responsable de transformar un `Post` real hacia este contrato. Foco visible explícito, igual que `CategoryCard`.
- `ArticleMetadata` — autor/fecha/reading time + slot de categoría, sin formatear fechas (recibe strings ya formateados). No interactivo, sin foco.
- `SectionHeader` — `title`/`eyebrow`/`action`/`as` (nivel de heading configurable). No renderiza ningún elemento interactivo propio (el `action` es contenido del caller), sin foco.
- `Breadcrumbs` / `Pagination` — dirigidos 100% por props. Los links de `Breadcrumbs` llevan `focus-visible:ring-3 focus-visible:ring-ring/50`; `Pagination` reutiliza `Button`, que ya trae su propio tratamiento de foco.
- `ResponsiveMedia` — envuelve `next/image`; `alt` es obligatorio en el tipo (no hay fallback de string vacío).

El mapeo de `CategoryIconKey` → componente Lucide vive en `src/components/editorial/category-icon-map.tsx` — el único módulo que importa simultáneamente la constante de Payload y Lucide, manteniendo `category-icon-keys.ts`/`category-theme-keys.ts` framework-neutral.

## Texturas

- `.texture-paper-grain` y `.texture-newspaper-pattern` (`globals.css`, `@layer utilities`): aplican la textura vía un pseudo-elemento `::before` con `z-index: -1` e `isolation: isolate`, no vía `opacity` en el propio elemento — así la opacidad reducida afecta solo la capa decorativa, nunca el texto del contenido.
- `paper-grain` está pensado para el canvas general; `newspaper-pattern` para Hero/secciones decorativas (opacidad 3-7%), nunca por defecto en cuerpo de artículo. Ninguna sección de página (Hero incluido) se construyó en este change.

## Motion

`--motion-fast` (120ms) / `--motion-normal` (200ms) / `--motion-slow` (320ms) en `globals.css`. `prefers-reduced-motion: reduce` se maneja con un reset global (`* { transition-duration: 0.01ms !important; ... }`) en vez de duplicar la media query en cada componente — cualquier transición nueva queda cubierta automáticamente.

## Accesibilidad

- Foco visible: `Button` ya traía `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`. Ese mismo tratamiento (mismos tokens, mismo grosor de ring) se agregó explícitamente a `CategoryCard`, `ArticleCard` (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`) y a los links de `Breadcrumbs` (`focus-visible:ring-3 focus-visible:ring-ring/50`) — no se dejó ninguno dependiendo solo del `outline-ring/50` heredado globalmente (`@layer base`) ni del outline nativo del navegador. `CategoryBadge` es un `<span>` no interactivo (nunca se usa como control por sí solo) y `SectionHeader`/`ArticleMetadata` no renderizan elementos interactivos propios — ninguno de los tres lleva foco explícito, a propósito.
- Touch target: ver la sección "Touch target — 44px real" arriba.
- Controles solo-icono (`Pagination`) llevan `aria-label`.
- `ResponsiveMedia.alt` es obligatorio a nivel de tipo.
- `Breadcrumbs` usa `aria-current="page"` en el item actual.
- Ver las tablas de contraste de category themes arriba para AC-A11Y-006 (incluye tanto el contraste texto-sobre-accent como el contraste no-textual icon-sobre-paper, y su fix vía `--cat-strong`).
