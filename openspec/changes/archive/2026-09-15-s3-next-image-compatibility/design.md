## Context

Ver proposal.md - Why para la motivación completa. Restricciones concretas
verificadas directamente contra el código y el build real durante la
exploración, que condicionan este diseño:

- `output: standalone` (`next.config.ts`) congela el `images`/`headers()`
  resuelto de `next.config.ts` en un JSON literal dentro del
  `.next/standalone/server.js` generado - confirmado inspeccionando ese
  archivo directamente (`process.env.__NEXT_PRIVATE_STANDALONE_CONFIG =
  JSON.stringify(nextConfig)`, con `images.remotePatterns` y la CSP ya
  resueltos como strings fijos). Ningún valor derivado de una variable de
  entorno de solo-runtime puede ser correcto ahí para todos los
  despliegues.
- `S3_PUBLIC_URL` es, por diseño ya ratificado en Fase 10
  (`docs/DEPLOYMENT.md:56`, `compose.prod.yaml`), una variable de
  **solo-runtime** - nunca un build `ARG`. Este diseño no puede revertir
  eso.
- `middleware.ts` está deprecado en Next 16, renombrado a `proxy.ts` -
  misma capacidad, mismo mecanismo, runtime Node.js por defecto desde
  v16.0.0 (antes Edge) - confirmado en la documentación empaquetada de
  Next (`node_modules/next/dist/docs/.../proxy.md`).
- Orden de ejecución documentado por Next: `headers` de `next.config.js`
  → `redirects` → Proxy → rutas de filesystem (estáticas incluidas). Un
  header puesto en Proxy vía `response.headers.set(...)` reemplaza,
  no duplica, cualquier header del mismo nombre ya puesto por
  `next.config.ts`.
- `header.tsx`/`footer.tsx` ya usan `<Image unoptimized>` para sus logos
  (Media de Payload) - patrón existente, no una invención de este cambio.
- `getMediaOrigin()`/`buildContentSecurityPolicy()` (`src/lib/security/
  headers.ts`) ya calculan correctamente el valor deseado; el problema es
  únicamente *cuándo* se evalúan, no la lógica en sí.

## Goals / Non-Goals

**Goals:**
- Que una imagen de Media servida desde cualquier origen S3-compatible
  configurado en runtime se muestre correctamente en el navegador, sin
  pasar por el optimizador de `next/image`.
- Que la Content-Security-Policy pública incluya el origen de Media
  correcto para el entorno de ejecución real, recalculado en cada
  petición, sin duplicar ni entrar en conflicto con los headers ya
  definidos en `next.config.ts`.
- Preservar exactamente el límite Admin/API ya existente en la política
  de headers.
- Preservar `S3_PUBLIC_URL` como variable exclusivamente de runtime - cero
  nuevos build `ARG`.

**Non-Goals:**
- No se rediseña la política de `script-src`/`style-src` ni se introducen
  nonces - la concesión `'unsafe-inline'` documentada en Fase 10
  permanece exactamente igual.
- No se migra ningún otro header o lógica a `proxy.ts` más allá de la
  única directiva (`Content-Security-Policy`) que depende de
  configuración de runtime.
- No se cambia el adaptador de Object Storage, el schema de Media de
  Payload, ni `src/lib/env/index.ts`.
- No se optimiza performance de imágenes más allá de restaurar el
  comportamiento correcto (ver Risks/Trade-offs).

## Decisions

### 1. `unoptimized` en los componentes que renderizan Media de Payload, no `images.remotePatterns`
Ya descartado por evidencia directa: `images.remotePatterns` (y
`unoptimized: false` global) queda congelado en el build de `output:
standalone`, incompatible con `S3_PUBLIC_URL` de solo-runtime. La
alternativa evaluada - convertir `S3_PUBLIC_URL` en build `ARG` - se
rechaza explícitamente por revertir un diseño ya ratificado de Fase 10 (un
mismo build debe poder apuntar a distintos hosts S3-compatibles sin
reconstruirse). `unoptimized` no tiene ninguna dependencia de build time:
el navegador solicita `src` tal cual, sin que Next necesite conocer el
host de antemano. Coincide además con el patrón ya usado por
`header.tsx`/`footer.tsx`.

Componentes a modificar (verificados contra el código real, no supuestos):
`responsive-media.tsx` (dos ramas de `<Image>`), `article-metadata.tsx`
(avatar), `author-card.tsx` (avatar), `video-feature-section.tsx`
(thumbnail), `video-player.tsx` (poster).

### 2. Detección: `unoptimized` incondicional, no un chequeo de origen en runtime
Se evaluó condicionar `unoptimized` solo cuando `src` es una URL externa
(vs. local/relativa), pero `header.tsx`/`footer.tsx` ya aplican
`unoptimized` de forma incondicional para Media de Payload, sin
distinguir backend de almacenamiento. Seguir ese mismo patrón exacto es
más simple, más consistente, y el costo (perder la reconversión de
formato/calidad de Next incluso en desarrollo con almacenamiento local)
es menor de lo que parece: Payload ya genera 5 variantes de tamaño por
imagen subida (`thumbnail/card/tablet/desktop/hero`,
`src/payload/collections/Media.ts`), y las imágenes de prueba observadas
durante la exploración ya eran WebP. No se introduce lógica nueva de
detección de origen.

### 3. CSP con Media origin: mover solo esa directiva a `proxy.ts`, no todos los headers
Alternativas evaluadas:
- **Dejar todo en `next.config.ts`** - descartada: es exactamente el
  bug, ya demostrado con el JSON congelado del build real.
- **Mover todos los headers de seguridad a `proxy.ts`** - descartada:
  innecesaria. Solo `Content-Security-Policy` depende de
  `S3_PUBLIC_URL`. `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` no dependen de ninguna variable de entorno, y
  `Strict-Transport-Security` depende de `NEXT_PUBLIC_SITE_URL`, que ya
  es un build `ARG` (`compose.prod.yaml`) - su valor resuelto en build
  time ya es el correcto para ese despliegue, sin el problema de
  `S3_PUBLIC_URL`. Moverlos igual sería reescribir código que ya
  funciona, sin necesidad, y contradice preservar la arquitectura de
  Fase 10 donde no depende de runtime.
- **Mover solo `Content-Security-Policy` a `proxy.ts`** (elegida): la
  única directiva realmente rota. `next.config.ts` deja de incluir
  `Content-Security-Policy` en el grupo de headers públicos;
  `buildContentSecurityPolicy()` (movida/exportada desde
  `src/lib/security/headers.ts`, sin cambiar su lógica de directivas) se
  invoca desde `proxy.ts` en cada petición.

### 4. Matcher de `proxy.ts`: idéntico al patrón ya usado para CSP
`export const config = { matcher: '/((?!admin|api).*)' }` - el mismo
patrón, carácter por carácter, que `buildSecurityHeaders()` ya usa hoy
para excluir Admin/API de la CSP pública. Ningún comportamiento nuevo de
enrutamiento; solo se reubica el punto de evaluación de un valor que ya
solo aplicaba a este mismo conjunto de rutas.

### 5. `proxy.ts` usa el runtime Node.js por defecto (sin `export const runtime`)
Next 16 ya hace Node.js el runtime por defecto para Proxy. No se declara
`runtime: 'edge'` en ningún lado - de por sí no es necesario, y el runtime
Node es el que permite leer `process.env.S3_PUBLIC_URL` sin restricciones
de Edge Runtime.

## Risks / Trade-offs

- **[Nota de verificación] La caché en disco de Next (`.next/cache`,
  ISR/data cache) puede seguir sirviendo una URL de Media calculada con
  un `S3_PUBLIC_URL` anterior tras reiniciar el proceso con un valor
  nuevo, si esa caché persiste entre corridas en la misma máquina -
  confirmado empíricamente al verificar la Decisión 3. No es un defecto
  del arreglo: un contenedor de producción real arranca con filesystem
  efímero (Fase 10), así que nunca hereda una caché en disco de una
  corrida anterior con otro origen. Al limpiar `.next/cache` antes de
  reiniciar con un `S3_PUBLIC_URL` distinto, tanto la URL de Media como
  la CSP reflejan correctamente el nuevo origen, confirmando la
  invariante sin reconstruir.
- **[Riesgo] `proxy.ts` en la raíz del repo es silenciosamente ignorado
  por Next cuando el proyecto usa un directorio `src/` - confirmado
  empíricamente: el build generó `middleware-manifest.json` con
  `"middleware": {}` (vacío), y la CSP no aparecía en ninguna respuesta,
  sin ningún error ni advertencia visible. La documentación de Next lo
  indica ("Create a proxy.ts file in the project root, **or inside src if
  applicable**, so that it is located at the same level as pages or
  app"), pero no lo enforcea con un error si se coloca mal.** →
  Mitigación: el archivo vive en `src/proxy.ts` (junto a `src/app`), no
  en la raíz - confirmado con una petición real contra el build de
  producción que la CSP aparece correctamente, con el origen de Media
  configurado, tras mover el archivo (`middleware-manifest.json` sigue
  reportando `{}` incluso funcionando: no es la señal correcta para
  diagnosticar esto con Turbopack en esta versión de Next).
- **[Riesgo] Next rechaza en build time una entrada de `headers()` con un
  arreglo `headers` vacío ("headers field cannot be empty for route") -
  confirmado empíricamente: retirar `Content-Security-Policy` sin más
  deja `publicPageHeaders` vacío cuando además no hay HTTPS configurado
  (sin HSTS), rompiendo `next build`.** → Mitigación:
  `buildSecurityHeaders()` omite por completo la entrada de rutas
  públicas cuando `publicPageHeaders` queda vacío, en vez de emitir un
  arreglo vacío.
- **[Riesgo] Perder la optimización automática de Next (conversión de
  formato/calidad, `srcset` generado) para toda Media de Payload, incluso
  en desarrollo con almacenamiento local.** → Mitigación: Payload ya
  genera 5 tamaños pre-calculados por imagen y la vista-modelo
  (`mapMediaToMediaData`) ya selecciona un tamaño apropiado por contexto
  (`card`, `hero`, etc.); el patrón ya existe en producción para
  `header.tsx`/`footer.tsx` sin haber sido señalado como problema. El
  impacto real se mide con Lighthouse en la Fase 11
  (`testing-qa-performance`), no se asume aquí.
- **[Riesgo] `proxy.ts` corre en cada petición pública, incluyendo rutas
  estáticas ya prerenderizadas - overhead adicional por request.** →
  Mitigación: el trabajo por petición es mínimo (leer una variable de
  entorno ya en memoria y construir un string), sin I/O ni llamadas de
  red; Proxy ya es el mecanismo que Next recomienda exactamente para este
  tipo de header dependiente de runtime.
- **[Riesgo] Dos lugares podrían intentar establecer `Content-Security-
  Policy` si la migración queda incompleta, causando un header
  duplicado/conflictivo.** → Mitigación: `next.config.ts` deja de incluir
  `Content-Security-Policy` en su arreglo de headers públicos por
  completo (no se deja un valor "de respaldo" desactualizado); un test de
  integración/E2E verifica que la respuesta contiene exactamente un
  header `Content-Security-Policy`.
- **[Trade-off] La CSP construida en runtime ya no aparece en
  `routes-manifest.json` en build time, lo que hace menos obvio auditarla
  estáticamente (p. ej. con una herramienta que solo lee artefactos de
  build).** → Aceptado: es inherente a que el valor sea correcto en
  runtime; se documenta explícitamente en `docs/DEPLOYMENT.md` para que
  quien audite sepa dónde mirar.

## Migration Plan

Cambio de código de aplicación, sin migración de datos ni cambio de
infraestructura. Orden razonable de implementación (detalle completo en
tasks.md):

1. Extraer/exportar `buildContentSecurityPolicy()` (y `getMediaOrigin()`)
   de `src/lib/security/headers.ts` de forma reutilizable, sin cambiar su
   lógica de directivas.
2. Retirar `Content-Security-Policy` del arreglo de headers públicos que
   devuelve `buildSecurityHeaders()` en `next.config.ts`; confirmar que
   `X-Content-Type-Options`/`Referrer-Policy`/`Permissions-Policy`/HSTS
   siguen intactos.
3. Crear `proxy.ts` con el matcher `/((?!admin|api).*)`, invocando la
   función reutilizada para poner `Content-Security-Policy` en la
   respuesta.
4. Añadir `unoptimized` a los 5 componentes identificados en Decisión 1.
5. Verificar contra el entorno MinIO ya construido en
   `testing-qa-performance`: imagen carga (`naturalWidth > 0`), no pasa
   por `/_next/image`, CSP de la respuesta incluye el origen MinIO real,
   un origen arbitrario no queda permitido implícitamente.
6. Verificar developer local (almacenamiento local, sin S3) sigue
   renderizando Media sin cambios.
7. Documentar en `docs/DEPLOYMENT.md` el split headers estáticos
   (`next.config.ts`) vs. CSP en runtime (`proxy.ts`) y por qué.

Rollback: revertir los archivos tocados: no hay estado persistente que
limpiar, ni migración de base de datos.

