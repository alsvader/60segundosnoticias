## 1. Verificación de versiones y bootstrap del proyecto

- [x] 1.1 Verificar contra el registro de paquetes y la matriz de compatibilidad oficial de Payload que Next.js 16.3.3, React/React-DOM 19.2.x, Payload 3.87.1 (`@payloadcms/next`, `@payloadcms/db-postgres` en la misma versión), Tailwind CSS 4.1.x y pnpm 10.x siguen siendo válidas y mutuamente compatibles; si alguna cambió o dejó de ser compatible, detener y reportar en lugar de continuar (nunca `--force`/`--legacy-peer-deps`).
- [x] 1.2 Inicializar `package.json` con pnpm y verificar que `pnpm --version` coincide con el baseline (pnpm 10.x).
- [x] 1.3 Instalar Next.js, React y React DOM en las versiones verificadas en 1.1; verificar que `package.json` y `pnpm-lock.yaml` registran exactamente esas versiones.
- [x] 1.4 Configurar `tsconfig.json` con el alias `@/* → src/*`; verificar que `pnpm tsc --noEmit` corre sin errores sobre el esqueleto inicial.

## 2. Esqueleto de Next.js (App Router)

- [x] 2.1 Crear `src/app/(frontend)/layout.tsx` y `src/app/(frontend)/page.tsx` como Server Components (sin directiva de cliente); verificar que ninguno usa `"use client"` sin una necesidad real de interactividad (AC-GEN-007).
- [x] 2.2 Crear `src/app/globals.css` y verificar que `next dev` sirve la página base sin errores en consola.
- [x] 2.3 Ejecutar el build de producción sobre el esqueleto y verificar que finaliza sin errores (AC-GEN-002).

## 3. Integración de Payload CMS + PostgreSQL

- [x] 3.1 Instalar `payload`, `@payloadcms/next` y `@payloadcms/db-postgres` en la misma versión exacta verificada en 1.1; verificar en `package.json` que las tres coinciden.
- [x] 3.2 Crear `payload.config.ts` en la raíz del proyecto con `collections: []` y `globals: []`, usando el adaptador `@payloadcms/db-postgres`; verificar que el archivo no define ninguna Collection ni Global.
- [x] 3.3 Generar las rutas requeridas por la integración oficial de Payload dentro de `src/app/(payload)/` (admin UI y endpoints REST/GraphQL); verificar que la ruta de administración carga la pantalla de login de Payload en desarrollo (AC-GEN-003, AC-GEN-008).
- [x] 3.4 Configurar `DATABASE_URI` apuntando a PostgreSQL y verificar en los logs de arranque que Payload conecta exitosamente sin errores (AC-GEN-004).
- [x] 3.5 Si el flujo estándar de Payload genera `src/payload-types.ts` al ejecutar el config, dejar que se genere de forma natural; verificar que no fue editado manualmente ni tratado como entregable independiente.

## 4. Tailwind CSS + shadcn/ui

- [x] 4.1 Instalar y configurar Tailwind CSS 4.1.x siguiendo su convención CSS-first; verificar que una clase de utilidad se aplica correctamente en la página base.
- [x] 4.2 Inicializar shadcn/ui (`components.json`) con la CLI estable actual; verificar que se genera sin errores y es compatible con la configuración de Tailwind v4.
- [x] 4.3 Agregar únicamente el primitivo mínimo necesario (p. ej. `Button`) para probar la integración end-to-end en la página base; verificar que no se ejecutó `shadcn add --all` ni se instaló un catálogo amplio de primitivos (AC-GEN-009).

## 5. Validación de variables de entorno

- [x] 5.1 Definir con Zod, en un módulo server-only (`src/lib/env/`), el schema de variables críticas (`DATABASE_URI`, `PAYLOAD_SECRET`, etc.); verificar que el módulo no es importado desde ningún código de cliente.
- [x] 5.2 Invocar la validación desde `payload.config.ts` y desde el arranque del servidor Next.js; verificar que una variable crítica faltante hace fallar el arranque/build con un mensaje explícito indicando qué configuración es inválida.
- [x] 5.3 Crear `.env.example` documentando las variables conceptuales sin valores reales; verificar que ningún archivo `.env` con valores reales queda versionado en Git.
- [x] 5.4 Confirmar que ningún secreto (`PAYLOAD_SECRET`, `DATABASE_URI`, credenciales S3) usa el prefijo `NEXT_PUBLIC_`; verificar inspeccionando el bundle de cliente generado por el build de producción.

## 6. Endpoint `/api/health`

- [x] 6.1 Crear `src/app/api/health/route.ts` que responda con el estado operativo de la aplicación; verificar con una petición HTTP local que responde estado 200 y un cuerpo que indica operatividad.
- [x] 6.2 Agregar una verificación ligera de conexión a PostgreSQL con timeout corto y manejo de errores; verificar deteniendo temporalmente el servicio de base de datos y confirmando que la respuesta refleja un estado no saludable sin filtrar la cadena de conexión ni el stack trace.
- [x] 6.3 Confirmar que la respuesta del endpoint nunca incluye `DATABASE_URI`, contraseñas, `PAYLOAD_SECRET` ni información interna de stack; verificar inspeccionando el JSON de respuesta en ambos escenarios (sano/no sano).

## 7. Docker Compose para desarrollo

- [x] 7.1 Escribir `Dockerfile` multi-stage con las etapas `base`, `deps`, `development` y `builder`; verificar que construir la etapa `development` completa sin errores.
- [x] 7.2 Escribir `compose.yaml` con servicios `app` y `db`, con `app` conectando a PostgreSQL vía `db:5432` (nunca `localhost`), y un volumen nombrado `postgres_data` para `db`; verificar inspeccionando `compose.yaml` que no aparece `localhost` como host de base de datos.
- [x] 7.3 Configurar el montaje de código fuente del servicio `app` para Fast Refresh, manteniendo `node_modules` en un volumen propio del contenedor que no sea sobrescrito por el host; verificar modificando un archivo fuente con el stack corriendo y confirmando que el cambio se refleja sin reconstruir la imagen.
- [x] 7.4 Configurar healthchecks: `pg_isready` (o equivalente) para `db` y `/api/health` para `app`; verificar que el estado de ambos servicios se reporta como saludable una vez que la aplicación está lista.
- [x] 7.5 Verificar persistencia de datos: tras `docker compose down` (sin `-v`) y `docker compose up`, confirmar que los datos de PostgreSQL siguen presentes; tras `docker compose down -v`, confirmar que el volumen se elimina (AC-GEN-005).
- [x] 7.6 Crear `.dockerignore` excluyendo `node_modules`, `.next`, `.git`, `.env`, coverage, logs y media local; verificar su contenido contra la lista mínima del Master Spec.

## 8. Validación final del change

- [x] 8.1 Ejecutar typecheck, lint y build de producción sobre el resultado completo; verificar que los tres pasan sin errores (AC-GEN-001, AC-GEN-002).
- [x] 8.2 Levantar el stack completo con `docker compose up` y confirmar manualmente que la página base renderiza, la administración de Payload carga su pantalla de login, y `/api/health` responde con estado saludable.
- [x] 8.3 Revisar la estructura de carpetas creada contra el árbol conceptual del Master Spec y contra las decisiones de `design.md`; verificar que no se crearon carpetas vacías (`src/payload/*`, `src/components/*`, `src/features/*`, etc.) ni ninguna Collection/Global de Payload.
- [x] 8.4 Ejecutar la actualización de Graphify sobre el repositorio para reflejar el nuevo código de aplicación; verificar que una consulta sobre la configuración de Payload o el bootstrap de Next.js ya encuentra nodos de código, no solo documentación.
- [x] 8.5 Reportar el estado (`PASS`/`FAIL`/`NOT TESTED`/`NOT APPLICABLE`) de los criterios de aceptación cubiertos por este change: AC-GEN-001, AC-GEN-002, AC-GEN-003, AC-GEN-004, AC-GEN-005, AC-GEN-007, AC-GEN-008, AC-GEN-009.
