## 1. Componente del indicador

- [x] 1.1 Crear `src/components/site/draft-mode-banner.tsx` como Server Component de presentación (sin `'use client'`), con el texto del indicador y un `<a href="/api/preview-exit">` de salida, usando el token semántico `warning` de `src/app/globals.css` vía clases Tailwind — verificar que compila (`pnpm typecheck`) y que no introduce ninguna llamada al DAL ni a Payload.

## 2. Integración en el layout público

- [x] 2.1 En `src/app/(frontend)/layout.tsx`, leer `draftMode()` (`next/headers`) y renderizar `<DraftModeBanner />` condicionalmente cuando `isEnabled` es `true`, antes del skip-link existente — verificar en desarrollo que la franja aparece en Home, Category, Article y Page tras entrar por `/api/preview?secret=...&collection=...` (AC-PREVIEW-006).
- [x] 2.2 Verificar en desarrollo que la franja no aparece en ninguna página cuando Draft Mode está deshabilitado, y que al seguir el enlace "Salir" la franja desaparece en la página siguiente (invoca `/api/preview-exit`, ya existente, sin cambios en esta tarea).

## 3. Accesibilidad

- [x] 3.1 Verificar que el indicador usa un rol/landmark apropiado (p. ej. `role="status"` o equivalente semántico) para ser anunciado por lectores de pantalla, que el enlace "Salir" es alcanzable y activable por teclado en el orden de tabulación esperado, y que el contraste de texto sobre el token `warning` cumple AA (Accessibility Foundation).

## 4. Validación y documentación

- [x] 4.1 Ejecutar `pnpm typecheck`, `pnpm lint` y `pnpm build` y verificar que los tres pasan sin errores nuevos.
- [x] 4.2 Ejecutar `openspec validate add-draft-mode-banner --strict` y verificar que no reporta errores.
- [x] 4.3 Ejecutar `graphify update .` para reflejar el nuevo componente y la modificación del layout en el grafo.
- [x] 4.4 Actualizar la sección "Preview / Draft Mode" de `docs/SEO-AND-CACHING.md` para documentar el indicador visible y su enlace a `/api/preview-exit`.
