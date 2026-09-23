## 1. Componente BannerSection

- [x] 1.1 En `src/components/sections/banner-section.tsx`, extraer un `BannerContent` interno (marca decorativa `aria-hidden`, `<h2>` `type-h2 uppercase` con `id` vía `useId()`, `<p>` `type-lead max-w-prose`, CTA `Button asChild` + `Link` `h-11 px-5 type-label-uppercase` con `ArrowRight` `aria-hidden` y el `target`/`rel` actual) y la composición según `image` (centrada sin imagen; `lg:grid-cols-[3fr_2fr]` con `ResponsiveMedia` `4/3` `rounded-xl w-full` con imagen) (design D3/D4). Verificar con `pnpm typecheck`. Skill: `tailwind-design-system`.
- [x] 1.2 Agregar la prop `layout?: 'full-bleed' | 'contained'` (por defecto `'full-bleed'`): `full-bleed` = `<section aria-labelledby>` con el fondo de la variante + `py-12 md:py-16` + `Container`; `contained` = `<section className="py-8 md:py-12">` con una tarjeta `rounded-xl overflow-hidden p-6 sm:p-10` y el mismo fondo, sin `Container` (design D1/D2). Verificar con `pnpm typecheck` que `BannerData` y `HomeBlockRenderer` no cambian.
- [x] 1.3 Reemplazar `VARIANT_STYLES` por la tabla de design D5 (fondo, colores de texto, `border-y` y `texture-paper-grain` en `editorial`, `Button` `default`/`secondary` según variante), solo con tokens existentes. Verificar que no queda ningún `max-w`/`px` arbitrario fuera de `Container` (`grep` en el archivo). Skills: `tailwind-design-system`, `design-taste-frontend` (revisión visual).
- [x] 1.4 En `src/components/sections/pages/page-block-renderer.tsx`, pasar `layout="contained"` al `BannerSection`. Verificar con `pnpm typecheck`.
- [x] 1.5 Mostrar la imagen del Banner con su proporción original (sin recorte): `BannerData.image` suma `width`/`height`, `resolveBanner()` y `PageBlockRenderer` los pasan, `ResponsiveMedia` sin `aspectRatio` y acotada por `max-w-full sm:max-w-xl max-h-96` (design D3). Verificar con el test unitario de proporción natural (`pnpm test:unit`) y capturas con imagen vertical y horizontal.

## 2. Payload admin

- [x] 2.1 En `src/payload/blocks/shared/Banner.ts`, cambiar solo `label` de `link` a "Botón (CTA)" y agregar `admin.description` en `image` y `variant` (design D6). Verificar con `pnpm test:importmap`, y que `pnpm generate:types` no cambia la forma de `BannerBlock` en `src/payload-types.ts` (solo comentarios JSDoc derivados de `admin.description`) ni hace falta migración (`pnpm payload migrate:create` no se ejecuta).

## 3. Tests

- [x] 3.1 Crear `src/components/sections/banner-section.test.tsx` (happy-dom): con/sin imagen (composición centrada vs columna de imagen), sin CTA cuando `link` es `undefined`, `rel="noopener noreferrer"` y `target="_blank"` en externo con nueva pestaña, `h2` asociado vía `aria-labelledby`, `layout="contained"` sin `Container`. Verificar con `pnpm test:unit`.
- [x] 3.2 En `tests/fixtures/builders.ts` (`configureHomeBlocks`), agregar un `banner` idempotente por `title`, con imagen del fixture, CTA a una categoría y `variant: 'dark'`. Verificar que `pnpm test:integration` (`fixtures.test.ts`) pasa. Skill: `playwright-best-practices`.
- [x] 3.3 En `tests/e2e/responsive.spec.ts`, agregar un test en 375/768/1440px: el `boundingBox()` de la `section` del Banner tiene el ancho del viewport y la `x` de su `h2` coincide con la del encabezado de la sección vecina; y confirmar que el test existente de no-scroll-horizontal sigue pasando. Verificar con `pnpm test:e2e:pr`. Skill: `playwright-best-practices`.
- [x] 3.4 Correr `pnpm test:a11y` con el Banner presente en Home, sin nuevas violaciones (contraste, headings, foco). Skill: `accessibility`. (Tras la tarea 3.6, axe cubre las tres variantes: `dark` y `editorial` en Home, `promotional` en la Page. Contraste confirmado además por cálculo WCAG: texto ≥ 4.97:1, UI ≥ 3.64:1.)
- [x] 3.5 Regenerar `home-desktop` (`pnpm test:visual --update-snapshots`) y revisar la imagen a mano: fondo a ancho completo, contenido alineado, CTA visible. Baselines `-darwin`; las `-linux` salen del job `visual` de `release.yml` (`docs/TESTING.md`).
- [x] 3.6 Cubrir en E2E los escenarios que solo se verificaban a mano (hallazgos de `/opsx:verify`): `configureHomeBlocks` agrega un segundo Banner `editorial` sin imagen (varios Banners en el Home) y `createPage` agrega un Banner `promotional` con imagen a la Page de fixture (modo `contained`), ambos idempotentes por `title` y siempre al final del layout; `responsive.spec.ts` comprueba cada Banner del Home y la tarjeta de la Page contra los bordes de su `Container`. Verificar con `pnpm test:e2e:pr` y `pnpm test:a11y`, y regenerar `home-desktop`.

## 4. Documentación y verificación

- [x] 4.1 Actualizar `docs/FRONTEND-ARCHITECTURE.md` (sección de `BannerSection` compartido): fondo a ancho completo en Home, `layout="contained"` en Pages. Verificar que el texto coincide con el código implementado.
- [x] 4.2 Verificación manual en navegador a 375/768/1024/1440px de las tres variantes, con y sin imagen, en Home y en una Page, más la navegación con teclado del CTA. Skill: `ui-ux-pro-max` (revisión UX). (Hecho contra el servidor E2E de producción con Banners de vista previa temporales en la base de datos de pruebas desechable, retirados al terminar, en lugar de `pnpm dev` + `seed:dev`, para no alterar la base de desarrollo. Hallazgo aplicado: imagen limitada a `max-w-xl` por debajo de `lg`.)
- [x] 4.3 Revisión de código del diff. Skill: `code-review-and-quality`.
- [x] 4.4 `pnpm test` (typecheck, lint, importmap, unit) y `pnpm build` pasan.
- [x] 4.5 `graphify update .` refresca el grafo.
