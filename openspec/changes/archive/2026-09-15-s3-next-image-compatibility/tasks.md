## 1. Extraer la construcción de CSP para uso en runtime

- [x] 1.1 En `src/lib/security/headers.ts`, exportar `buildContentSecurityPolicy`
  y `getMediaOrigin` (sin cambiar su lógica de directivas) para que puedan
  invocarse desde un archivo distinto a `next.config.ts`. Verificar con
  `pnpm typecheck`.

## 2. Retirar la CSP del grupo de headers de build en `next.config.ts`

- [x] 2.1 En `buildSecurityHeaders()`, quitar `Content-Security-Policy` del
  arreglo `publicPageHeaders`, dejando intactos `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` (todas las rutas) y
  `Strict-Transport-Security` condicional (rutas públicas). Verificar
  inspeccionando el `source`/`headers` resultante y confirmando que ya no
  incluye `Content-Security-Policy`.

## 3. Crear `proxy.ts` para la CSP dependiente de runtime

- [x] 3.1 Crear `src/proxy.ts` (junto a `src/app`, no en la raíz del repo -
  Next lo requiere al mismo nivel que `app`/`pages` cuando el proyecto usa
  un directorio `src/`) exportando una función
  `proxy` (Next 16, runtime Node.js por defecto) con
  `export const config = { matcher: '/((?!admin|api).*)' }` — idéntico al
  patrón ya usado para excluir Admin/API de la CSP pública. Verificar que
  el archivo typechequea y que Next lo reconoce (`pnpm dev` arranca sin
  advertencias sobre `proxy.ts`).
- [x] 3.2 Dentro de `proxy.ts`, construir la respuesta con
  `NextResponse.next()` y `response.headers.set('Content-Security-Policy',
  buildContentSecurityPolicy())`, leyendo `process.env.S3_PUBLIC_URL` en
  cada invocación (nunca un valor cacheado a nivel de módulo desde el
  build). Verificar con una petición local a una ruta pública y
  confirmando que la respuesta trae exactamente un header
  `Content-Security-Policy`, sin duplicados.

## 4. Renderizar Media de Payload sin depender de `images.remotePatterns`

- [x] 4.1 Añadir `unoptimized` a las dos ramas de `<Image>` en
  `src/components/editorial/responsive-media.tsx`. Verificar con
  `pnpm typecheck` y revisando que `width`/`height`/`fill`/`sizes` no
  cambian.
- [x] 4.2 Añadir `unoptimized` al `<Image>` de avatar en
  `src/components/editorial/article-metadata.tsx`. Verificar con
  `pnpm typecheck`.
- [x] 4.3 Añadir `unoptimized` al `<Image>` de avatar en
  `src/components/content/author-card.tsx`. Verificar con `pnpm typecheck`.
- [x] 4.4 Añadir `unoptimized` al `<Image>` de thumbnail en
  `src/components/sections/home/video-feature-section.tsx`. Verificar con
  `pnpm typecheck`.
- [x] 4.5 Añadir `unoptimized` al `<Image>` de poster en
  `src/components/content/video-player.tsx`. Verificar con
  `pnpm typecheck`.

## 5. Verificación end-to-end contra el entorno MinIO de Fase 11

- [x] 5.1 Con `docker compose -f compose.test.yml up -d` (Postgres + MinIO
  de `testing-qa-performance` ya construidos) y
  `node scripts/run-e2e-server.mjs` (o equivalente), cargar un Article con
  `featuredImage` y verificar en el navegador: la petición de la imagen
  no pasa por `/_next/image`, responde `200`, y
  `img.complete === true && img.naturalWidth > 0`.
- [x] 5.2 Verificar que la respuesta de esa misma página incluye un único
  header `Content-Security-Policy` que contiene el origen MinIO
  configurado (`http://localhost:9000`) en las directivas de Media.
- [x] 5.3 Verificar que un origen externo arbitrario (no configurado como
  `S3_PUBLIC_URL`) no aparece permitido en esa misma CSP.
- [x] 5.4 Matriz de verificación del mecanismo compartido (Payload Media →
  `next/image` con `unoptimized` dirigido → el navegador solicita
  directo al Object Storage), documentada con precisión en vez de
  afirmar cobertura E2E pareja en los 5 sitios:
  - **E2E directo contra MinIO real** (5.1-5.3): Media destacada de
    Article (`responsive-media.tsx`, rama `fill`) y card de Media de
    Category (`responsive-media.tsx`, rama `width`/`height`) —
    verificados en navegador real, `naturalWidth > 0`, cero peticiones a
    `/_next/image`, origen de runtime configurado funcionando.
  - **Verificación a nivel de código/build** (no E2E): avatar de autor
    (`article-metadata.tsx`, `author-card.tsx`), thumbnail de video
    (`video-feature-section.tsx`) y poster de video (`video-player.tsx`)
    — mismo `unoptimized` dirigido aplicado, cubiertos por inspección de
    código, TypeScript, lint y el build de producción. No se afirma
    prueba E2E directa para estos tres.
  - Cobertura E2E exhaustiva por cada sitio de uso se difiere
    deliberadamente a la Fase 11 (`testing-qa-performance`) si su propia
    cobertura de E2E/content blocks lo requiere de forma independiente -
    no se crea infraestructura de fixtures de video ni se modifica la
    profundidad de población de la relación de autor del Article
    únicamente para cerrar esta tarea en este cambio focalizado. No hay
    ninguna falla conocida en los tres sitios restantes; carecen de
    fixtures independientes dentro del alcance de este cambio.
- [x] 5.5 Detener el servidor, reiniciarlo con un `S3_PUBLIC_URL` distinto
  (sin volver a ejecutar `pnpm build`) y confirmar que tanto la URL de
  Media renderizada como el header CSP reflejan el nuevo origen —
  verifica la invariante "mismo build, distinto host S3 en runtime, sin
  reconstruir".

## 6. Verificación de desarrollo local sin S3

- [x] 6.1 Con `pnpm dev` y sin variables `S3_*` configuradas (almacenamiento
  local), confirmar que Media sigue renderizando correctamente en Home,
  Article y Page — sin regresión respecto al comportamiento previo a este
  cambio.

## 7. Validación y documentación

- [x] 7.1 Ejecutar `pnpm typecheck && pnpm lint && pnpm build` sobre el
  estado final del cambio y confirmar que los tres pasan.
- [x] 7.2 Actualizar `docs/DEPLOYMENT.md` documentando el split entre
  headers estáticos (`next.config.ts`, build time) y la
  Content-Security-Policy dependiente de runtime (`proxy.ts`), y por qué
  `S3_PUBLIC_URL` nunca se convierte en build `ARG`. Verificar que el
  contenido coincide con la implementación real (sin comandos ni
  variables inventadas).
- [x] 7.3 Ejecutar `graphify update .` para reflejar `proxy.ts` y los
  componentes modificados en el grafo. Verificar que
  `graphify query "content security policy"` encuentra el nuevo archivo.
- [x] 7.4 Invocar la skill `opsx:verify` para `s3-next-image-compatibility`
  (no existe un comando de CLI `openspec verify`) y resolver cualquier
  discrepancia entre lo implementado y los artefactos del cambio antes de
  proponer el archivado.
