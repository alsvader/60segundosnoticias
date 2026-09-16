## Why

Al implementar el entorno de smoke E2E de producción de la Fase 11
(`testing-qa-performance`, capacidad `quality-and-performance`) con MinIO
como Object Storage S3-compatible desechable, se confirmó que el Media
servido desde S3/R2 en producción real está roto de dos formas
relacionadas: (1) `next/image` rechaza con `400` cualquier URL de Media
externa porque `next.config.ts` no declara `images.remotePatterns`, y (2)
la Content-Security-Policy pública tampoco incluye el origen real de
Object Storage en producción, porque ambos —`images` y `headers()` de
`next.config.ts`— se congelan en el build de `output: standalone` y
`S3_PUBLIC_URL` es, por diseño explícito de la Fase 10
(`docs/DEPLOYMENT.md`), una variable de solo-runtime, nunca un build ARG.
Ninguna corrida end-to-end había ejercitado antes Media S3-backed contra
el runtime de producción real, así que este defecto existía sin
detectarse.

## What Changes

- `ResponsiveMedia` y los demás componentes que renderizan Media de
  Payload directamente vía `next/image` (`article-metadata.tsx`,
  `author-card.tsx`, `video-feature-section.tsx`, `video-player.tsx`)
  pasan a usar `unoptimized`, extendiendo el patrón que `header.tsx` y
  `footer.tsx` ya aplican a sus logos — el navegador solicita el objeto
  directamente al Object Storage/CDN configurado, sin pasar por el
  optimizador de imágenes de Next, sin necesidad de una lista de hosts
  permitidos ni de convertir `S3_PUBLIC_URL` en un valor de build.
- La construcción de la `Content-Security-Policy` pública deja de ocurrir
  enteramente dentro de `next.config.ts` (congelada en build): el origen
  de Media (derivado de `S3_PUBLIC_URL`) pasa a calcularse en un nuevo
  `proxy.ts` (el mecanismo vigente en Next 16 — sucesor de
  `middleware.ts`, con runtime Node.js por defecto), evaluado en cada
  petición contra el entorno real del contenedor en ejecución. Los
  headers que no dependen de configuración de runtime (`X-Content-Type-
  Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-
  Security`) permanecen sin cambios en `next.config.ts`.
- El `proxy.ts` nuevo replica exactamente el mismo patrón de rutas
  públicas (`/((?!admin|api).*)`) que ya excluye a Payload Admin y a las
  rutas API de la CSP pública — ese límite no cambia.
- Ningún cambio a `src/lib/env/index.ts` (la validación estricta de
  `S3_*` en producción permanece intacta), a la arquitectura de Object
  Storage, ni a `payload.config.ts`.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `editorial-components`: `ResponsiveMedia` (y los demás consumidores
  directos de `next/image` sobre Media de Payload) SHALL renderizar Media
  servido desde cualquier origen S3-compatible configurado en runtime,
  sin depender de una lista de hosts fijada en build time.
- `production-security-headers`: la Content-Security-Policy pública SHALL
  reflejar el origen de Object Storage configurado en el entorno de
  ejecución real del contenedor, no el valor (si alguno) presente al
  momento del build.

## Impact

- **Código**: `src/components/editorial/responsive-media.tsx`,
  `src/components/editorial/article-metadata.tsx`,
  `src/components/content/author-card.tsx`,
  `src/components/sections/home/video-feature-section.tsx`,
  `src/components/content/video-player.tsx` (añadir `unoptimized`);
  `next.config.ts` (retira la porción de CSP dependiente de runtime de su
  `headers()`); `src/lib/security/headers.ts` (la función de construcción
  de CSP se reutiliza desde el nuevo punto de entrada); `src/proxy.ts`
  nuevo (junto a `src/app`, no en la raíz del repo - ver design.md).
- **Sin cambios**: `src/lib/env/index.ts`, `payload.config.ts`,
  `src/payload/plugins/media-storage.ts`, cualquier `ARG` de Docker
  (`S3_PUBLIC_URL` permanece fuera del build, sin excepción), el límite
  Admin/API de la política de headers.
- **Pruebas**: se añaden escenarios E2E sobre el entorno MinIO ya
  construido en `testing-qa-performance` (carga real de imagen,
  `naturalWidth > 0`, verificación del header CSP real) — una vez
  archivado este cambio, esa cobertura permanente vuelve a vivir en la
  capacidad `quality-and-performance` de la Fase 11, no aquí.
- **Fuera de alcance**: arquitectura de Object Storage, esquema de Media
  de Payload, Search, Preview, caché/revalidación, y cualquier
  infraestructura de pruebas de la Fase 11 no directamente relacionada
  con verificar este arreglo.
