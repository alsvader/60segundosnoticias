## Context

Pipeline actual (confirmado con Graphify y leyendo el código): `Home.layout[]` → `blocks/shared/Banner.ts` → `resolveBanner()` en `src/lib/home/resolve-home-blocks.ts` → `BannerData` → `HomeBlockRenderer` → `BannerSection`. `PageBlockRenderer` arma el mismo `BannerData` en línea y renderiza el mismo `BannerSection`.

Hay dos contextos de layout distintos para un mismo componente:

```
Home:   <main> > <section bg ...>                       (sin contenedor padre)
Pages:  <main> > <Container py-8 gap-4> > <section ...> (ruta [category]/page.tsx:124)
```

El resto de las Home Sections ya siguen el mismo patrón: `<section className="py-8 md:py-12 [fondo/textura]"><Container>…</Container></section>`. `HeroNewsSection` (`texture-newspaper-pattern`) y `EditorialIntroSection` (imagen de fondo absoluta) ya resuelven así un fondo a ancho completo. `Container` (`src/components/layout/container.tsx`) aplica `max-w-[var(--container-max)]` (1400px) y `px-[var(--container-gutter)]` (16/28/44px).

## Goals / Non-Goals

**Goals:**
- Reutilizar `Container`, `Button`, `ResponsiveMedia`, las clases `type-*`, `texture-paper-grain` y los tokens de color, sin valores arbitrarios de ancho ni de gutter.
- Mantener compatible el contrato de datos `BannerData` (solo se agregan `image.width`/`image.height` opcionales, que ya calcula `mapMediaToMediaData()`), sin tocar el renderer de Home, el esquema ni las migraciones.

**Non-Goals:**
- Unificar cómo manejan su contenedor las secciones de Pages.
- Agregar opciones visuales configurables por el Admin.

## Decisions

### D1. Fondo a ancho completo en la `<section>` y contenido en `Container`
Estructura por defecto (`layout="full-bleed"`):

```
<section aria-labelledby={titleId} class="{variant} py-12 md:py-16">
  <Container class="grid items-center gap-8 | lg:grid-cols-[3fr_2fr] si hay imagen">
    <div text>  marca · h2 · p · CTA  </div>
    <ResponsiveMedia/>  (opcional)
  </Container>
</section>
```

Es exactamente el patrón de las demás Home Sections, así que la alineación coincide por construcción. Usa un `py` un poco mayor que el `py-8 md:py-12` de las secciones sin fondo para que el bloque de color respire. **Alternativa descartada:** `max-width`/`padding` propios del Banner, porque se desalinearía cuando cambien los tokens.

### D2. Pages: `layout="contained"` (opción A)
`BannerSection` recibe `layout?: 'full-bleed' | 'contained'` (por defecto `'full-bleed'`). En `'contained'` no renderiza `Container`: envuelve el mismo contenido en una tarjeta `rounded-xl overflow-hidden` con el fondo de la variante y padding interno (`p-6 sm:p-10`), dentro de `<section className="py-8 md:py-12">`, igual que ya hace `CTASection`. `PageBlockRenderer` pasa `layout="contained"`, y `HomeBlockRenderer` no cambia.

Un único componente interno (`BannerContent`) produce marca, título, descripción, CTA e imagen para los dos modos, y solo cambia el wrapper. Así se cumple "mismo contrato visual salvo el ancho del fondo".

Alternativas descartadas:
- **B. Breakout CSS** (`mx-[calc(50%-50vw)]`/`w-screen`): `100vw` incluye el ancho de la barra de scroll en navegadores con scrollbar clásica y produce scroll horizontal, justo lo que `responsive.spec.ts` prohíbe (AC-RESP-002).
- **C. Quitar el `Container` de la ruta de Pages** y hacer que cada Page Section lo aplique: es la arquitectura más coherente, pero toca 7 secciones de Pages y el layout de todas las Pages. Queda fuera de alcance y puede plantearse como cambio propio.

### D3. Composición derivada de `image`, sin campo nuevo
- Sin imagen: `Container` de una columna; bloque de texto `mx-auto max-w-3xl text-center items-center`; la marca se centra.
- Con imagen: `lg:grid-cols-[3fr_2fr]` (mismo ratio que `EditorialIntroSection`); en `<lg` una sola columna con la imagen después del CTA. `ResponsiveMedia` en su modo de proporción natural (sin `aspectRatio`, con `width`/`height` de Media, mismo modo que ya usa `ImageBlock`): la imagen conserva su forma, sin caja ni recorte. Queda acotada por `max-w-full` (columna 2fr en `lg+`), `sm:max-w-xl` (576px en tablet) y `max-h-96` (384px, ≈ la altura de la antigua caja 4:3 a 1440px), con `w-auto h-auto` para escalar proporcionalmente; alineada a la derecha en `lg+`. `BannerData.image` suma `width`/`height` opcionales; si Media no los trae, `ResponsiveMedia` cae en su respaldo 16:9. (Primera iteración usaba `aspectRatio="4/3"`, que recortaba toda imagen no 4:3: corregido tras revisión del usuario.) Se mantiene `preferredSize: 'tablet'` en el resolver.

**Alternativa descartada:** un select `composition` en Payload. Agrega configuración y una migración de enum sin aportar nada que la presencia de imagen no decida ya.

### D4. Tipografía y CTA
- Marca decorativa: `<span aria-hidden="true">` de `h-1 w-12`, en `--brand-red-500` (y `--paper-50` en `promotional`).
- Título: `<h2 id={titleId}>` con `type-h2 uppercase`. `titleId` sale de `useId()`, que es válido en Server Components. Sin título no se pone `aria-labelledby`.
- Descripción: `<p>` con `type-lead max-w-prose`.
- CTA: `Button asChild` + `next/link`, con `h-11 px-5` (44px reales, AC-A11Y-007), `type-label-uppercase` y `ArrowRight` (Lucide, `aria-hidden`). Se mantienen los estilos de foco de `buttonVariants` y el `target`/`rel` actual para enlaces externos.

### D5. Tratamiento por variante (solo tokens existentes)

| Variante | Fondo | Título / descripción | Botón (`variant` de `Button`) |
|----------|-------|----------------------|-------------------------------|
| `editorial` | `bg-[var(--paper-200)] texture-paper-grain`; `border-y border-[var(--border-default)]` en full-bleed | `--ink-950` / `--ink-700` | `default` (rojo) |
| `promotional` | `bg-[var(--brand-red-500)]` | `--paper-50` / `--paper-50` | `secondary` (`paper-200` + `ink-950`) |
| `dark` | `bg-[var(--ink-950)]` | `--paper-50` / `--paper-200` | `default` (rojo) |

`paper-200` separa `editorial` del fondo de la página (`paper-100`). `texture-paper-grain` (opacidad 0.05) entra en el rango de §49. Los pares de color ya se usan en el sitio. El contraste se verifica con `a11y.spec.ts` en lugar de asumirlo.

### D6. Payload: solo metadatos del admin
En `Banner.ts`: `link.label` pasa a "Botón (CTA)", y se agregan `admin.description` en `image` ("Opcional. Sin imagen, el contenido se muestra centrado.") y en `variant`. `label` y `admin` no generan columnas: el nombre de columna sale de `name`, así que no cambian el importmap ni las migraciones, y en `payload-types.ts` solo aparecen los comentarios JSDoc que Payload genera a partir de `admin.description` (la forma de `BannerBlock` no cambia). El contenido existente sigue siendo compatible.

## Risks / Trade-offs

- [Dos Banners `editorial` consecutivos se funden visualmente] → `border-y` en `editorial`; `promotional`/`dark` se distinguen por color. Si hace falta, el Admin puede alternar variantes.
- [Regenerar `home-desktop` en `visual.spec.ts` oculta regresiones ajenas] → revisar la imagen a mano; las baselines `-linux` se regeneran desde el job `visual` de `release.yml` (`docs/TESTING.md`).
- [Agregar Banners al fixture e2e cambia la composición del Home y de la Page para otras pruebas] → cada bloque se agrega con clave de idempotencia por `title` y siempre al final del layout, así el orden es el mismo en una base de pruebas nueva o persistente. Home: `dark` con imagen + `editorial` sin imagen; Page: `promotional` con imagen (modo `contained`). Así axe cubre las tres variantes.
- [`texture-paper-grain` usa `::before` con `isolation`] → mismo mecanismo que ya usa el Hero; el contenido queda por encima.

## Migration Plan

No aplica: no hay cambios de esquema ni de datos. Para revertir basta con revertir el commit.
