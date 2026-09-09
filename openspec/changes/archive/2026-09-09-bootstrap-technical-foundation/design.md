## Context

El repositorio no contiene ninguna implementación de aplicación (confirmado vía Graphify y por inspección directa del filesystem: no existe `package.json`, `src/`, ni configuración de Next.js/Payload). Ver `proposal.md` para la motivación completa. Este documento cubre cómo construir la base técnica: qué versiones fijar, cómo estructurar los archivos iniciales, y cómo resolver los puntos donde el árbol conceptual de `docs/60-segundos-spec.md` §75 debe adaptarse porque todavía no existe contenido real para ciertas carpetas.

Restricciones ya acordadas con el usuario antes de este change:

- Baseline de versiones: Next.js 16.3.3, React/React DOM 19.2.x, Payload CMS 3.87.1 (con `@payloadcms/next` y `@payloadcms/db-postgres` en la misma versión exacta), Tailwind CSS 4.1.x, shadcn/ui (CLI estable actual), pnpm 10.x, PostgreSQL 17.x.
- Docker Compose básico (app+db) SÍ es parte de este change; el hardening completo de producción queda para Phase 10.
- No crear `src/payload/` hasta que tenga responsabilidad real; no crear Collections/Globals; no requerir `payload-types.ts` salvo que Payload lo genere naturalmente; no construir el Design System completo.

## Goals / Non-Goals

**Goals:**

- Dejar una aplicación Next.js + Payload que arranca, compila y hace build de producción sin errores (AC-GEN-001, AC-GEN-002, AC-GEN-003, AC-GEN-008).
- Conectar Payload a PostgreSQL mediante el adaptador oficial (AC-GEN-004).
- Validar variables de entorno críticas al arrancar/build, sin filtrar secretos al navegador.
- Exponer `/api/health` de forma segura y utilizable como healthcheck de Docker.
- Levantar un entorno de desarrollo reproducible vía Docker Compose (`app`+`db`) con persistencia y Fast Refresh.
- Inicializar Tailwind CSS y shadcn/ui como única capa de primitivos (AC-GEN-009), sin construir el Design System editorial.
- Dejar la estructura mínima de carpetas necesaria para que Phase 2 (Payload CMS Core) tenga dónde añadir Collections sin reestructurar lo ya creado.

**Non-Goals:**

- Cualquier Payload Collection o Global (Phase 2/6).
- El Design System editorial completo — tokens de color por categoría, tipografía Oswald/Inter, componentes editoriales (Phase 4).
- Cualquier ruta pública de contenido (`/[slug]`, `/[category]/[post]`, `/buscar`) (Phase 5/7/9).
- Pipeline de CI (`.github/workflows/ci.yml`): requiere tests/lint reales para tener valor; se aborda en Phase 11 junto con Testing/QA, no aquí.
- Hardening completo de producción (headers de seguridad, `runner` no-root verificado, `noindex` de staging, backups) — Phase 10.
- Seeds (`seed:initial`, `seed:dev`) — Phase 3, dependen de Collections que no existen todavía.

## Decisions

### D1. Baseline de versiones fijado explícitamente
Se fija el baseline aprobado por el usuario (Next.js 16.3.3 / React 19.2.x / Payload 3.87.1 / Tailwind 4.1.x / pnpm 10.x / PostgreSQL 17.x) en lugar de dejar la selección abierta durante la implementación.

**Alternativa considerada:** resolver versiones durante `tasks.md`/implementación. Rechazada porque el baseline ya fue decidido explícitamente por el usuario en la sesión de exploración previa; fijarlo aquí evita que la implementación reabra una decisión ya tomada.

**Regla de implementación:** antes de instalar, verificar cada versión contra el registro de paquetes y la matriz de compatibilidad oficial de Payload. Si alguna versión cambió o dejó de ser compatible, detener e informar — nunca forzar con `--force` o `--legacy-peer-deps`. Todos los paquetes `payload`/`@payloadcms/*` deben compartir la misma versión exacta.

### D2. Alcance de Docker: dev ahora, hardening en Phase 10
Se incluye en este change: `Dockerfile` multi-stage con etapas `base`, `deps`, `development` y `builder`; `compose.yaml` con servicios `app`+`db`; volumen nombrado `postgres_data`; healthchecks (`pg_isready` para `db`, `/api/health` para `app`); montaje de fuente para Fast Refresh.

**Alternativa considerada:** diferir todo Docker a Phase 10 (Docker + Production Hardening). Rechazada porque §3/§64 del Master Spec y `AC-GEN-005` esperan Docker Compose funcional desde desarrollo temprano, y el usuario confirmó explícitamente este alcance.

**No incluido aquí:** etapa `runner` de producción endurecida (non-root verificado, headers de seguridad, `.dockerignore` de producción auditado) — eso es Phase 10.

### D3. Validación de entorno con Zod, fallo temprano
Se usa Zod (sugerido explícitamente en §65: "Puede usarse Zod o equivalente") para definir un schema de variables críticas (`DATABASE_URI`, `PAYLOAD_SECRET`, etc.) en un módulo server-only (`src/lib/env/`), invocado tanto por `payload.config.ts` como por el arranque del servidor Next.js, de forma que un valor faltante o inválido falle explícitamente al arrancar/hacer build en vez de fallar más tarde en runtime.

**Alternativa considerada:** validar únicamente dentro de cada route handler que use una variable. Rechazada porque no cumple "validar al arrancar/build" (§65) y permitiría que la app arranque en un estado inconsistente.

### D4. `payload.config.ts` en la raíz del proyecto; sin `src/payload/` todavía
Siguiendo la convención estándar de Payload 3.x, `payload.config.ts` vive en la raíz del proyecto con `collections: []` y `globals: []` vacíos. No se crean las subcarpetas `src/payload/{collections,globals,blocks,fields,access,hooks,utilities,migrations}/` en este change.

**Alternativa considerada:** crear el árbol completo de `src/payload/` vacío, tal como aparece en el árbol conceptual de §75, para "dejarlo listo". Rechazada explícitamente por el usuario y por la regla general del Master Spec de no crear carpetas vacías sin contenido (§76); Phase 2 crea estas carpetas cuando añada las primeras Collections reales.

Las rutas de Payload dentro de `src/app/(payload)/` (admin UI, endpoints REST/GraphQL) sí se crean en este change porque las genera el propio instalador/integración oficial de Payload para Next.js — son plomería necesaria para que Payload funcione dentro de la misma aplicación (AC-GEN-003), no "arquitectura futura".

### D5. `payload-types.ts` como efecto natural, no como entregable
No se trata la generación de tipos de Payload como una tarea explícita a construir; si el flujo estándar de Payload (`payload generate:types` o equivalente integrado en el dev/build) produce `src/payload-types.ts` como parte de tener `payload.config.ts` funcionando, se deja que ocurra de forma natural (aunque su contenido sea mínimo al no haber Collections). No se edita manualmente.

### D6. shadcn/ui: inicializar, agregar solo el primitivo mínimo necesario
Se ejecuta la inicialización de shadcn/ui (`components.json`, configuración con Tailwind v4) y se agrega únicamente el primitivo mínimo necesario para verificar que la integración funciona end-to-end (por ejemplo, un botón en la página base), en vez de instalar un catálogo amplio de primitivos.

**Alternativa considerada:** ejecutar `shadcn add --all` para adelantar Phase 4. Rechazada explícitamente por §56.1 ("Agregar incrementalmente, no `shadcn add --all`").

### D7. `/api/health` incluye una verificación ligera de PostgreSQL
El endpoint reporta estado operativo general y, adicionalmente, intenta una verificación ligera de conexión a PostgreSQL (p. ej. una consulta trivial) envuelta en manejo de errores, de modo que un problema real de base de datos se refleje en el healthcheck sin exponer detalles internos (mensaje de error, connection string, stack).

**Alternativa considerada:** reportar únicamente "el proceso está vivo" sin tocar la base de datos. Rechazada porque el healthcheck de Docker para `app` pierde valor de diagnóstico si no refleja la dependencia real (PostgreSQL) durante `docker compose up`.

### D8. `node_modules` en un volumen propio dentro del contenedor de desarrollo
El código fuente se monta desde el host para Fast Refresh, pero `node_modules` vive en un volumen (nombrado o anónimo) propio del contenedor, nunca sobrescrito por el `node_modules` del host, para evitar que binarios nativos compilados en macOS reemplacen los compilados para Linux dentro del contenedor (§64.4).

## Risks / Trade-offs

- **[Riesgo]** Las versiones fijadas (Next.js 16.3.3, Payload 3.87.1, etc.) pueden haber cambiado o quedar fuera de la matriz de compatibilidad oficial de Payload entre esta decisión y el momento de instalar. → **[Mitigación]** Verificación obligatoria contra el registro de paquetes antes de instalar (D1); detener e informar en vez de forzar peer dependencies.
- **[Riesgo]** El soporte de shadcn/ui para Tailwind CSS v4 (config CSS-first, sin `tailwind.config.ts` por defecto) depende de la versión de CLI usada en el momento de inicializar. → **[Mitigación]** Usar la versión estable actual del CLI de shadcn y confirmar que el archivo generado corresponde a convenciones de Tailwind v4 antes de continuar.
- **[Riesgo]** El healthcheck con verificación de PostgreSQL añade una dependencia externa a la respuesta de `/api/health`; una demora de red podría hacer más lento el healthcheck. → **[Mitigación]** Verificación ligera con timeout corto; un fallo de DB reporta "unhealthy" de forma controlada, no bloquea indefinidamente.
- **[Riesgo]** File watching para Fast Refresh sobre bind mounts puede ser poco fiable en macOS/Docker Desktop. → **[Mitigación]** Documentar en `compose.yaml` la variable de fallback a polling (`WATCHPACK_POLLING` o equivalente de Next.js) por si el hot reload nativo no detecta cambios.
- **[Riesgo]** Placer `payload.config.ts` en la raíz sin `src/payload/` es una desviación explícita del árbol literal de §75. → **[Mitigación]** Documentada aquí como decisión (D4) autorizada explícitamente por el usuario; Phase 2 reconcilia la estructura al añadir las primeras Collections.

## Migration Plan

Este change es greenfield: no existe aplicación ni datos previos que migrar. El "despliegue" es simplemente que el repositorio pase de no tener código de aplicación a tener el esqueleto descrito. No aplica estrategia de rollback de datos; revertir el change equivale a revertir los commits de esta implementación, ya que no hay estado persistente de producción todavía.
