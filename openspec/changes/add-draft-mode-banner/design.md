## Context

`FrontendLayout` (`src/app/(frontend)/layout.tsx`) es el único punto compartido por todo el sitio público (Home/Category/Article/Page) — ya es un Server Component `async` que llama al DAL (`getNavigation`/`getFooter`/`getSettings`). `draftMode()` (`next/headers`) ya se lee en `(frontend)/page.tsx`, `[category]/page.tsx` y `[category]/[post]/page.tsx` para decidir qué documento resolver, pero el layout compartido no lo conoce y no renderiza nada distinto cuando Draft Mode está activo. `/api/preview-exit` (`src/app/api/preview-exit/route.ts`) ya deshabilita Draft Mode y redirige a `/`; este change no lo modifica. Ver `proposal.md` para la motivación.

No hay un primitivo `Alert`/`Banner` instalado (`src/components/ui/` solo tiene `accordion`, `button`, `sheet`); sí existe el token semántico `warning` en `src/app/globals.css` (Design Tokens).

## Goals / Non-Goals

**Goals:**
- Que cualquier persona navegando el sitio público con Draft Mode habilitado vea, sin ambigüedad, que está viendo contenido sin publicar.
- Que salir de Draft Mode sea un clic desde cualquier página pública, sin depender de conocer `/api/preview-exit` de memoria.
- Cero JavaScript de cliente adicional; cero llamadas nuevas al DAL.

**Non-Goals:**
- Deshabilitar Draft Mode automáticamente al cerrar la pestaña o al cerrar sesión en Payload Admin (requiere enganchar el logout de Payload y/o cambiar la expiración de la cookie `__prerender_bypass` de Next.js — problema distinto, no cubierto por este change).
- Cambiar la lógica de resolución de documentos en Draft (`src/lib/preview/*`) o el flujo de `/api/preview`.
- Instalar un primitivo `Alert` de shadcn u otra dependencia nueva.

## Decisions

- **Ubicación**: el indicador se renderiza dentro de `FrontendLayout`, antes del skip-link (`<a href="#main-content">`), como elemento estático de ancho completo — no `fixed`/`sticky`. Es el único lugar que ve toda página pública sin duplicar la lectura de `draftMode()` en cada route segment.
  - Alternativa descartada: leer `draftMode()` en cada `page.tsx` y pasar un prop al layout — ya se lee ahí por otra razón (resolver el doc en Draft), pero duplicar la lectura en el layout es más simple que subir el estado por props a través de tres páginas distintas, y `draftMode()` es barato (lee una cookie).
- **Server Component, sin cliente**: el indicador no necesita interactividad más allá de un link (`<a href="/api/preview-exit">`), así que no se introduce ningún Client Component ni se lee la cookie en el navegador.
- **Componente propio, no un primitivo nuevo**: se construye como un componente de presentación pequeño en `src/components/site/` (junto a `Header`/`Footer`), usando el token `warning` ya existente vía clases Tailwind — no se instala `Alert` de shadcn para un caso de un solo uso.
- **Franja estática, no `fixed`/overlay**: evita layout shift impredecible y no compite por foco/scroll con el skip-link, que ya es el primer elemento accesible de la página.

## Risks / Trade-offs

- [El indicador solo es visible en el HTML servido cuando `draftMode().isEnabled` es `true`; si la cookie de Draft Mode persiste sin que la página se vuelva a renderizar (poco probable en Next.js App Router, donde cada navegación es un nuevo render) el usuario no vería el indicador desactualizado] → cada navegación server-rendered vuelve a evaluar `draftMode()`, por lo que el indicador siempre refleja el estado real de la cookie en la request actual.
- [Este change no resuelve el cierre automático de Draft Mode (cerrar pestaña/logout) mencionado en la conversación original] → mitigado parcialmente: aunque la cookie persista, el indicador visible en cualquier página hace explícito el estado y ofrece salida en un clic, reduciendo el riesgo de confusión aunque no lo elimine por completo. Si se requiere cierre automático, es un change separado.

## Migration Plan

Puramente aditivo: un componente nuevo y una condición en un layout ya existente. Sin migración de datos, sin variable de entorno nueva, sin cambio de contrato de API. Rollback = revertir el commit.
