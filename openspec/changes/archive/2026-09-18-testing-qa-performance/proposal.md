## Why

El proyecto llegó al final de la Fase 10 (Docker + Production Hardening) sin ninguna
infraestructura de pruebas: no existe `vitest`, `playwright`, `axe`, `lighthouse` ni
CI de ningún tipo. Toda la verificación de Fase 10 (build de Docker, migraciones,
seguridad, health check) fue manual. El propio incidente de Fase 10 (Navigation,
Footer y SiteSettings ausentes de la cadena de migraciones, detectado solo por
revisión manual) demuestra que el proyecto necesita ahora una red de seguridad
automatizada antes de seguir avanzando: acceso/roles, ciclo de vida de
borrador/publicación, redirecciones, búsqueda, preview, caché/revalidación y el
runtime de producción no tienen ninguna cobertura de regresión.

La Fase 11 — Testing + QA + Performance (`docs/60-segundos-spec.md`, sección
"Phase 11") existe exactamente para cerrar esa brecha: construir la
infraestructura de pruebas y CI, y verificar sistemáticamente comportamiento ya
implementado en Fases 2-10 (AC-PERM-*, AC-A11Y-*, AC-SEC-*, AC-DOCKER-*, AC-DB-*,
AC-SEARCH-*, AC-SEO-*, AC-PERF-*, AC-RESP-*, entre otros) que hoy no tiene ninguna
prueba automatizada.

## What Changes

- Introduce el stack mínimo de pruebas: Vitest (unit + integración Payload/Postgres),
  React Testing Library (solo para los islands cliente con lógica de estado real:
  `HeaderSearch`, `ShareActions`, wrappers de embeds), Playwright (E2E, QA
  responsive, regresión visual selectiva), `@axe-core/playwright` (accesibilidad
  automatizada), Lighthouse/Lighthouse CI (presupuestos de performance).
- Construye una base de datos Postgres desechable para pruebas de integración,
  inicializada siempre vía la cadena de migraciones versionada (nunca `push`), con
  un guard explícito que impide ejecutar reset/drop contra la DB de desarrollo o
  producción.
- Automatiza la regresión de la cadena de migraciones (Postgres vacío → migraciones
  completas → Globals/Collections operables → aplicación puede arrancar) para
  evitar que se repita el vacío de Navigation/Footer/SiteSettings descubierto en
  Fase 10.
- Añade pruebas de integración contra el Local API real de Payload para control de
  acceso (Admin/Writer/Anónimo), ciclo de vida de borrador/publicación,
  redirecciones (incluyendo aplanado de cadenas y protección contra ciclos),
  sincronización de búsqueda (preservando las limitaciones documentadas de V1,
  como la insensibilidad a acentos) y autorización de preview (incluyendo la
  protección anti-open-redirect).
- Añade un conjunto pequeño y crítico de journeys E2E en Playwright (lectura
  pública, búsqueda, navegación móvil, página CMS, 404, redirección legacy,
  preview, smoke de Admin).
- Añade regresión visual selectiva (Home, Article, HeaderSearch expandido,
  MobileNav abierto) usando las capturas nativas de Playwright — sin introducir
  Percy/Chromatic.
- Añade un smoke test de producción contra `compose.prod.yaml` (Postgres
  desechable → migrator → runner no-root → `/api/health` → rutas públicas
  representativas → login de Admin alcanzable).
- Establece presupuestos de calidad/performance como quality gates del proyecto:
  Lighthouse Performance ≥85, Accessibility ≥95, Best Practices ≥95, SEO ≥95; LCP
  de laboratorio ≤2.5s; CLS ≤0.10; TBT ≤200ms, medidos contra build de producción
  (mediana de 3 corridas), sobre Home, una Category poblada, un Article
  representativo, una Page representativa y `/buscar` con resultados
  deterministas. Un Article con embeds de terceros se audita pero es diagnóstico,
  no gate duro.
- Introduce CI en GitHub Actions (`.github/workflows/`) con tres niveles: FAST
  (typecheck/lint/unit/component), PR (+ build, integración Payload/Postgres,
  regresión de migraciones, E2E crítico en Chromium, accesibilidad automatizada) y
  FULL en main/release (+ matriz de navegadores, smoke de Docker de producción,
  migración-desde-cero, Lighthouse, regresión visual seleccionada).
- Añade `docs/TESTING.md` documentando capas de prueba, comandos, el guard de
  seguridad de la DB de pruebas, setup de E2E, smoke de producción, Lighthouse,
  checklist de QA manual, niveles de CI y las limitaciones de V1 que las pruebas
  deben preservar (no "arreglar").

## Capabilities

### New Capabilities
- `test-infrastructure`: Vitest, fixtures de prueba, guard de seguridad de la DB
  de pruebas, comandos de test, y el scaffolding base de CI en GitHub Actions.
- `cms-integration-testing`: pruebas de integración Payload + Postgres desechable
  — control de acceso, borrador/publicación, redirecciones, búsqueda, preview,
  invalidación de caché — y la regresión automatizada de la cadena de
  migraciones.
- `quality-and-performance`: Playwright (E2E, QA responsive, regresión visual
  selectiva), accesibilidad automatizada con axe, presupuestos de Lighthouse/Core
  Web Vitals de laboratorio, y el smoke test de Docker de producción.

### Modified Capabilities
Ninguna. La Fase 11 verifica comportamiento ya especificado y construido en fases
anteriores; no cambia ningún requisito de producto existente en `openspec/specs/`.

## Impact

- **Código nuevo (sin tocar código de producción)**: configuración de Vitest,
  Playwright, Lighthouse CI; fixtures y helpers de prueba; scripts de test DB
  (creación/reset con guard de seguridad); workflows de GitHub Actions.
- **Dependencias nuevas (solo devDependencies)**: `vitest`,
  `@testing-library/react`, `@testing-library/user-event`, `@playwright/test`,
  `@axe-core/playwright`, `lighthouse`/`@lhci/cli`. Ningún cambio a dependencias
  de producción.
- **Infraestructura**: una base de datos Postgres desechable adicional (rol
  nuevo junto a dev/migración-manual/producción, documentado en
  `docs/TESTING.md`); ningún emulador S3 (se usa el fallback a almacenamiento
  local de Media que ya existe en el adaptador).
- **CI/CD**: primer pipeline de CI del repositorio (`.github/workflows/`); no
  existía ninguno antes.
- **Fuera de alcance de esta Fase** (explícito, para no expandir alcance
  silenciosamente): aprovisionamiento real de hosting/DNS/dominio, credenciales
  reales de S3/R2 en CI, verificación contra el proveedor de object storage real,
  monitoreo sintético, RUM/Core Web Vitals de campo, analítica, load testing a
  escala de internet, y penetration testing como servicio — todo eso permanece en
  la Fase 12 o fuera del roadmap actual según `docs/60-segundos-spec.md`.
- **No se modifica** ningún comportamiento de producto, ninguna regla de acceso,
  ningún endpoint público, ni el Master Specification.
