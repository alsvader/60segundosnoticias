## Why

La Fase 8 (`docs/60-segundos-spec.md` §31, AC-PREVIEW-006) implementó `/api/preview-exit` como mecanismo para salir de Draft Mode, pero ningún punto del frontend público lo enlaza ni indica que Draft Mode está activo. Un Writer o Admin que entra a Preview desde el Admin de Payload y luego cierra la pestaña o cierra sesión no tiene forma de saber, navegando después el sitio en ese mismo navegador, que sigue viendo contenido en Draft en vez de la versión pública — con riesgo de confundir contenido sin publicar con contenido publicado.

## What Changes

- Se agrega una franja estática y visible en el layout público (`src/app/(frontend)/layout.tsx`) cuando `draftMode().isEnabled` es `true`, indicando que la página actual se está viendo en vista previa sin publicar.
- La franja incluye un enlace a `/api/preview-exit` para salir de Draft Mode desde cualquier página pública, sin depender de que el usuario conozca la ruta de memoria.
- Es un Server Component sin JavaScript de cliente ni cookies leídas en el cliente; usa el token semántico `warning` ya existente en `src/app/globals.css` (Design Tokens).
- No se modifica `/api/preview`, `/api/preview-exit`, ni la lógica de resolución de documentos en Draft (`src/lib/preview/*`) — este change es exclusivamente de discoverability/UI.
- Fuera de alcance: cierre automático de Draft Mode al cerrar pestaña o al cerrar sesión en Payload Admin (requeriría enganchar el logout de Payload o cambiar la expiración de la cookie de Draft Mode de Next.js; es un problema distinto, no cubierto aquí).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `preview`: nuevo Requirement — el sistema SHALL mostrar un indicador visible cuando Draft Mode está habilitado, con un enlace directo a `/api/preview-exit`.

## Impact

- `src/app/(frontend)/layout.tsx`: lee `draftMode()` y renderiza el nuevo componente condicionalmente.
- Nuevo componente de presentación (banner), ubicado junto a los demás componentes de shell (`src/components/site/`).
- `openspec/specs/preview/spec.md`: nuevo Requirement vía delta spec de este change.
- Sin cambios de dependencias, sin nuevas variables de entorno, sin cambios en Payload Admin.
